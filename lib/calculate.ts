import { Item } from "../types/quotation";

// Calculate each line total
export function calculateItems(items: Item[]) {
  return items.map(item => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
}

// Calculate totals
export function calculateTotals(
  items: Item[],
  vatRate: number,
  discount: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vat = subtotal * vatRate;
  const total = subtotal + vat - discount;

  return { subtotal, vat, total };
}