type SearchTextPart = string | number | null | undefined;

export function buildSearchText(parts: SearchTextPart[]): string {
  return parts
    .map((part) => part?.toString().trim())
    .filter((part): part is string => Boolean(part))
    .join(' ');
}

export function buildBm25Document(id: string, text: string): string {
  return buildSearchText([id, text]);
}
