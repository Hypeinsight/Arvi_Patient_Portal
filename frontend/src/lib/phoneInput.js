// Formats an Australian number as "0412 345 678", capped at 10 digits
export function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length > 7)
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  if (digits.length > 4) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return digits;
}

// Formats a phone <input>'s current value. Reformatting changes the value, so
// React would put the cursor at the end; this also returns where the cursor
// should go to stay after the same digit, for editing in the middle.
export function formatPhoneInput(input) {
  const { value, selectionStart } = input;
  const digitsBeforeCursor = value
    .slice(0, selectionStart ?? value.length)
    .replace(/\D/g, "").length;

  const formatted = formatPhone(value);
  let cursor = 0;
  let seen = 0;
  while (cursor < formatted.length && seen < digitsBeforeCursor) {
    if (/\d/.test(formatted[cursor])) seen++;
    cursor++;
  }
  return { formatted, cursor };
}

// Puts the cursor back once React has re-rendered the formatted value
export function restorePhoneCursor(input, cursor) {
  requestAnimationFrame(() => {
    if (document.activeElement === input) input.setSelectionRange(cursor, cursor);
  });
}
