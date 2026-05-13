export const FALLBACK_IMAGES: Record<string, string[]> = {
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

export const getFallbackImage = (name: string, category: string = ''): string => {
    const combined = (name + ' ' + category).toLowerCase();
    
    if (combined.includes('burger') || combined.includes('sandwich'))
        return FALLBACK_IMAGES['Burger'][Math.abs(name.length) % 3];
    if (combined.includes('pizza') || combined.includes('italian') || combined.includes('pasta'))
        return FALLBACK_IMAGES['Pizza'][Math.abs(name.length) % 3];
    if (combined.includes('cake') || combined.includes('dessert') || combined.includes('sweet') || combined.includes('ice cream') || combined.includes('waffle'))
        return FALLBACK_IMAGES['Dessert'][Math.abs(name.length) % 3];
    if (combined.includes('coffee') || combined.includes('cafe') || combined.includes('tea') || combined.includes('beverage') || combined.includes('breakfast'))
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
