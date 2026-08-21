"use client";
import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const THAI_DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const BUDDHIST_ERA_OFFSET = 543;

interface ThaiDatePickerProps {
  value: string; // "YYYY-MM-DD" Gregorian, or ""
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

// Stores/emits a plain Gregorian "YYYY-MM-DD" string (same shape a native
// <input type="date"> would give), but renders and navigates entirely in
// Thai month names + Buddhist Era years - native date inputs can't be
// localized this way since the picker UI is drawn by the browser/OS.
export default function ThaiDatePicker({ value, onChange, className, placeholder = "เลือกวันที่" }: ThaiDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(`${value}T00:00:00`) : null;
  const today = new Date();
  const [viewYear, setViewYear] = useState(selected ? selected.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected ? selected.getMonth() : today.getMonth());

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const openPicker = () => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
    setOpen((o) => !o);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

  const displayText = selected
    ? `${selected.getDate()} ${THAI_MONTHS[selected.getMonth()]} ${selected.getFullYear() + BUDDHIST_ERA_OFFSET}`
    : placeholder;

  const selectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button type="button" onClick={openPicker} className={className}>
        <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <span className={selected ? "text-slate-800" : "text-slate-400"}>{displayText}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={goPrevMonth} className="p-1.5 rounded-lg hover:bg-slate-100">
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <span className="text-sm font-bold text-primary-800">
              {THAI_MONTHS[viewMonth]} {viewYear + BUDDHIST_ERA_OFFSET}
            </span>
            <button type="button" onClick={goNextMonth} className="p-1.5 rounded-lg hover:bg-slate-100">
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-1">
            {THAI_DAYS.map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {Array.from({ length: firstWeekday }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = !!selected
                && selected.getFullYear() === viewYear
                && selected.getMonth() === viewMonth
                && selected.getDate() === day;
              const isToday = today.getFullYear() === viewYear
                && today.getMonth() === viewMonth
                && today.getDate() === day;
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => selectDay(day)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-colors",
                    isSelected
                      ? "bg-primary-600 text-white font-bold"
                      : isToday
                        ? "border border-primary-300 text-primary-700 font-semibold hover:bg-primary-50"
                        : "text-slate-700 hover:bg-primary-50"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
