export type Item = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Quotation = {
  customerName: string;
  phone: string;
  email: string;
  items: Item[];
  subtotal: number;
  vat: number;
  discount: number;
  total: number;
};