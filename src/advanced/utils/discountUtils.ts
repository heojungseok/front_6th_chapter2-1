import { DiscountType } from '../types';

/**
 * 상품의 할인 타입을 확인하는 유틸리티 함수
 * @param productId - 상품 ID
 * @param flashSaleProductId - 번개세일 상품 ID
 * @param recommendationProductId - 추천할인 상품 ID
 * @returns 할인 타입 또는 null
 */
export const getDiscountType = (
  productId: string,
  flashSaleProductId: string | null,
  recommendationProductId: string | null
): DiscountType | null => {
  // SUPER SALE (번개세일 + 추천할인 동시 적용)
  if (
    flashSaleProductId === productId &&
    recommendationProductId === productId
  ) {
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
