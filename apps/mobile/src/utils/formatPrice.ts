export function formatPrice(price: number, currency: 'EUR' | 'USD' = 'EUR'): string {
  if (currency === 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatDiscount(percent: number): string {
  return `-${Math.round(percent)}%`;
}
