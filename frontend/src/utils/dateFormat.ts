/**
 * Formats a date string (YYYY-MM-DD, ISO timestamp, DD/MM/YYYY, DD-MM-YYYY)
 * or Date instance into `dd-MM-yyyy` for consistent UI display.
 */
export function formatDateDdMmYyyy(value?: string | Date | null): string {
  if (!value) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const dd = String(value.getDate()).padStart(2, "0");
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const yyyy = value.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  const trimmed = String(value).trim();
  if (!trimmed) return "";

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, yyyy, mm, dd] = isoDateMatch;
    return `${dd}-${mm}-${yyyy}`;
  }

  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const [, dd, mm, yyyy] = dmyMatch;
    return `${dd.padStart(2, "0")}-${mm.padStart(2, "0")}-${yyyy}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const dd = String(parsed.getDate()).padStart(2, "0");
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const yyyy = parsed.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  return trimmed;
}

/**
 * Formats a date/timestamp string or Date instance into `dd-MM-yyyy HH:mm`
 * for timelines, audit logs, and status history.
 */
export function formatDateTimeDdMmYyyy(value?: string | Date | null): string {
  if (!value) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const hh = String(value.getHours()).padStart(2, "0");
    const min = String(value.getMinutes()).padStart(2, "0");
    return `${formatDateDdMmYyyy(value)} ${hh}:${min}`;
  }

  const trimmed = String(value).trim();
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || /^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(trimmed)) {
    return formatDateDdMmYyyy(trimmed);
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const hh = String(parsed.getHours()).padStart(2, "0");
    const min = String(parsed.getMinutes()).padStart(2, "0");
    return `${formatDateDdMmYyyy(parsed)} ${hh}:${min}`;
  }

  return trimmed;
}

/**
 * Returns today's local date in `YYYY-MM-DD` format for `<input type="date" />` and date comparisons.
 */
export function getTodayLocalIso(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns tomorrow's local date in `YYYY-MM-DD` format for `<input type="date" />` defaults.
 */
export function getTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return getTodayLocalIso(d);
}

