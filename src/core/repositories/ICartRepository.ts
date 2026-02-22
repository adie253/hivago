import { CartItem } from '../entities/CartItem';

export interface ICartRepository {
    getCart(): CartItem[];
    saveCart(items: CartItem[]): void;
    clearCart(): void;
}
