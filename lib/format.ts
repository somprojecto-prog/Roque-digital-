/**
 * Formata o preço em Kwanzas (AOA), com separador de milhares
 * ao estilo português — ex: 899 000 Kz.
 */
export function formatPrice(price: number, currency: string = "AOA") {
  const formatted = new Intl.NumberFormat("pt-PT", {
    maximumFractionDigits: 0,
  }).format(price);

  const symbol = currency === "AOA" ? "Kz" : currency;
  return `${formatted} ${symbol}`;
}
