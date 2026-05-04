export function title(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function enumValue<T extends string>(value: string): T | null {
  return value ? (value as T) : null;
}

export function numberOrNull(value: string): number | null {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : null;
}

export function emptyToUndefined(value: string) {
  return value.trim() || undefined;
}

export function enumOrUndefined<T extends readonly string[]>(value: string, options: T): T[number] | undefined {
  const trimmed = value.trim();
  return trimmed && (options as readonly string[]).includes(trimmed) ? (trimmed as T[number]) : undefined;
}

export function numberOrUndefined(value: string) {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : undefined;
}
