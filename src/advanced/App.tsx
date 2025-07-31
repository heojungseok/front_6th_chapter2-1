import React, { useState } from 'react';
import { productList } from './data/productData';
import {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
} from './services/cartService';
import { CartItem } from './types';
import { TimerProvider } from './contexts/TimerContext';
import { ToastProvider } from './contexts/ToastContext';
import { useErrorHandler } from './hooks/useErrorHandler';
import Header from './components/Header';
import ProductSelector from './components/ProductSelector';
import CartContainer from './components/CartContainer';
import OrderSummary from './components/OrderSummary';
import HelpModal from './components/HelpModal';
import ToastContainer from './components/Toast/ToastContainer';

const AppContent: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] =
    useState<string>('product1');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const { showStockError, showProductNotFoundError } = useErrorHandler();

  // 상품 선택 핸들러
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  // 장바구니에 상품 추가
  const handleAddToCart = () => {
    const selectedProduct = productList.find((p) => p.id === selectedProductId);
    if (!selectedProduct) {
      showProductNotFoundError(selectedProductId);
      return;
    }

    // 재고 확인
    const currentQuantity =
      cartItems.find((item) => item.product.id === selectedProductId)
        ?.quantity || 0;
    if (selectedProduct.stockQuantity <= currentQuantity) {
      showStockError(selectedProduct.name);
      return;
    }

    const updatedCart = addToCart(cartItems, selectedProduct, 1);
    setCartItems(updatedCart);
  };

  // 수량 변경
  const handleQuantityChange = (productId: string, change: number) => {
    const item = cartItems.find((item) => item.product.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      // 상품 제거
      const updatedCart = removeFromCart(cartItems, productId);
      setCartItems(updatedCart);
    } else {
      // 수량 변경
      const updatedCart = updateCartItemQuantity(
        cartItems,
        productId,
        newQuantity
      );
      setCartItems(updatedCart);
    }
  };

  // 상품 제거
  const handleRemoveItem = (productId: string) => {
    const updatedCart = removeFromCart(cartItems, productId);
    setCartItems(updatedCart);
  };

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      {/* 헤더 영역 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <Header />
          {/* 도움말 버튼 */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
            aria-label="도움말"
          >
            ?
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="max-w-screen-xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* 좌측: 상품 선택 및 장바구니 */}
          <div className="space-y-6">
            {/* 상품 선택 */}
            <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm">
              <ProductSelector
                products={productList}
                selectedProductId={selectedProductId}
                onProductSelect={handleProductSelect}
                onAddToCart={handleAddToCart}
              />
            </div>

            {/* 장바구니 아이템 목록 */}
            <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm">
              <CartContainer
                cartItems={cartItems}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          </div>

          {/* 우측: 주문 요약 */}
          <div>
            <OrderSummary cartItems={cartItems} />
          </div>
        </div>
      </div>

      {/* 도움말 모달 */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Toast 알림 */}
      <ToastContainer />
    </div>
  );
};

// 메인 App 컴포넌트 (Provider들로 감싸기)
const App: React.FC = () => {
  return (
    <ToastProvider>
      <TimerProvider>
        <AppContent />
      </TimerProvider>
    </ToastProvider>
  );
};

export default App;
