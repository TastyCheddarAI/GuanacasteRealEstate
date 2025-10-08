import currency from 'currency.js'

export const formatUSD = (amount: number | string): string => {
  return currency(amount, { symbol: '$', precision: 2 }).format()
}

export const formatCRC = (amount: number | string): string => {
  return currency(amount, { symbol: '₡', precision: 2 }).format()
}

export const parseCurrency = (value: string): number => {
  return currency(value).value
}

export const addCurrencies = (a: number | string, b: number | string): number => {
  return currency(a).add(b).value
}

export const subtractCurrencies = (a: number | string, b: number | string): number => {
  return currency(a).subtract(b).value
}

export const multiplyCurrency = (amount: number | string, factor: number): number => {
  return currency(amount).multiply(factor).value
}

export const divideCurrency = (amount: number | string, divisor: number): number => {
  return currency(amount).divide(divisor).value
}