export function calculatePromoterCommission(type: string, value: number, subtotalCents: number, quantity: number): number {
  if (!Number.isSafeInteger(value) || value <= 0 || !Number.isSafeInteger(subtotalCents) || subtotalCents < 0 || !Number.isSafeInteger(quantity) || quantity < 0 || (type !== "percent" && type !== "fixed") || (type === "percent" && value > 10000)) throw new Error("La comisión no es válida.");
  const amount = type === "percent" ? Math.round(subtotalCents * value / 10000) : quantity * value;
  if (!Number.isSafeInteger(amount) || amount > 2147483647) throw new Error("La comisión excede el límite permitido.");
  return amount;
}
