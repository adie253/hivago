import { CartItem } from '../../core/entities/CartItem';
import { ICartRepository } from '../../core/repositories/ICartRepository';

export class CartRepositoryImpl implements ICartRepository {
    private readonly STORAGE_KEY = 'hivago_cart';

    getCart(): CartItem[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load cart from local storage', error);
            return [];
        }
    }

    saveCart(items: CartItem[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save cart to local storage', error);
        }
    }

    clearCart(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
