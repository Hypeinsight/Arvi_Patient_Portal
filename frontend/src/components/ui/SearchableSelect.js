"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";

export default function SearchableSelect({
  value,
  onSelect,
  onSearch,
  getOptionLabel = (item) => item.name,
  getOptionValue = (item) => item.id,
  placeholder = "Search...",
  disabledPlaceholder = "Unavailable",
  disabled = false,
  error,
  minChars = 2,
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled || value) return;
    if (query.trim().length < minChars) {
      setOptions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await onSearch(query.trim());
        if (!cancelled) setOptions(results || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, disabled, value, minChars, onSearch]);

  const fieldClass = `w-full px-4 py-2 border rounded-lg text-sm font-poppins focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300 ${
    error ? "border-red-500" : "border-gray-300"
  } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`;

  if (value) {
    return (
      <div className="relative">
        <input
          type="text"
          readOnly
          value={getOptionLabel(value)}
          className={`${fieldClass} pr-9 cursor-default`}
        />
        <button
          type="button"
          onClick={() => {
            onSelect(null);
            setQuery("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder={disabled ? disabledPlaceholder : placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={fieldClass}
        autoComplete="off"
      />
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      )}
      {open && !disabled && query.trim().length >= minChars && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg no-scrollbar">
          {loading ? (
            <li className="px-4 py-2 text-sm text-gray-400 font-poppins">Searching…</li>
          ) : options.length ? (
            options.map((option) => (
              <li
                key={getOptionValue(option)}
                onClick={() => {
                  onSelect(option);
                  setQuery("");
                  setOpen(false);
                }}
                className="px-4 py-2 text-sm font-poppins text-gray-800 hover:bg-blue-50 cursor-pointer"
              >
                {getOptionLabel(option)}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-gray-400 font-poppins">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}
