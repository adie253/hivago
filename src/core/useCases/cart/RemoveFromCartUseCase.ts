import { CartItem } from '../../entities/CartItem';
import { ICartRepository } from '../../repositories/ICartRepository';

export class RemoveFromCartUseCase {
    constructor(private repository: ICartRepository) { }

    execute(itemId: string): CartItem[] {
        let cart = this.repository.getCart();
        const existingItem = cart.find(i => i.id === itemId);

        if (existingItem) {
            if (existingItem.quantity > 1) {
                existingItem.quantity -= 1;
            } else {
                cart = cart.filter(i => i.id !== itemId);
            }
        }

        this.repository.saveCart(cart);
        return cart;
    }
}
