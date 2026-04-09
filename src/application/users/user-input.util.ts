export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeName(name: string): string {
  return name.trim();
}

export function normalizeDocument(document?: string | null): string | undefined {
  if (document === undefined || document === null) return undefined;
  const value = document.trim();
  return value.length ? value : undefined;
}

export function validateName(name: string): void {
  const normalized = normalizeName(name);
  if (normalized.length < 3 || normalized.length > 120) {
    throw new Error('NAME_OUT_OF_RANGE');
  }
}

export function validateEmail(email: string): void {
  const normalized = normalizeEmail(email);
  const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!simpleEmailRegex.test(normalized)) {
    throw new Error('INVALID_EMAIL');
  }
}
