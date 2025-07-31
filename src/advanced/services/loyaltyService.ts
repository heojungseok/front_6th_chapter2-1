import { CartItem, LoyaltyPoints } from '../types';
import { POINTS_CONFIG } from '../constants';
import {
  POINTS_THRESHOLDS,
  POINTS_BONUS,
  PRODUCT_IDS,
  DAYS_OF_WEEK,
} from '../constants/businessRules';

// 기본 포인트 계산
export const calculateBasePoints = (totalAmount: number): number => {
  return Math.floor(totalAmount * POINTS_CONFIG.BASE_POINTS_RATE);
};

// 화요일 보너스 포인트 계산
export const calculateTuesdayBonus = (basePoints: number): number => {
  const today = new Date();
  const isTuesday = today.getDay() === DAYS_OF_WEEK.TUESDAY;

  return isTuesday ? basePoints : 0;
};

// 세트 구매 보너스 포인트 계산
export const calculateSetBonus = (items: CartItem[]): number => {
  const productIds = items.map((item) => item.product.id);

  // 키보드+마우스+모니터암 풀세트
  if (
    productIds.includes(PRODUCT_IDS.KEYBOARD) &&
    productIds.includes(PRODUCT_IDS.MOUSE) &&
    productIds.includes(PRODUCT_IDS.MONITOR_ARM)
  ) {
    return POINTS_BONUS.FULL_SET;
  }

  // 키보드+마우스 세트
  if (
    productIds.includes(PRODUCT_IDS.KEYBOARD) &&
    productIds.includes(PRODUCT_IDS.MOUSE)
  ) {
    return POINTS_BONUS.KEYBOARD_MOUSE_SET;
  }

  return 0;
};

// 수량별 보너스 포인트 계산
export const calculateQuantityBonus = (totalQuantity: number): number => {
  if (totalQuantity >= POINTS_THRESHOLDS.BULK_BONUS_QUANTITY_3) {
    return POINTS_BONUS.BULK_BONUS_3;
  }
  if (totalQuantity >= POINTS_THRESHOLDS.BULK_BONUS_QUANTITY_2) {
    return POINTS_BONUS.BULK_BONUS_2;
  }
  if (totalQuantity >= POINTS_THRESHOLDS.BULK_BONUS_QUANTITY_1) {
    return POINTS_BONUS.BULK_BONUS_1;
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
