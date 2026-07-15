/**
 * formatPrice
 * Formats a price value to show decimal points only if they are non-zero.
 * e.g., 500 -> "500", 500.50 -> "500.50"
 */
export const formatPrice = (price: number | string): string => {
    if (price === undefined || price === null) return '0.00';
    
    const num = typeof price === 'string' 
        ? parseFloat(price.replace(/[^0-9.]/g, '')) 
        : price;
        
    if (isNaN(num)) return '0.00';
    
    return num.toFixed(2);
};
