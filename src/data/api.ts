import { Restaurant, FoodItem } from '../presentation/context/FilterContext';

const BASE_URL = import.meta.env.MODE === 'production'
    ? 'https://rally-production-2004.up.railway.app/api'
    : '/api';

export const sendOtp = async (phoneNumber: string): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/customers/otp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
        });
        if (!response.ok) {
            throw new Error(`Failed to send OTP: ${response.statusText}`);
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
            throw new Error(`Failed to verify OTP: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        throw error;
    }
};

export const isTokenValid = (): boolean => {
    const token = localStorage.getItem('customer_token');
    const expiresAt = localStorage.getItem('customer_token_expires_at');
    if (!token) return false;
    if (!expiresAt) return true;
    return new Date(expiresAt).getTime() > Date.now();
};

export const authFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('customer_token');
    const headers = new Headers(options.headers || {});
    if (token && isTokenValid()) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
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
    img?: string;
}

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
        distance: "-- km", // Calculated at display time using real coordinates
        costForTwo: "₹400", // Dummy cost
        imageUrl: apiRes.img || (apiRes.name.toLowerCase().includes('good luck')
            ? "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800"
            : (allItems.find(i => i.imageUrl)?.imageUrl || getFallbackImage(apiRes.name, categories[0]))),
        promoted: false,
        isVeg: allItems.length > 0 ? allItems.every(item => item.isVegetarian) : true,
        categories: categories,
        addressLine: apiRes.addressLine || "Address not available",
        latitude: apiRes.latitude,
        longitude: apiRes.longitude,
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
    status: 'PENDING' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED' | 'REJECTED' | 'PAID' | string;
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
    orderType: 'DELIVERY' | 'PICKUP';
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
        return await response.json();
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
        landmark: string;
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
            throw new Error(`Failed to place order: ${response.statusText} - ${errBody}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error placing order:', error);
        throw error;
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

function redirectToPayU(params: any) {
  // Open popup window centered on screen
  const width = 600, height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  payuWindowRef = window.open('', 'PayUPopup', `width=${width},height=${height},left=${left},top=${top}`);

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
        const token = localStorage.getItem('customer_token');
        const refreshTkn = localStorage.getItem('customer_refresh_token');
        if (!token) return null;

        // Try standard payload first (with refreshToken if available)
        const payload = refreshTkn 
            ? { refreshToken: refreshTkn }
            : { token: token, accessToken: token };

        const response = await fetch(`${BASE_URL}/auth/refresh`, {
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

            const retryResponse = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(fallbackPayload)
            });
            if (!retryResponse.ok) return null;
            
            const data = await retryResponse.json();
            if (data && data.accessToken) {
                localStorage.setItem('customer_token', data.accessToken);
                if (data.accessTokenExpiresAt) {
                    localStorage.setItem('customer_token_expires_at', data.accessTokenExpiresAt);
                }
                if (data.refreshToken) {
                    localStorage.setItem('customer_refresh_token', data.refreshToken);
                }
                return data;
            }
            return null;
        }
        
        const data = await response.json();
        if (data && data.accessToken) {
            localStorage.setItem('customer_token', data.accessToken);
            if (data.accessTokenExpiresAt) {
                localStorage.setItem('customer_token_expires_at', data.accessTokenExpiresAt);
            }
            if (data.refreshToken) {
                localStorage.setItem('customer_refresh_token', data.refreshToken);
            }
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};