import React from 'react';
import { Product } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onProductSelect: (productId: string) => void;
  onAddToCart: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProductId,
  onProductSelect,
  onAddToCart
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">상품 선택</h2>
      <div className="space-y-4">
        <select 
          value={selectedProductId}
          onChange={(e) => onProductSelect(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} - {CURRENCY_SYMBOL}{product.price.toLocaleString()} 
              {product.stockQuantity === 0 ? ' (품절)' : ` (재고: ${product.stockQuantity}개)`}
            </option>
          ))}
        </select>
        <button
          onClick={onAddToCart}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          장바구니에 추가
        </button>
      </div>
    </div>
  );
};

export default ProductSelector; 