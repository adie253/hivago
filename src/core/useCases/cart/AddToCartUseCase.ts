import { CartItem } from '../../entities/CartItem';
import { ICartRepository } from '../../repositories/ICartRepository';

export class AddToCartUseCase {
    constructor(private repository: ICartRepository) { }

    execute(item: Omit<CartItem, 'quantity'>): CartItem[] {
        const cart = this.repository.getCart();
        const existingItem = cart.find(i => i.id === item.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        this.repository.saveCart(cart);
        return cart;
    }
}
