import React, { useState } from 'react';
import { productList } from './data/productData';
import { addToCart, removeFromCart, updateCartItemQuantity, calculateCartSummary } from './services/cartService';
import { Product, CartItem } from './types';
import { CURRENCY_SYMBOL } from './constants';

const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('product1');
  
  // 장바구니 요약 계산
  const cartSummary = calculateCartSummary(cartItems);
  
  // 상품 선택 핸들러
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };
  
  // 장바구니에 상품 추가
  const handleAddToCart = () => {
    const selectedProduct = productList.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;
    
    // 재고 확인
    const currentQuantity = cartItems.find(item => item.product.id === selectedProductId)?.quantity || 0;
    if (selectedProduct.stockQuantity <= currentQuantity) {
      alert('재고가 부족합니다.');
      return;
    }
    
    const updatedCart = addToCart(cartItems, selectedProduct, 1);
    setCartItems(updatedCart);
  };
  
  // 수량 변경
  const handleQuantityChange = (productId: string, change: number) => {
    const item = cartItems.find(item => item.product.id === productId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      // 상품 제거
      const updatedCart = removeFromCart(cartItems, productId);
      setCartItems(updatedCart);
    } else {
      // 수량 변경
      const updatedCart = updateCartItemQuantity(cartItems, productId, newQuantity);
      setCartItems(updatedCart);
    }
  };
  
  // 상품 제거
  const handleRemoveItem = (productId: string) => {
    const updatedCart = removeFromCart(cartItems, productId);
    setCartItems(updatedCart);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛒 Advanced React + TypeScript
          </h1>
          <p className="text-lg text-gray-600">
            장바구니 시스템 - React + TypeScript 버전
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* 좌측: 상품 선택 및 장바구니 */}
          <div className="bg-white border border-gray-200 p-8 rounded-lg">
            {/* 상품 선택 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">상품 선택</h2>
              <div className="space-y-4">
                <select 
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {productList.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {CURRENCY_SYMBOL}{product.price.toLocaleString()} 
                      {product.stockQuantity === 0 ? ' (품절)' : ` (재고: ${product.stockQuantity}개)`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  장바구니에 추가
                </button>
              </div>
            </div>
            
            {/* 장바구니 */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                장바구니 ({cartItems.length}개 상품)
              </h2>
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">장바구니가 비어있습니다.</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.product.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                          <p className="text-gray-600">
                            {CURRENCY_SYMBOL}{item.product.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, -1)}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, 1)}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="ml-2 text-red-600 hover:text-red-800"
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
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 우측: 주문 요약 */}
          <div className="bg-black text-white p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">주문 요약</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>소계:</span>
                <span>{CURRENCY_SYMBOL}{cartSummary.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>할인:</span>
                <span className="text-green-400">
                  -{CURRENCY_SYMBOL}{(cartSummary.subtotal - cartSummary.discountData.totalAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>배송비:</span>
                <span className="text-green-400">무료</span>
              </div>
              <hr className="border-gray-600" />
              <div className="flex justify-between text-lg font-semibold">
                <span>총 금액:</span>
                <span>{CURRENCY_SYMBOL}{cartSummary.discountData.totalAmount.toLocaleString()}</span>
              </div>
              <div className="mt-4 p-3 bg-gray-800 rounded">
                <p className="text-sm text-gray-300">적립 예정 포인트</p>
                <p className="text-xl font-semibold text-yellow-400">
                  {cartSummary.loyaltyPoints.finalPoints}p
                </p>
              </div>
              <button className="w-full bg-white text-black py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                결제하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 