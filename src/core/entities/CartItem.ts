export interface CartItem {
    id: string;
    name: string;
    price: number;
    isVeg: boolean;
    quantity: number;
    isAddon?: boolean;
    description?: string;
    imageUrl?: string;
}
