import { CartItem } from '../../entities/CartItem';
import { ICartRepository } from '../../repositories/ICartRepository';

export class GetCartUseCase {
    constructor(private repository: ICartRepository) { }

    execute(): CartItem[] {
        return this.repository.getCart();
    }
}
