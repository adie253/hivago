import foodFallback from '../assets/fallbacks/food_fallback.jpg';
import restaurantFallback from '../assets/fallbacks/restaurant_fallback.png';

/**
 * getFallbackImage
 * Provides a branded fallback image when the source is missing or broken.
 * @param name - The name of the item (unused now, kept for signature compatibility)
 * @param category - The category of the item (unused now, kept for signature compatibility)
 * @param type - Whether it's a 'food' item or a 'restaurant'
 */
export const getFallbackImage = (_name: string, _category: string = '', type: 'food' | 'restaurant' = 'food'): string => {
    if (type === 'restaurant') {
        return restaurantFallback;
    }
    return foodFallback;
};
