"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n) => String(n).padStart(2, "0");

// Dates are kept as "YYYY-MM-DD" strings so no timezone shifts creep in
const toISO = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

const parseISO = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
  return match
    ? { year: +match[1], month: +match[2] - 1, day: +match[3] }
    : null;
};

const todayParts = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
};

export default function DatePicker({
  value,
  onChange,
  max,
  minYear = 1900,
  placeholder = "DD/MM/YYYY",
  className = "",
}) {
  const selected = parseISO(value);
  const limit = parseISO(max);
  const today = todayParts();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() =>
    selected
      ? { year: selected.year, month: selected.month }
      : { year: today.year, month: today.month },
  );
  const rootRef = useRef(null);

  // Close on a click outside the picker or on Escape
  useEffect(() => {
    if (!open) return;
    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const maxYear = limit ? limit.year : today.year + 10;
  const years = [];
  for (let year = maxYear; year >= minYear; year--) years.push(year);

  const isMonthAfterMax = (year, month) =>
    !!limit &&
    (year > limit.year || (year === limit.year && month > limit.month));

  const isDayAfterMax = (day) =>
    !!limit && toISO(view.year, view.month, day) > toISO(limit.year, limit.month, limit.day);

  const showMonth = (year, month) => {
    // Never land on a month that is entirely after the limit
    if (limit && isMonthAfterMax(year, month)) {
      setView({ year: limit.year, month: limit.month });
    } else {
      setView({ year, month });
    }
  };

  const shiftMonth = (delta) => {
    const date = new Date(view.year, view.month + delta, 1);
    showMonth(date.getFullYear(), date.getMonth());
  };

  const openPicker = () => {
    if (!open && selected) setView({ year: selected.year, month: selected.month });
    setOpen((current) => !current);
  };

  const selectDay = (day) => {
    onChange(toISO(view.year, view.month, day));
    setOpen(false);
  };

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevDisabled = view.year === minYear && view.month === 0;
  const nextDisabled = isMonthAfterMax(
    view.month === 11 ? view.year + 1 : view.year,
    (view.month + 1) % 12,
  );

  const display = selected
    ? `${pad(selected.day)}/${pad(selected.month + 1)}/${selected.year}`
    : "";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${className} flex items-center justify-between text-left cursor-pointer`}
      >
        <span className={display ? "text-gray-900" : "text-gray-300"}>
          {display || placeholder}
        </span>
        <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="absolute right-0 top-full mt-2 z-50 w-[18rem] max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-gray-200 shadow-xl font-poppins"
        >
          <div className="p-3">
            {/* Month and year selects */}
            <div className="flex gap-2">
              <select
                value={view.month}
                onChange={(e) => showMonth(view.year, Number(e.target.value))}
                aria-label="Month"
                className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MONTHS.map((name, index) => (
                  <option
                    key={name}
                    value={index}
                    disabled={isMonthAfterMax(view.year, index)}
                  >
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={view.year}
                onChange={(e) => showMonth(Number(e.target.value), view.month)}
                aria-label="Year"
                className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month heading with arrows */}
            <div className="flex items-center justify-between mt-3 mb-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                disabled={prevDisabled}
                aria-label="Previous month"
                className="p-1 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gray-900">
                {MONTHS[view.month]} {view.year}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                disabled={nextDisabled}
                aria-label="Next month"
                className="p-1 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday names */}
            <div className="grid grid-cols-7 text-center text-[11px] font-medium text-gray-500 mb-1">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday} className="py-1">
                  {weekday}
                </span>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-y-0.5 text-center">
              {cells.map((day, index) => {
                if (!day) return <span key={`blank-${index}`} />;

                const isSelected =
                  selected &&
                  selected.year === view.year &&
                  selected.month === view.month &&
                  selected.day === day;
                const isToday =
                  today.year === view.year &&
                  today.month === view.month &&
                  today.day === day;
                const disabled = isDayAfterMax(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectDay(day)}
                    disabled={disabled}
                    className={`mx-auto w-8 h-8 rounded-full text-xs transition-colors ${
                      isSelected
                        ? "bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white font-semibold"
                        : disabled
                          ? "text-gray-300 cursor-not-allowed"
                          : isToday
                            ? "text-[#0575E6] font-semibold cursor-pointer hover:bg-[#0575E614]"
                            : "text-gray-900 cursor-pointer hover:bg-[#0575E614]"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs">
            <button
              type="button"
              onClick={() => showMonth(today.year, today.month)}
              className="text-[#0575E6] font-medium cursor-pointer hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-500 cursor-pointer hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
