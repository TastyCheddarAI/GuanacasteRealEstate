import { format, parseISO, isValid, formatDistanceToNow, formatRelative } from 'date-fns'
import { enUS, es } from 'date-fns/locale'

export const formatDate = (date: Date | string, formatStr: string = 'PPP', locale: 'en' | 'es' = 'en'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Invalid date'

  const localeObj = locale === 'es' ? es : enUS
  return format(dateObj, formatStr, { locale: localeObj })
}

export const formatDateTime = (date: Date | string, locale: 'en' | 'es' = 'en'): string => {
  return formatDate(date, 'PPP p', locale)
}

export const formatTime = (date: Date | string, locale: 'en' | 'es' = 'en'): string => {
  return formatDate(date, 'p', locale)
}

export const timeAgo = (date: Date | string, locale: 'en' | 'es' = 'en'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Invalid date'

  const localeObj = locale === 'es' ? es : enUS
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: localeObj })
}

export const relativeDate = (date: Date | string, baseDate: Date = new Date(), locale: 'en' | 'es' = 'en'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Invalid date'

  const localeObj = locale === 'es' ? es : enUS
  return formatRelative(dateObj, baseDate, { locale: localeObj })
}

export const isValidDate = (date: any): boolean => {
  return isValid(typeof date === 'string' ? parseISO(date) : date)
}