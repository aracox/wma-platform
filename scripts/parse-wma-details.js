// Builds src/data/wmaFacilityDetails.json from the WMA general-info workbook
// ("ข้อมูลทั่วไป ให้พี่เล็ก.xlsx"), keyed by the wma-0NN ids already used in
// src/data/wmaFacilities.json.
//
//   node scripts/parse-wma-details.js "/path/to/ข้อมูลทั่วไป ให้พี่เล็ก.xlsx"
//
// The workbook is not in the repo (it lives on an external drive), so this is
// run by hand when a new revision arrives — same convention as parse-laos.js.
// No xlsx dependency: .xlsx is a zip of XML, unzipped here with the `unzip` CLI.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const SRC = process.argv[2];
const OUT = "src/data/wmaFacilityDetails.json";
const FACILITIES = "src/data/wmaFacilities.json";

if (!SRC || !fs.existsSync(SRC)) {
  console.error("Usage: node scripts/parse-wma-details.js <workbook.xlsx>");
  process.exit(1);
}

// --- minimal xlsx reader -----------------------------------------------------

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wma-xlsx-"));
execFileSync("unzip", ["-o", "-q", SRC, "-d", tmp]);
const readXml = (p) => fs.readFileSync(path.join(tmp, p), "utf8");

// Shared strings: every <si> is one string, possibly split across <t> runs.
const sharedStrings = [...readXml("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map(
  ([, si]) => [...si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(([, t]) => t).join("")
);

const unescapeXml = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
   .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
   .replace(/&amp;/g, "&");

// "AB12" -> 27 (0-based column index)
function colIndex(ref) {
  const letters = ref.match(/^([A-Z]+)/)[1];
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

// Returns rows as { rowNumber: { colIndex: value } }
function sheetRows(file) {
  const rows = {};
  for (const [, rowNum, body] of readXml(file).matchAll(/<row[^>]*\sr="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = {};
    // The self-closing form must be tried first: an empty <c r="I4"/> would
    // otherwise match the open-tag branch and swallow the next cell's <v>,
    // shifting every column after it.
    for (const [, attrs, inner] of body.matchAll(/<c\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const ref = attrs.match(/r="([A-Z]+\d+)"/);
      if (!ref) continue;
      const isShared = /t="s"/.test(attrs);
      const v = inner && inner.match(/<v>([\s\S]*?)<\/v>/);
      const inlineStr = inner && [...(inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g) || [])].map(([, t]) => t).join("");
      let value = "";
      if (isShared && v) value = sharedStrings[+v[1]] || "";
      else if (inlineStr) value = inlineStr;
      else if (v) value = v[1];
      cells[colIndex(ref[1])] = unescapeXml(value).trim();
    }
    rows[+rowNum] = cells;
  }
  return rows;
}

// Sheet order follows workbook.xml <sheets> -> rels target, resolved here so a
// re-saved workbook that reorders the parts still maps correctly.
const rels = Object.fromEntries(
  [...readXml("xl/_rels/workbook.xml.rels").matchAll(/Id="([^"]+)"[^>]*Target="(worksheets\/[^"]+)"/g)]
    .map(([, id, target]) => [id, "xl/" + target])
);
const sheetFileByName = Object.fromEntries(
  [...readXml("xl/workbook.xml").matchAll(/<sheet name="([^"]+)"[^>]*r:id="([^"]+)"/g)]
    .map(([, name, rid]) => [name, rels[rid]])
);

// --- extract the two sheets --------------------------------------------------

const CONTACT_SHEET = "ข้อมูลทั่วไป";
const AMENITY_SHEET = "ข้อมูลทั่วไปให้พี่เล็ก";

const num = (s) => {
  const n = parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

// Data starts at row 4; rows with an empty ลำดับ but a value in ชื่อพื้นที่
// that names a system are section headers carrying the system for the rows
// beneath them.
function collect(sheetName, map) {
  const rows = sheetRows(sheetFileByName[sheetName]);
  const out = [];
  let currentSystem = "";
  for (const rowNum of Object.keys(rows).map(Number).sort((a, b) => a - b)) {
    if (rowNum < 3) continue;
    const c = rows[rowNum];
    const g = (i) => c[i] || "";
    if (!g(0) && g(1) && g(1).includes("ระบบ")) {
      currentSystem = g(1);
      continue;
    }
    if (!g(1)) continue;
    out.push(map(g, currentSystem));
  }
  return out;
}

const contactRows = collect(CONTACT_SHEET, (g, system) => ({
  name: g(1),
  abbr: g(2),
  system: g(3) || system,
  address: g(4),
  coord: g(5),
  contactName: g(6),
  phone: g(7),
  phone2: g(8),
  email: g(9),
  capacityPcd: num(g(10)),
  capacity: num(g(11)),
}));

// Co-use amenity flags live only on the second sheet (cols H..M).
const AMENITY_KEYS = ["underground", "park", "golf", "exerciseYard", "futsal", "aquarium"];
const amenityRows = collect(AMENITY_SHEET, (g) => ({
  name: g(1),
  amenities: AMENITY_KEYS.filter((_, i) => g(7 + i)),
}));
const amenitiesByName = new Map(amenityRows.map((r) => [r.name.replace(/\s+/g, ""), r.amenities]));

// --- join onto the map's facilities -----------------------------------------

const parseCoord = (s) => {
  const m = String(s).replace(/,/g, " ").match(/-?\d+\.\d+/g);
  return m && m.length >= 2 ? { lat: +m[0], lng: +m[1] } : null;
};

const PREFIXES = [
  "เทศบาลนคร", "เทศบาลเมือง", "เทศบาลตำบล",
  "องค์การบริหารส่วนตำบล", "อบต.", "ทน.", "ทม.", "ทต.",
];
// Strip the LAO-type prefix so "ทม.พะเยา" and "เทศบาลเมืองพะเยา" compare equal.
const core = (s) => {
  let out = String(s).replace(/\s+/g, "");
  for (const p of PREFIXES) out = out.split(p).join("");
  return out;
};

const KM_PER_DEG = 111;
const distanceKm = (a, b) => {
  const dLat = (a.lat - b.lat) * KM_PER_DEG;
  const dLng = (a.lng - b.lng) * KM_PER_DEG * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
};

const facilities = JSON.parse(fs.readFileSync(FACILITIES, "utf8"));
const MAX_MATCH_KM = 3;

const details = {};
const unmatched = [];
const usedRows = new Set();

for (const f of facilities) {
  const facilityCore = core(f.orgName || f.title);
  let best = null;

  for (const row of contactRows) {
    const rowCore = core(row.name);
    const nameHit = rowCore === facilityCore || rowCore.includes(facilityCore) || facilityCore.includes(rowCore);
    const coord = parseCoord(row.coord);
    const km = coord ? distanceKm({ lat: f.lat, lng: f.lng }, coord) : Infinity;
    if (!nameHit && !(km <= MAX_MATCH_KM)) continue;
    // Prefer a name hit; break ties by distance.
    const rank = [nameHit ? 0 : 1, km];
    if (!best || rank[0] < best.rank[0] || (rank[0] === best.rank[0] && rank[1] < best.rank[1])) {
      best = { row, rank };
    }
  }

  if (!best) {
    unmatched.push(f.orgName || f.title);
    continue;
  }

  usedRows.add(best.row);
  const r = best.row;
  details[f.id] = {
    abbr: r.abbr || null,
    system: r.system || null,
    address: r.address || null,
    capacity: r.capacity,
    capacityPcd: r.capacityPcd,
    contactName: r.contactName || null,
    phones: [r.phone, r.phone2].filter(Boolean),
    email: r.email || null,
    amenities: amenitiesByName.get(r.name.replace(/\s+/g, "")) || [],
    matchedBy: best.rank[0] === 0 ? "name" : "coord",
    matchDistanceKm: Number.isFinite(best.rank[1]) ? +best.rank[1].toFixed(3) : null,
  };
}

fs.writeFileSync(OUT, JSON.stringify(details, null, 1) + "\n");

const extras = contactRows.filter((r) => !usedRows.has(r)).map((r) => r.name);
console.log(`matched ${Object.keys(details).length}/${facilities.length} facilities -> ${OUT}`);
if (unmatched.length) console.log(`no workbook row for: ${unmatched.join(", ")}`);
console.log(`workbook rows with no map pin (${extras.length}): ${extras.join(", ")}`);
fs.rmSync(tmp, { recursive: true, force: true });
