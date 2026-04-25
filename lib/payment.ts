export function maskIban(iban: string): string {
  const clean = iban.replace(/\s/g, "");
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)} •••• ${clean.slice(-4)}`;
}

export function maskCard(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 4) return digits;
  return `•••• ${digits.slice(-4)}`;
}

export function generateInvoiceNumber(): string {
  const ts = new Date();
  const yymmdd = ts.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `AH-${yymmdd}-${rand}`;
}

export function isValidIban(iban: string): boolean {
  const clean = iban.replace(/\s/g, "");
  return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(clean);
}

export function isPlausibleCard(number: string): boolean {
  const digits = number.replace(/\D/g, "");
  return digits.length >= 12 && digits.length <= 19;
}
