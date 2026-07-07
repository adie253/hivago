import type { Restaurant, FoodItem } from '../presentation/context/FilterContext';
import { getFallbackImage } from '../utils/imageUtils';

const BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';

export const sendOtp = async (phoneNumber: string): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/customers/otp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Failed to send OTP: ${response.statusText}`);
        }
        return await response.text().then(text => text ? JSON.parse(text) : {});
    } catch (error) {
        console.error('Error in sendOtp:', error);
        throw error;
    }
};

export const verifyOtp = async (phoneNumber: string, otp: string): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/customers/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, otp })
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Failed to verify OTP: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        throw error;
    }
};

export const getRememberMe = (): boolean => {
    return localStorage.getItem('remember_me') === 'true';
};

export const setRememberMe = (remember: boolean) => {
    localStorage.setItem('remember_me', remember ? 'true' : 'false');
};

export const getAccessToken = (): string | null => {
    return localStorage.getItem('customer_token') || sessionStorage.getItem('customer_token');
};

export const getRefreshToken = (): string | null => {
    return localStorage.getItem('customer_refresh_token') || sessionStorage.getItem('customer_refresh_token');
};

export const getTokenExpiresAt = (): string | null => {
    return localStorage.getItem('customer_token_expires_at') || sessionStorage.getItem('customer_token_expires_at');
};

export const setAuthSession = (accessToken: string, refreshToken: string | null, expiresAt: string | null, rememberMe: boolean) => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_refresh_token');
    localStorage.removeItem('customer_token_expires_at');
    sessionStorage.removeItem('customer_token');
    sessionStorage.removeItem('customer_refresh_token');
    sessionStorage.removeItem('customer_token_expires_at');

    setRememberMe(rememberMe);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('customer_token', accessToken);
    if (refreshToken) {
        storage.setItem('customer_refresh_token', refreshToken);
    }
    if (expiresAt) {
        storage.setItem('customer_token_expires_at', expiresAt);
    }
};

export const updateAuthSession = (accessToken: string, refreshToken: string | null, expiresAt: string | null) => {
    const rememberMe = getRememberMe();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('customer_token', accessToken);
    if (refreshToken) {
        storage.setItem('customer_refresh_token', refreshToken);
    }
    if (expiresAt) {
        storage.setItem('customer_token_expires_at', expiresAt);
    }
};

export const clearAuthSession = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_refresh_token');
    localStorage.removeItem('customer_token_expires_at');
    localStorage.removeItem('customer_phone');
    localStorage.removeItem('customer_id');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('remember_me');

    sessionStorage.removeItem('customer_token');
    sessionStorage.removeItem('customer_refresh_token');
    sessionStorage.removeItem('customer_token_expires_at');
};

export const isTokenValid = (): boolean => {
    const token = getAccessToken();
    const refreshTkn = getRefreshToken();
    if (!token && !refreshTkn) return false;

    const expiresAt = getTokenExpiresAt();
    if (!expiresAt) return true;

    if (new Date(expiresAt).getTime() > Date.now()) {
        return true;
    }

    return !!refreshTkn;
};

let refreshPromise: Promise<string | null> | null = null;

export const getOrPerformTokenRefresh = async (): Promise<string | null> => {
    if (refreshPromise) {
        return refreshPromise;
    }

    const refreshTkn = getRefreshToken();
    if (!refreshTkn) {
        return null;
    }

    refreshPromise = (async () => {
        try {
            const data = await refreshToken();
            if (data && data.accessToken) {
                return data.accessToken;
            }
            return null;
        } catch (error) {
            console.error("Token refresh failed in single-flight handler", error);
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

export const authFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    let token = getAccessToken();
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', 'Bearer ' + token);
    }
    
    let response = await fetch(BASE_URL + endpoint, { ...options, headers });
    
    if (response.status === 401) {
        const newToken = await getOrPerformTokenRefresh();
        if (newToken) {
            const retryHeaders = new Headers(options.headers || {});
            retryHeaders.set('Authorization', 'Bearer ' + newToken);
            response = await fetch(BASE_URL + endpoint, { ...options, headers: retryHeaders });
        } else {
            clearAuthSession();
            window.dispatchEvent(new CustomEvent('auth-logout'));
        }
    }
    
    return response;
};


export interface ReverseGeocodeResult {
    city?: string;
    pincode?: string;
    addressLine?: string;
    suburb?: string;
    state?: string;
}

export const reverseGeocode = async (lat: number, lng: number): Promise<ReverseGeocodeResult | null> => {
    try {
        const response = await authFetch(`/geocode/reverse?lat=${lat}&lng=${lng}`);
        if (!response.ok) return null;
        const data = await response.json();
        // Log raw response so we can see the exact field names returned by this backend
        console.log('[reverseGeocode] raw response:', JSON.stringify(data));
        // Resolve city through many possible field names, then fall back to suburb/district/state
        const city =
            data.city ||
            data.town ||
            data.municipality ||
            data.district ||
            data.locality ||
            data.area ||
            data.village ||
            data.county ||
            data.suburb ||
            data.neighbourhood ||
            data.state ||
            data.region ||
            '';
        return {
            city,
            pincode: data.pincode || data.postcode || data.postalCode || data.postal_code || '',
            addressLine: data.addressLine || data.display_name || data.formattedAddress || '',
            suburb: data.suburb || data.neighbourhood || '',
            state: data.state || data.region || '',
        };
    } catch (e) {
        console.error('Error in reverseGeocode:', e);
        return null;
    }
};


export const addAddress = async (addressData: any): Promise<any> => {
    try {
        const response = await authFetch('/customers/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addressData)
        });
        if (!response.ok) {
            throw new Error(`Failed to add address: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in addAddress:', error);
        throw error;
    }
};

export const setDefaultAddress = async (id: string): Promise<any> => {
    try {
        const response = await authFetch(`/customers/addresses/${id}/default`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Failed to set default address: ${response.statusText}`);
        }
        // It might return empty 200 OK, so handle text/empty json safely
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        console.error('Error in setDefaultAddress:', error);
        throw error;
    }
};

export const getAddresses = async (): Promise<any[]> => {
    try {
        const response = await authFetch('/customers/addresses');
        if (!response.ok) throw new Error(`Failed to get addresses: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error in getAddresses:', error);
        return [];
    }
};

export const updateAddress = async (id: string, data: any): Promise<any> => {
    try {
        const response = await authFetch(`/customers/addresses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Failed to update address: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in updateAddress:', error);
        throw error;
    }
};

export const deleteAddress = async (id: string): Promise<boolean> => {
    try {
        const response = await authFetch(`/customers/addresses/${id}`, { method: 'DELETE' });
        return response.ok;
    } catch (error) {
        console.error('Error in deleteAddress:', error);
        return false;
    }
};

export const getCustomerProfile = async (): Promise<any> => {
    try {
        const response = await authFetch('/customers/profile');
        if (!response.ok) throw new Error(`Failed to fetch profile: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

export const updateCustomerProfile = async (profileData: { name: string; email: string }): Promise<any> => {
    try {
        const response = await authFetch('/customers/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        if (!response.ok) {
            throw new Error(`Failed to update profile: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in updateCustomerProfile:', error);
        throw error;
    }
};

export const getPlacesAutocomplete = async (input: string, lat?: number, lng?: number): Promise<any[]> => {
    try {
        let url = `/places/autocomplete?input=${encodeURIComponent(input)}`;
        if (lat !== undefined && lng !== undefined) {
            url += `&lat=${lat}&lng=${lng}`;
        }
        const response = await authFetch(url);
        if (!response.ok) throw new Error('Failed to fetch autocomplete');
        
        // Some backends wrap in an array, some in an object like { predictions: [] }. Handle gracefully.
        const data = await response.json();
        return Array.isArray(data) ? data : (data.suggestions || data.predictions || data.results || []);
    } catch (e) {
        console.error('Error fetching autocomplete:', e);
        return [];
    }
};

export const getPlaceDetails = async (placeId: string): Promise<any> => {
    try {
        const response = await authFetch(`/places/${placeId}`);
        if (!response.ok) throw new Error('Failed to fetch place details');
        return await response.json();
    } catch (e) {
        console.error('Error fetching place details:', e);
        return null;
    }
};

export const getCart = async (): Promise<any> => {
    try {
        const response = await authFetch('/cart');
        if (response.status === 204) {
            return null;
        }
        if (!response.ok) {
            throw new Error(`Failed to get cart: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching cart:', error);
        return null;
    }
};

export const clearServerCart = async (): Promise<void> => {
    try {
        const response = await authFetch('/cart', {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to clear server cart: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error clearing server cart:', error);
    }
};

export interface SyncCartRequest {
    restaurantId: string;
    restaurantName: string;
    items: {
        menuItemId: string;
        name: string;
        unitPrice: number;
        quantity: number;
        options?: string;
        specialInstructions?: string;
    }[];
}

export const syncCart = async (request: SyncCartRequest, replaceCart: boolean = true): Promise<any> => {
    try {
        const response = await authFetch(`/cart/sync?replaceCart=${replaceCart}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        
        if (response.status === 409) {
            const conflictData = await response.json();
            return {
                isConflict: true,
                existingRestaurantId: conflictData.restaurantId,
                existingRestaurantName: conflictData.restaurantName
            };
        }

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Failed to sync cart: ${response.statusText} - ${errBody}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error syncing cart:', error);
        throw error;
    }
};

export interface ApiRestaurant {
    id: string;
    name: string;
    phone: string;
    addressLine?: string;
    latitude?: number;
    longitude?: number;
    pincode?: string;
    logoUrl?: string | null;
    cuisineTypes?: string[];
    isPureVeg?: boolean;
    avgPrepTimeMins?: number;
    img?: string;
    acceptsPickup?: boolean;
    isAcceptingOrders?: boolean;
}

export interface DeliveryQuoteRequest {
    restaurantId: string;
    pickupLatitude: number;
    pickupLongitude: number;
    dropLatitude: number;
    dropLongitude: number;
    orderAmount: number;
    // Optional — backend reverse-geocodes from lat/lng if omitted
    pickupPincode?: string | null;
    dropPincode?: string | null;
    city?: string | null;
}

export interface DeliveryQuoteResponse {
    id: string;
    deliveryFee: number;
    distanceKm: number;
    estimatedMinutes: number;
    surgeMultiplier: number;
    surgeReason: string | null;
    expiresAt: string;
    breakdown: {
        name: string;
        description: string;
        amount: number;
    }[];
}

export const getDeliveryQuote = async (request: DeliveryQuoteRequest): Promise<DeliveryQuoteResponse | null> => {
    // No auth required for this endpoint
    const response = await fetch(`${BASE_URL}/delivery/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        // Throw with the backend's detail message so callers can inspect it
        throw new Error(err.detail ?? err.message ?? `Failed to get delivery quote: ${response.statusText}`);
    }
    return await response.json();
};

export interface ApiMenuItem {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    imageUrl?: string;
    isAvailable: boolean;
    isVegetarian: boolean;
    preparationTimeMinutes: number;
    category?: string;
}

export interface ApiMenu {
    id: string;
    name: string;
    items: ApiMenuItem[];
}



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
            allItems = safeMenus.flatMap(m => (m.items || []).filter((i: any) => i.isAvailable !== false));
        } else if (safeMenus[0].name && safeMenus[0].basePrice !== undefined) {
            // It's a flat list of items (ApiMenuItem[])
            allItems = (safeMenus as ApiMenuItem[]).filter(i => i.isAvailable !== false);
        }
    }

    const categories = safeMenus[0]?.items
        ? safeMenus
            .filter(m => (m.items || []).some((i: any) => i.isAvailable !== false))
            .map(m => m.name) // Categories from ApiMenu structure
        : Array.from(new Set(allItems.map(i => i.category || 'General'))); // Categories from items
    // Priority: Use live API fields, fall back to calculated defaults
    const cuisines = apiRes.cuisineTypes && apiRes.cuisineTypes.length > 0 ? apiRes.cuisineTypes : (categories.length > 0 ? categories : ['Fast Food', 'Indian']);
    
    const calculatedAvgPrepTime = allItems.length > 0
        ? Math.round(allItems.reduce((sum, item) => sum + item.preparationTimeMinutes, 0) / allItems.length)
        : 30;
        
    const prepTime = apiRes.avgPrepTimeMins || calculatedAvgPrepTime;
    
    return {
        id: apiRes.id,
        name: apiRes.name,
        cuisines: cuisines,
        rating: 4.2, // Default rating as API lacks it
        deliveryTime: `${prepTime}-${prepTime + 10} min`,
        distance: "-- km", // Calculated at display time using real coordinates
        costForTwo: "₹400", // Dummy cost
        imageUrl: apiRes.logoUrl || apiRes.img || (apiRes.name.toLowerCase().includes('good luck')
            ? "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800"
            : (allItems.find(i => i.imageUrl)?.imageUrl || getFallbackImage(apiRes.name, categories[0], 'restaurant'))),
        promoted: false,
        isVeg: apiRes.isPureVeg !== undefined ? apiRes.isPureVeg : (allItems.length > 0 ? allItems.every(item => item.isVegetarian) : true),
        categories: categories,
        acceptsPickup: apiRes.acceptsPickup || false,
        isAcceptingOrders: apiRes.isAcceptingOrders !== undefined ? apiRes.isAcceptingOrders : true,
        addressLine: apiRes.addressLine || "Address not available",
        latitude: apiRes.latitude,
        longitude: apiRes.longitude,
        pincode: apiRes.pincode,
        city: "Mumbai", // Default or map if available in apiRes
        phone: apiRes.phone,
        menu: allItems.map(item => ({
            id: item.id,
            name: item.name,
            type: item.isVegetarian ? 'Veg' : 'Non-Veg',
            price: item.basePrice,
            category: item.category || safeMenus.find(m => m.items?.some((i: any) => i.id === item.id))?.name || 'General',
            description: item.description,
            imageUrl: (item.imageUrl && item.imageUrl !== 'null' && item.imageUrl !== 'undefined' && !item.imageUrl.includes('example.com'))
                ? item.imageUrl
                : getFallbackImage(item.name, item.category),
            options: (item as any).options,
            optionGroups: (item as any).optionGroups
        }))
    };
};

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
    try {
        const response = await fetch(`${BASE_URL}/catalog/restaurants`);
        if (!response.ok) {
            throw new Error(`Failed to fetch restaurants: ${response.statusText}`);
        }
        const data = await response.json();
        const apiRestaurants: ApiRestaurant[] = Array.isArray(data) ? data : (data.items || []);

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
    isAcceptingOrders?: boolean;
}

export const searchDishes = async (query: string): Promise<FoodItem[]> => {
    try {
        const response = await fetch(`${BASE_URL}/catalog/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }
        const data = await response.json();
        const apiItems: ApiSearchItem[] = Array.isArray(data) ? data : (data.items || []);
        
        return apiItems
            .filter(item => item.isAcceptingOrders !== false) // Only filter out if explicitly false
            .map(item => ({
                id: item.itemId,
                name: item.itemName,
                type: item.isVegetarian ? 'Veg' : 'Non-Veg',
                price: item.basePrice,
                category: 'Search Result',
                imageUrl: item.imageUrl || getFallbackImage(item.itemName, 'Search Result'),
                description: item.description || "",
                isVeg: item.isVegetarian,
                restaurantId: item.restaurantId,
                restaurantName: item.restaurantName
            }));
    } catch (error) {
        console.error('Error in searchDishes:', error);
        throw error;
    }
};

export const fetchRestaurantById = async (id: string): Promise<Restaurant | null> => {
    try {
        // Fallback: search in list first if direct ID doesn't work (some backends only support list)
        // We do this to avoid 404 console errors from the browser
        let apiRes: ApiRestaurant | null = null;
        
        const listResponse = await fetch(`${BASE_URL}/catalog/restaurants`);
        if (listResponse.ok) {
            const data = await listResponse.json();
            const apiRestaurants: ApiRestaurant[] = Array.isArray(data) ? data : (data.items || []);
            apiRes = apiRestaurants.find(r => r.id === id) || null;
        }

        // If not found in list, try direct ID as a last resort
        if (!apiRes) {
            const response = await fetch(`${BASE_URL}/catalog/restaurants/${id}`);
            if (response.ok) {
                apiRes = await response.json();
            }
        }

        if (!apiRes) return null;

        // 2. Always try to fetch the menu for full details
        let menus = [];
        try {
            const menuResponse = await fetch(`${BASE_URL}/catalog/restaurants/${id}/menu`);
            if (menuResponse.ok) {
                const menuData = await menuResponse.json();
                menus = Array.isArray(menuData.menus) ? menuData.menus : (Array.isArray(menuData) ? menuData : []);
            }
        } catch (e) {
            console.error(`Failed to fetch menu for restaurant ${id}`, e);
        }

        return mapRestaurant(apiRes, menus);
    } catch (error) {
        console.error(`Error in fetchRestaurantById for ${id}:`, error);
        return null;
    }
};

export const fetchRawRestaurantById = async (id: string): Promise<ApiRestaurant | null> => {
    try {
        const response = await fetch(`${BASE_URL}/catalog/restaurants`);
        if (!response.ok) return null;

        const apiRestaurants: ApiRestaurant[] = await response.json();
        return apiRestaurants.find(r => r.id === id) || null;
    } catch (error) {
        console.error(`Error in fetchRawRestaurantById for ${id}:`, error);
        return null;
    }
};

export interface ApiItemOption {
    id: string;
    name: string;
    additionalPrice: number;
    type?: string;
    isDefault?: boolean;
}

export interface ApiOptionGroupOption {
    id: string;
    name: string;
    type: string;
    additionalPrice: number;
    isDefault: boolean;
}

export interface ApiOptionGroup {
    id: string;
    groupName: string;
    isRequired: boolean;
    minSelections: number;
    maxSelections: number;
    displayOrder: number;
    options: ApiOptionGroupOption[];
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
    optionGroups?: ApiOptionGroup[];
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

export interface ApiOrderItem {
    menuItemId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    options?: string;
    specialInstructions?: string;
}

export interface ApiOrder {
    id: string;
    orderNumber: string;
    customerId: string;
    restaurantId: string;
    restaurantName: string;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED' | 'REJECTED' | 'PAID' | 'REFUNDING' | 'REFUNDED' | 'FAILED' | string;
    statusDisplay?: string;
    rejectionReason?: string;
    cancellationReason?: string;
    failureReason?: string;
    paymentId?: string;
    estimatedMinutes?: number;
    estimatedTimeDisplay?: string;
    totalAmount: number;
    total?: number;
    pricing?: {
        subTotal?: number;
        deliveryFee?: number;
        tax?: number;
        discount?: number;
        packagingFee?: number;
        serviceFee?: number;
        tip?: number;
        total?: number;
        currency?: string;
    };
    totalItems?: number;
    fulfillmentType: 'Delivery' | 'Pickup';
    items: ApiOrderItem[];
    deliveryAddress?: any;
    deliveryInfo?: {
        pickupAddress?: string;
        deliveryAddress?: {
            street?: string;
            city?: string;
            pincode?: string;
            formattedAddress?: string;
        } | string;
    };
    createdAt: string;
    updatedAt: string;
}

export const getMyOrders = async (page: number = 0, pageSize: number = 50): Promise<any> => {
    try {
        const response = await authFetch(`/orders/my-orders?page=${page}&pageSize=${pageSize}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : (data.items || data.orders || data.content || []);
    } catch (error) {
        console.error('Error in getMyOrders:', error);
        return [];
    }
};

export const getActiveOrders = async (): Promise<ApiOrder[]> => {
    try {
        const response = await authFetch('/orders/active');
        if (!response.ok) {
            throw new Error(`Failed to fetch active orders: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in getActiveOrders:', error);
        return [];
    }
};

export const getOrderById = async (orderId: string): Promise<ApiOrder | null> => {
    try {
        // Adjust endpoint if needed. Typically /orders/{id} or we can search inside getActiveOrders
        const response = await authFetch(`/orders/${orderId}`);
        if (!response.ok) {
             // Fallback: search in active orders if direct ID endpoint isn't supported
             const activeOrders = await getActiveOrders();
             const found = activeOrders.find(o => o.id === orderId || o.orderNumber === orderId);
             return found || null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error in getOrderById:', error);
        return null;
    }
};

export interface ApiPlaceOrderRequest {
     paymentId: string;
    paymentTransactionId: string;
    deliveryQuoteId: string;
    fulfillmentType: 'Delivery' | 'Pickup';
    restaurantId: string;
    restaurantName: string;
    restaurantPhone: string;
    pickupLatitude: number;
    pickupLongitude: number;
    pickupPincode: string;
    pickupAddress: string;
    deliveryAddress: {
        street: string;
        city: string;
        pincode: string;
        latitude: number;
        longitude: number;
        landmark: string | null;
        buildingName: string;
        floor: string;
        contactPhone: string;
        instructions: string;
    };
    items: {
        menuItemId: string;
        itemName: string;
        itemDescription: string;
        imageUrl: string;
        unitPrice: number;
        quantity: number;
        specialInstructions: string;
    }[];
    pricing: {
        subTotal: number;
        deliveryFee: number;
        tax: number;
        discount: number;
        packagingFee: number;
        serviceFee: number;
        tip: number;
        discountCode: string;
        discountDescription: string;
    };
    specialInstructions: string;
}

export const placeOrder = async (orderPayload: ApiPlaceOrderRequest): Promise<ApiOrder> => {
    try {
        const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString();
        const response = await authFetch('/orders', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify(orderPayload)
        });
        if (!response.ok) {
            const errBody = await response.text();
            let parsedErr: any = null;
            try {
                parsedErr = JSON.parse(errBody);
            } catch (e) {
                // Ignore parse errors
            }

            const errorMsg = parsedErr?.message || parsedErr?.error || `Failed to place order: ${response.statusText}`;
            const errorType = parsedErr?.error || parsedErr?.type;
            
            const customErr = new Error(errorMsg);
            if (errorType) {
                (customErr as any).response = {
                    data: {
                        type: errorType,
                        message: errorMsg
                    }
                };
            }
            throw customErr;
        }
        return await response.json();
    } catch (error) {
        console.error('Error placing order:', error);
        throw error;
    }
};


export const fetchDeliveryCodes = async (orderId: string): Promise<{ pickupCode: string | null, dropCode: string | null } | null> => {
    try {
        const response = await authFetch(`/delivery/orders/${orderId}/codes`);
        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error(`Failed to fetch delivery codes: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in fetchDeliveryCodes:', error);
        return null; // Don't crash on network error or 404
    }
};

// payment apis_____________________________________________________________________________


export const initiatePayment = async (orderId: string) => {
  const res = await authFetch("/payments/initiate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ orderId })
  });

  return res.json();
};

let payuWindowRef: Window | null = null;

export const preOpenPayUPopup = () => {
  // Open popup window centered on screen synchronously during user action
  const width = 600, height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  payuWindowRef = window.open('', 'PayUPopup', `width=${width},height=${height},left=${left},top=${top}`);

  if (payuWindowRef) {
    try {
      payuWindowRef.document.write(`
        <html>
          <head>
            <title>Connecting to PayU...</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background-color: #f9fafb;
                color: #374151;
              }
              .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #ff584a;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              h3 { margin: 0 0 8px 0; font-size: 18px; font-weight: 600; }
              p { margin: 0; font-size: 14px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="spinner"></div>
            <h3>Connecting to PayU</h3>
            <p>Please do not close this window...</p>
          </body>
        </html>
      `);
      payuWindowRef.document.close();
    } catch (e) {
      console.error("Failed to write loading state to popup window:", e);
    }
  }
};

function redirectToPayU(params: any) {
  // If popup wasn't pre-opened, open it now (fallback)
  if (!payuWindowRef || payuWindowRef.closed) {
    const width = 600, height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    payuWindowRef = window.open('', 'PayUPopup', `width=${width},height=${height},left=${left},top=${top}`);
  }

  if (!payuWindowRef) {
    console.error("Failed to open or locate PayU popup window");
    return;
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = params.payUBaseUrl;
  form.target = 'PayUPopup'; // Submit to the popup

  const fields = {
    key: params.key,
    txnid: params.txnId,
    amount: params.amount,
    productinfo: params.productInfo,
    firstname: params.firstName,
    email: params.email,
    phone: params.phone,
    surl: params.surl,
    furl: params.furl,
    hash: params.hash
  };

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();

  // Delay cleanup to prevent Chrome/Blink from cancelling the form submission
  setTimeout(() => {
    try {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    } catch (e) {
      console.error("Failed to clean up form:", e);
    }
  }, 1000);
}

export const closePayUPopupWindow = () => {
  if (payuWindowRef) {
    try {
      payuWindowRef.close();
    } catch (e) {
      console.error("Failed to close PayU popup programmatically", e);
    }
    payuWindowRef = null;
  }
};

export const isPayUPopupClosed = () => {
  return !payuWindowRef || payuWindowRef.closed;
};

export const startPayment = async (orderId: string) => {
  const params = await initiatePayment(orderId);

  // ✅ save before redirect
  sessionStorage.setItem("txnId", params.txnId);
  sessionStorage.setItem("orderId", orderId);

  redirectToPayU(params);
};



export const verifyPayment = async (txnId: string): Promise<any> => {
  try {
    const res = await authFetch("/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ txnId })
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to verify payment:", error);
    return null;
  }
};

export const checkDeliveryAvailability = async (restaurantId: string, lat: number, lng: number): Promise<{
    canDeliver: boolean;
    distanceKm: number;
    maxDistanceKm: number;
} | null> => {
    try {
        const response = await fetch(`${BASE_URL}/catalog/restaurants/${restaurantId}/delivery-check?lat=${lat}&lng=${lng}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error in checkDeliveryAvailability:', error);
        return null;
    }
};

export const refreshToken = async (): Promise<any> => {
    try {
        const token = getAccessToken();
        const refreshTkn = getRefreshToken();
        if (!token) return null;

        // Try standard payload first (with refreshToken if available)
        const payload = refreshTkn 
            ? { refreshToken: refreshTkn }
            : { token: token, accessToken: token };

        const response = await fetch(BASE_URL + '/auth/refresh', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload) 
        });

        if (!response.ok) {
            // Fallback retry with Authorization header and alternative payload
            const fallbackPayload = refreshTkn 
                ? { accessToken: token, refreshToken: refreshTkn }
                : { token: token };

            const retryResponse = await fetch(BASE_URL + '/auth/refresh', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(fallbackPayload)
            });
            if (!retryResponse.ok) return null;
            
            const data = await retryResponse.json();
            if (data && data.accessToken) {
                updateAuthSession(data.accessToken, data.refreshToken, data.accessTokenExpiresAt);
                return data;
            }
            return null;
        }
        
        const data = await response.json();
        if (data && data.accessToken) {
            updateAuthSession(data.accessToken, data.refreshToken, data.accessTokenExpiresAt);
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};