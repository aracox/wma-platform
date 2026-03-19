const fs = require('fs');

const csv = fs.readFileSync('data/re01_9112566tambon.csv', 'utf8');
const lines = csv.split('\n');

const laosMap = new Map();

// Skip header (i=0)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Simple CSV split (assuming no quoted commas in this dataset based on visual inspection)
  const cols = line.split(',');
  if (cols.length < 13) continue;

  const id = cols[3];
  if (!laosMap.has(id)) {
    laosMap.set(id, {
      id: id,
      province: cols[0],
      district: cols[1],
      subdistrict: cols[2], // Usually the main one
      type: cols[4],
      name: cols[5],
      address: cols[6],
      moo: cols[7],
      zipcode: cols[8],
      area: cols[9],
      lat: parseFloat(cols[10]) || 0,
      lng: parseFloat(cols[11]) || 0,
      website: cols[12]
    });
  }
}

const laosArray = Array.from(laosMap.values());
fs.writeFileSync('src/data/laos.json', JSON.stringify(laosArray, null, 2));

console.log("Parsed " + laosArray.length + " unique LAOs from " + (lines.length - 1) + " rows.");
