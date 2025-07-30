import React from 'react';
import { CartItem as CartItemType } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemoveItem
}) => {
  const handleDecreaseQuantity = () => {
    onQuantityChange(item.product.id, -1);
  };

  const handleIncreaseQuantity = () => {
    onQuantityChange(item.product.id, 1);
  };

  const handleRemove = () => {
    onRemoveItem(item.product.id);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
          <p className="text-gray-600">
            {CURRENCY_SYMBOL}{item.product.price.toLocaleString()} × {item.quantity}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDecreaseQuantity}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
            aria-label="수량 감소"
          >
            -
          </button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button
            onClick={handleIncreaseQuantity}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
            aria-label="수량 증가"
          >
            +
          </button>
          <button
            onClick={handleRemove}
            className="ml-2 text-red-600 hover:text-red-800"
            aria-label="상품 제거"
          >
            삭제
          </button>
        </div>
      </div>
      <div className="mt-2 text-right">
        <span className="font-semibold text-gray-800">
          {CURRENCY_SYMBOL}{item.itemTotal.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default CartItem; 