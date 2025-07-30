import React, { useState } from 'react';
import { productList } from './data/productData';
import { addToCart, removeFromCart, updateCartItemQuantity, calculateCartSummary } from './services/cartService';
import { Product, CartItem } from './types';
import { CURRENCY_SYMBOL } from './constants';
import { TimerProvider, useTimer } from './contexts/TimerContext';
import Header from './components/Header';
import ProductSelector from './components/ProductSelector';
import CartItem from './components/CartItem';
import HelpModal from './components/HelpModal';

const AppContent: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('product1');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  
  const { timerState } = useTimer();
  
  // 장바구니 요약 계산 (타이머 상태 반영)
  const cartSummary = calculateCartSummary(
    cartItems, 
    timerState.flashSaleProductId, 
    timerState.recommendationProductId
  );
  
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

  // 할인 타입 확인 함수
  const getItemDiscountType = (productId: string) => {
    const { flashSaleProductId, recommendationProductId } = timerState;
    
    // SUPER SALE (번개세일 + 추천할인 동시 적용)
    if (flashSaleProductId === productId && recommendationProductId === productId) {
      return 'super_sale';
    }
    
    // 번개세일
    if (flashSaleProductId === productId) {
      return 'flash_sale';
    }
    
    // 추천할인
    if (recommendationProductId === productId) {
      return 'recommendation';
    }
    
    return null;
  };

  // 화요일 할인 확인
  const isTuesday = new Date().getDay() === 2;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-8">
        <Header />
        
        {/* 도움말 버튼 */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
            aria-label="도움말"
          >
            ?
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* 좌측: 상품 선택 및 장바구니 */}
          <div className="bg-white border border-gray-200 p-8 rounded-lg">
            {/* 상품 선택 */}
            <ProductSelector
              products={productList}
              selectedProductId={selectedProductId}
              onProductSelect={handleProductSelect}
              onAddToCart={handleAddToCart}
            />
            
            {/* 장바구니 */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                장바구니 ({cartItems.length}개 상품)
              </h2>
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">장바구니가 비어있습니다.</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemoveItem={handleRemoveItem}
                      discountType={getItemDiscountType(item.product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 우측: 주문 요약 */}
          <div className="bg-black text-white p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">주문 요약</h2>
            
            {/* 화요일 할인 배너 */}
            {isTuesday && (
              <div className="mb-4 p-3 bg-orange-600 rounded-lg text-center">
                <p className="font-semibold">🗓️ 화요일 특별 할인 10% 적용 중!</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>소계:</span>
                <span>{CURRENCY_SYMBOL}{cartSummary.subtotal.toLocaleString()}</span>
              </div>
              
              {/* 할인 내역 표시 */}
              {cartSummary.discountData.itemDiscounts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">적용된 할인:</div>
                  {cartSummary.discountData.itemDiscounts.map((discount, index) => {
                    const product = productList.find(p => p.id === discount.productId);
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-green-400">
                          {product?.name} ({Math.round(discount.discountRate * 100)}% 할인)
                        </span>
                        <span className="text-green-400">
                          -{CURRENCY_SYMBOL}{discount.discountAmount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="flex justify-between">
                <span>배송비:</span>
                <span className="text-green-400">무료</span>
              </div>
              <hr className="border-gray-600" />
              <div className="flex justify-between text-lg font-semibold">
                <span>총 금액:</span>
                <span>{CURRENCY_SYMBOL}{cartSummary.discountData.totalAmount.toLocaleString()}</span>
              </div>
              
              {/* 포인트 섹션 */}
              {cartItems.length > 0 && (
                <div className="mt-4 p-3 bg-gray-800 rounded">
                  <p className="text-sm text-gray-300">적립 예정 포인트</p>
                  <p className="text-xl font-semibold text-yellow-400">
                    {cartSummary.loyaltyPoints.finalPoints}p
                  </p>
                  <div className="text-xs text-gray-400 mt-1">
                    기본: {cartSummary.loyaltyPoints.pointsDetail.basePoints}p
                    {cartSummary.loyaltyPoints.pointsDetail.bonusPoints > 0 && (
                      <span> + 보너스: {cartSummary.loyaltyPoints.pointsDetail.bonusPoints}p</span>
                    )}
                  </div>
                </div>
              )}
              
              <button className="w-full bg-white text-black py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                결제하기
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-4">
                * 할인은 자동으로 적용됩니다
              </p>
            </div>
          </div>
        </div>
        
        {/* 도움말 모달 */}
        <HelpModal 
          isOpen={isHelpModalOpen} 
          onClose={() => setIsHelpModalOpen(false)} 
        />
      </div>
    </div>
  );
};

// 메인 App 컴포넌트 (TimerProvider로 감싸기)
const App: React.FC = () => {
  return (
    <TimerProvider>
      <AppContent />
    </TimerProvider>
  );
};

export default App; 