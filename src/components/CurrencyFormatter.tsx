import type { CurrencyFormatterProps } from '@/types/formatting';

export default function CurrencyFormatter({
  amount,
  currency = 'INR',
  locale = 'en-IN',
  minimumFractionDigits = 0,
}: CurrencyFormatterProps) {
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits,
  }).format(amount);

  return <span>{formattedAmount}</span>;
}
