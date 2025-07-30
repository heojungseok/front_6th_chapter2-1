import React from 'react';
import { CartItem as CartItemType } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { useTimer } from '../contexts/TimerContext';
import { calculateCartSummary } from '../services/cartService';
import { productList } from '../data/productData';

interface OrderSummaryProps {
  cartItems: CartItemType[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems }) => {
  const { timerState } = useTimer();

  // 장바구니 요약 계산 (타이머 상태 반영)
  const cartSummary = calculateCartSummary(
    cartItems,
    timerState.flashSaleProductId,
    timerState.recommendationProductId
  );

  // 화요일 할인 확인
  const isTuesday = new Date().getDay() === 2;

  return (
    <div className="bg-black text-white p-6 rounded-lg sticky top-4">
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
          <span>
            {CURRENCY_SYMBOL}
            {cartSummary.subtotal.toLocaleString()}
          </span>
        </div>

        {/* 할인 내역 표시 */}
        {cartSummary.discountData.itemDiscounts.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-300">적용된 할인:</div>
            {cartSummary.discountData.itemDiscounts.map((discount) => {
              const product = productList.find(
                (p) => p.id === discount.productId
              );
              return (
                <div
                  key={`discount-${discount.productId}-${Math.round(discount.discountRate * 100)}`}
                  className="flex justify-between text-sm"
                >
                  <span className="text-green-400">
                    {product?.name} ({Math.round(discount.discountRate * 100)}%
                    할인)
                  </span>
                  <span className="text-green-400">
                    -{CURRENCY_SYMBOL}
                    {discount.discountAmount.toLocaleString()}
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
          <span>
            {CURRENCY_SYMBOL}
            {cartSummary.discountData.totalAmount.toLocaleString()}
          </span>
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
                <span>
                  {' '}
                  + 보너스: {cartSummary.loyaltyPoints.pointsDetail.bonusPoints}
                  p
                </span>
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
  );
};

export default OrderSummary;
