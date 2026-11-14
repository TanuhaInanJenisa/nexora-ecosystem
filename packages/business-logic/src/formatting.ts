/**
 * Formats a monetary amount into localized currency string.
 */
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Converts English digits to Bangla numerals.
 */
export function toBanglaDigits(input: string | number): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(input).replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)] ?? digit);
}

