import React from 'react';
import { productList } from './data/productData';
import { TimerProvider } from './contexts/TimerContext';
import { ToastProvider } from './contexts/ToastContext';
import { useCart } from './hooks/useCart';
import { useProductSelection } from './hooks/useProductSelection';
import { useModal } from './hooks/useModal';
import Header from './components/Header';
import ProductSelector from './components/ProductSelector';
import CartContainer from './components/CartContainer';
import OrderSummary from './components/OrderSummary';
import HelpModal from './components/HelpModal';
import ToastContainer from './components/Toast/ToastContainer';

const AppContent: React.FC = () => {
  const { cartItems, addProductById, removeItemFromCart, updateItemQuantity } =
    useCart();
  const { selectedProductId, selectProduct } = useProductSelection();
  const {
    isOpen: isHelpModalOpen,
    openModal: openHelpModal,
    closeModal: closeHelpModal,
  } = useModal();

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      {/* 헤더 영역 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <Header />
          {/* 도움말 버튼 */}
          <button
            onClick={openHelpModal}
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
                onProductSelect={selectProduct}
                onAddToCart={() => addProductById(selectedProductId)}
              />
            </div>

            {/* 장바구니 아이템 목록 */}
            <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm">
              <CartContainer
                cartItems={cartItems}
                onQuantityChange={updateItemQuantity}
                onRemoveItem={removeItemFromCart}
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
      <HelpModal isOpen={isHelpModalOpen} onClose={closeHelpModal} />

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
