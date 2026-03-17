import { Restaurant, FoodItem } from '../presentation/context/FilterContext';

const BASE_URL = import.meta.env.MODE === 'production'
    ? 'https://rally-production-2004.up.railway.app/api'
    : '/api';

export interface ApiRestaurant {
    id: string;
    name: string;
    phone: string;
    addressLine?: string;
    latitude?: number;
    longitude?: number;
    pincode?: string;
    img?: string;
}

export interface ApiMenuItem {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    imageUrl?: string;
    isVegetarian: boolean;
    preparationTimeMinutes: number;
    category?: string;
}

export interface ApiMenu {
    id: string;
    name: string;
    items: ApiMenuItem[];
}

const FALLBACK_IMAGES: Record<string, string[]> = {
    'Burger': [
        'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400'
    ],
    'Pizza': [
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1574123853664-6ec2153a9984?auto=format&fit=crop&q=80&w=400'
    ],
    'Indian': [
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1601050638911-c30207ef992c?auto=format&fit=crop&q=80&w=400'
    ],
    'Dessert': [
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=400'
    ],
    'Cafe': [
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400'
    ],
    'Healthy': [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400'
    ]
};

const getFallbackImage = (name: string, category: string = ''): string => {
    const combined = (name + ' ' + category).toLowerCase();

    if (combined.includes('burger')) return FALLBACK_IMAGES['Burger'][Math.abs(name.length) % 3];
    if (combined.includes('pizza')) return FALLBACK_IMAGES['Pizza'][Math.abs(name.length) % 3];
    if (combined.includes('cake') || combined.includes('ice cream') || combined.includes('sweet') || combined.includes('dessert'))
        return FALLBACK_IMAGES['Dessert'][Math.abs(name.length) % 3];
    if (combined.includes('chai') || combined.includes('coffee') || combined.includes('cafe'))
        return FALLBACK_IMAGES['Cafe'][Math.abs(name.length) % 3];
    if (combined.includes('salad') || combined.includes('healthy') || combined.includes('bowl'))
        return FALLBACK_IMAGES['Healthy'][Math.abs(name.length) % 3];
    if (combined.includes('biryani') || combined.includes('curry') || combined.includes('paneer') || combined.includes('thali'))
        return FALLBACK_IMAGES['Indian'][Math.abs(name.length) % 3];

    // Default catch-all variety
    const keys = Object.keys(FALLBACK_IMAGES);
    const randomKey = keys[Math.abs(name.length) % keys.length];
    return FALLBACK_IMAGES[randomKey][Math.abs(name.length) % 3];
};

/**
 * Maps API restaurant data to application Restaurant type.
 * Since the API is missing some fields used by the UI, we provide sensible defaults.
 */
const mapRestaurant = (apiRes: ApiRestaurant, menus: any[] = []): Restaurant => {
    const safeMenus = Array.isArray(menus) ? menus : [];

    // API might return categories ([{ items: [...] }]) or flat items directly
    let allItems: ApiMenuItem[] = [];
    if (safeMenus.length > 0) {
        if (safeMenus[0].items && Array.isArray(safeMenus[0].items)) {
            // It's a list of categories (ApiMenu[])
            allItems = safeMenus.flatMap(m => m.items || []);
        } else if (safeMenus[0].name && safeMenus[0].basePrice !== undefined) {
            // It's a flat list of items (ApiMenuItem[])
            allItems = safeMenus as ApiMenuItem[];
        }
    }

    const categories = safeMenus[0]?.items
        ? safeMenus.map(m => m.name) // Categories from ApiMenu structure
        : Array.from(new Set(allItems.map(i => i.category || 'General'))); // Categories from items

    // In a real app, these would come from the API or be calculated
    const cuisines = categories.length > 0 ? categories : ['Fast Food', 'Indian'];
    const avgPrepTime = allItems.length > 0
        ? Math.round(allItems.reduce((sum, item) => sum + item.preparationTimeMinutes, 0) / allItems.length)
        : 30;

    return {
        id: apiRes.id,
        name: apiRes.name,
        cuisines: cuisines,
        rating: 4.2, // Default rating as API lacks it
        deliveryTime: `${avgPrepTime}-${avgPrepTime + 10} min`,
        distance: "2.5 km", // Dummy distance
        costForTwo: "₹400", // Dummy cost
        imageUrl: apiRes.img || (apiRes.name.toLowerCase().includes('good luck')
            ? "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800"
            : (allItems.find(i => i.imageUrl)?.imageUrl || getFallbackImage(apiRes.name, categories[0]))),
        promoted: false,
        isVeg: allItems.length > 0 ? allItems.every(item => item.isVegetarian) : true,
        categories: categories,
        menu: allItems.map(item => ({
            id: item.id,
            name: item.name,
            type: item.isVegetarian ? 'Veg' : 'Non-Veg',
            price: item.basePrice,
            category: item.category || safeMenus.find(m => m.items?.some((i: any) => i.id === item.id))?.name || 'General',
            description: item.description,
            imageUrl: item.imageUrl || getFallbackImage(item.name, item.category)
        }))
    };
};

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
    try {
        const response = await fetch(`${BASE_URL}/catalog/restaurants`);
        if (!response.ok) {
            throw new Error(`Failed to fetch restaurants: ${response.statusText}`);
        }
        const apiRestaurants: ApiRestaurant[] = await response.json();

        // For each restaurant, we might need to fetch its menu to get full details
        // In a real production app, we'd optimize this (e.g., fetch menus only when needed)
        // For this implementation, we'll map what we have and fetch menus in parallel

        const restaurantsWithMenus = await Promise.all(apiRestaurants.map(async (res) => {
            try {
                const menuResponse = await fetch(`${BASE_URL}/catalog/restaurants/${res.id}/menu`);
                if (menuResponse.ok) {
                    const menuData = await menuResponse.json();
                    const menus = Array.isArray(menuData.menus) ? menuData.menus : [];
                    return mapRestaurant(res, menus);
                }
            } catch (e) {
                console.error(`Failed to fetch menu for restaurant ${res.id}`, e);
            }
            return mapRestaurant(res);
        }));

        return restaurantsWithMenus;
    } catch (error) {
        console.error('Error in fetchRestaurants:', error);
        throw error;
    }
};

export interface ApiSearchItem {
    itemId: string;
    itemName: string;
    description: string;
    basePrice: number;
    imageUrl?: string;
    isVegetarian: boolean;
    preparationTimeMinutes: number;
    restaurantId: string;
    restaurantName: string;
}

export const searchDishes = async (query: string): Promise<FoodItem[]> => {
    try {
        const response = await fetch(`${BASE_URL}/catalog/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }
        const apiItems: ApiSearchItem[] = await response.json();
        return apiItems.map(item => ({
            id: item.itemId,
            name: item.itemName,
            type: item.isVegetarian ? 'Veg' : 'Non-Veg',
            price: item.basePrice,
            category: 'Search Result' // API search doesn't return category directly
        }));
    } catch (error) {
        console.error('Error in searchDishes:', error);
        throw error;
    }
};

export const fetchRestaurantById = async (id: string): Promise<Restaurant | null> => {
    try {
        const response = await fetch(`${BASE_URL}/catalog/restaurants`);
        if (!response.ok) return null;

        const apiRestaurants: ApiRestaurant[] = await response.json();
        const apiRes = apiRestaurants.find(r => r.id === id);

        if (!apiRes) return null;

        const menuResponse = await fetch(`${BASE_URL}/catalog/restaurants/${id}/menu`);
        let menus = [];
        if (menuResponse.ok) {
            const menuData = await menuResponse.json();
            menus = Array.isArray(menuData.menus) ? menuData.menus : [];
        }

        return mapRestaurant(apiRes, menus);
    } catch (error) {
        console.error(`Error in fetchRestaurantById for ${id}:`, error);
        return null;
    }
};

export interface ApiItemOption {
    id: string;
    name: string;
    price: number;
}

export interface ApiItem {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    imageUrl: string | null;
    isAvailable: boolean;
    isVegetarian: boolean;
    preparationTimeMinutes: number;
    options: ApiItemOption[];
}

export const fetchItemDetails = async (itemId: string): Promise<ApiItem | null> => {
    try {
        const response = await fetch(`${BASE_URL}/items/${itemId}`);
        if (!response.ok) {
             throw new Error(`Failed to fetch item details: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error in fetchItemDetails for ${itemId}:`, error);
        return null;
    }
};
