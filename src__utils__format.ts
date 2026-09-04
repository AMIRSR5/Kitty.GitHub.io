export function toman(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

/**
 * Discount percent is always DERIVED, never stored/entered by the admin.
 * original=2,000,000 discount=1,500,000 -> 25
 */
export function discountPercent(original: number, discount: number | null | undefined): number {
  if (!discount || discount <= 0 || discount >= original) return 0;
  return Math.round(((original - discount) / original) * 100);
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
