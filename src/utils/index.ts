/**
 * Formatea un número como moneda en Quetzales (GTQ)
 * @param amount - El monto a formatear
 * @returns String formateado como moneda guatemalteca
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(amount)
}
