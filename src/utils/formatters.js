/**
 * Formateador de moneda para Pesos Colombianos (COP)
 * Utiliza el punto (.) como separador de miles.
 */
export const formatCurrency = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

/**
 * Formateador de fecha corto (DD/MM/YYYY)
 */
export const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-CO');
};
