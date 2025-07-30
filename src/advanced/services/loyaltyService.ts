import { CartItem, LoyaltyPoints } from '../types';
import { POINTS_CONFIG } from '../constants';

// 기본 포인트 계산
export const calculateBasePoints = (totalAmount: number): number => {
  return Math.floor(totalAmount * POINTS_CONFIG.BASE_POINTS_RATE);
};

// 화요일 보너스 포인트 계산
export const calculateTuesdayBonus = (basePoints: number): number => {
  const today = new Date();
  const isTuesday = today.getDay() === 2; // 0=일요일, 2=화요일

  return isTuesday ? basePoints : 0;
};

// 세트 구매 보너스 포인트 계산
export const calculateSetBonus = (items: CartItem[]): number => {
  const productIds = items.map((item) => item.product.id);

  // 키보드+마우스+모니터암 풀세트 (50p)
  if (
    productIds.includes('product1') &&
    productIds.includes('product2') &&
    productIds.includes('product3')
  ) {
    return 100;
  }

  // 키보드+마우스 세트 (30p)
  if (productIds.includes('product1') && productIds.includes('product2')) {
    return 50;
  }

  return 0;
};

// 수량별 보너스 포인트 계산
export const calculateQuantityBonus = (totalQuantity: number): number => {
  if (totalQuantity >= 30) {
    return POINTS_CONFIG.BULK_BONUS_POINTS;
  }
  if (totalQuantity >= 20) {
    return 50;
  }
  if (totalQuantity >= 10) {
    return 20;
  }

  return 0;
};

// 추가 보너스 포인트 계산
export const calculateAdditionalBonus = (totalAmount: number): number => {
  return Math.floor(totalAmount * POINTS_CONFIG.BONUS_POINTS_RATE);
};

// 전체 포인트 계산
export const calculateLoyaltyPoints = (
  totalAmount: number,
  totalQuantity: number,
  items: CartItem[]
): LoyaltyPoints => {
  // 기본 포인트
  const basePoints = calculateBasePoints(totalAmount);

  // 화요일 보너스
  const tuesdayBonus = calculateTuesdayBonus(basePoints);

  // 세트 구매 보너스
  const setBonus = calculateSetBonus(items);

  // 수량별 보너스
  const quantityBonus = calculateQuantityBonus(totalQuantity);

  // 추가 보너스
  const additionalBonus = calculateAdditionalBonus(totalAmount);

  // 최종 포인트
  const finalPoints =
    basePoints + tuesdayBonus + setBonus + quantityBonus + additionalBonus;

  return {
    finalPoints,
    pointsDetail: {
      basePoints,
      bonusPoints: tuesdayBonus + setBonus + quantityBonus + additionalBonus,
      bulkBonus: quantityBonus,
    },
  };
};
