import { WaterQualitySensor } from "@/types";

export const SENSORS: WaterQualitySensor[] = [
  { id: "s01", name: "สถานีตรวจวัดแม่น้ำเจ้าพระยา (บางกอกน้อย)", province: "กรุงเทพมหานคร", lat: 13.7694, lng: 100.4887, level: "fair", bod: 12.4, cod: 48.2, ph: 7.1, tss: 38.5, timestamp: "2026-03-18T06:00:00Z" },
  { id: "s02", name: "สถานีตรวจวัดแม่น้ำเจ้าพระยา (สะพานพระราม 8)", province: "กรุงเทพมหานคร", lat: 13.7725, lng: 100.5056, level: "poor", bod: 22.1, cod: 89.4, ph: 6.8, tss: 65.2, timestamp: "2026-03-18T06:00:00Z" },
  { id: "s03", name: "สถานีตรวจวัดคลองแสนแสบ (มีนบุรี)", province: "กรุงเทพมหานคร", lat: 13.8012, lng: 100.7012, level: "critical", bod: 48.3, cod: 195.2, ph: 6.2, tss: 112.4, timestamp: "2026-03-18T06:00:00Z" },
  { id: "s04", name: "สถานีตรวจวัดแม่น้ำปิง (เชียงใหม่)", province: "เชียงใหม่", lat: 18.7950, lng: 98.9900, level: "good", bod: 4.2, cod: 18.5, ph: 7.4, tss: 15.3, timestamp: "2026-03-18T06:00:00Z" },
  { id: "s05", name: "สถานีตรวจวัดแม่น้ำมูล (อุบลราชธานี)", province: "อุบลราชธานี", lat: 15.2448, lng: 104.8472, level: "excellent", bod: 1.8, cod: 8.2, ph: 7.6, tss: 8.1, timestamp: "2026-03-18T06:00:00Z" },
  { id: "s06", name: "สถานีตรวจวัดคลองอู่ตะเภา (หาดใหญ่)", province: "สงขลา", lat: 7.0200, lng: 100.4600, level: "fair", bod: 11.5, cod: 42.0, ph: 7.0, tss: 28.9, timestamp: "2026-03-18T06:00:00Z" },
  { id: "s07", name: "สถานีตรวจวัดอ่าวพัทยา", province: "ชลบุรี", lat: 12.9350, lng: 100.8780, level: "good", bod: 5.1, cod: 21.4, ph: 7.5, tss: 18.7, timestamp: "2026-03-18T06:00:00Z" },
  { id: "s08", name: "สถานีตรวจวัดแม่น้ำท่าจีน (สุพรรณบุรี)", province: "สุพรรณบุรี", lat: 14.4695, lng: 100.1176, level: "poor", bod: 19.8, cod: 76.5, ph: 6.6, tss: 58.3, timestamp: "2026-03-18T06:00:00Z" },
];
