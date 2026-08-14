import { SystemStatus } from "@/types";

export const STATUS_COLORS: Record<SystemStatus, string> = {
  operational:        "#43A047",
  non_operational:    "#E53935",
  construction:       "#FFC107",
  cancelled:          "#90A4AE",
  under_maintenance:  "#FB8C00",
  temporarily_closed: "#8E24AA",
};

export const STATUS_LABELS: Record<SystemStatus, string> = {
  operational:        "เปิดใช้งาน",
  non_operational:    "ปิดใช้งาน",
  construction:       "กำลังก่อสร้าง",
  cancelled:          "ยกเลิก",
  under_maintenance:  "อยู่ระหว่างซ่อมบำรุง",
  temporarily_closed: "ปิดปรับปรุงชั่วคราว",
};

export const ALL_STATUSES = Object.keys(STATUS_LABELS) as SystemStatus[];
