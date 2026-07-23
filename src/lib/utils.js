export const EXCHANGE_RATES = {
  XOF: { XOF: 1,    USD: 1/600, EUR: 1/650 },
  USD: { XOF: 600,  USD: 1,     EUR: 0.92  },
  EUR: { XOF: 650,  USD: 1.08,  EUR: 1     }
}

export const CURRENCY_SYMBOLS = { XOF: 'CFA', USD: '$', EUR: '€' }

export const PARTNERS = ['Hamid', 'barou', 'Sana']

export const PARTNER_COLORS = {
  Hamid: '#059669',
  barou: '#8B1A2B',
  Sana:  '#C9A84C'
}

export function convertToBase(amount, fromCurrency, baseCurrency, manualRate) {
  if (fromCurrency === baseCurrency) return amount
  if (manualRate && !isNaN(manualRate) && manualRate > 0) return amount * manualRate
  return amount * EXCHANGE_RATES[baseCurrency][fromCurrency]
}

export function formatCurrency(value, baseCurrency) {
  const formatters = {
    XOF: new Intl.NumberFormat('fr-FR', { style: 'decimal' }),
    USD: new Intl.NumberFormat('en-US', { style: 'decimal' }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'decimal' })
  }
  const num = formatters[baseCurrency].format(Math.round(value))
  const sym = CURRENCY_SYMBOLS[baseCurrency]
  return baseCurrency === 'XOF' ? `${num} ${sym}` : `${sym}${num}`
}

export function formatDate(dateStr) {
  const p = dateStr.split('-')
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateStr
}