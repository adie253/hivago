/**
 * formatPrice
 * Formats a price value with comma separators (e.g., 24,555 or 24,278)
 * and shows decimal points only if they are non-zero.
 */
export const formatPrice = (price: number | string): string => {
    if (price === undefined || price === null) return '0';
    
    const num = typeof price === 'string' 
        ? parseFloat(price.replace(/[^0-9.]/g, '')) 
        : price;
        
    if (isNaN(num)) return '0';
    
    const hasDecimals = num % 1 !== 0;
    const fractionDigits = hasDecimals ? 2 : 0;

    return num.toLocaleString('en-IN', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    });
};
