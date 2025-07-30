import { CartItem, DiscountData, ItemDiscount } from '../types';
import { DISCOUNT_PERCENTAGES, PRODUCT_CONSTANTS } from '../constants';

// 개별 상품 할인 계산
export const calculateIndividualDiscount = (item: CartItem): ItemDiscount => {
  const { product, quantity } = item;

  if (quantity < 10) {
    return {
      productId: product.id,
      discountAmount: 0,
      discountRate: 0,
      discountType: 'flash_sale',
    };
  }

  // 상품별 할인율 적용
  let discountRate = 0;
  switch (product.id) {
    case 'product1': // 키보드
      discountRate = 0.1;
      break;
    case 'product2': // 마우스
      discountRate = 0.15;
      break;
    case 'product3': // 모니터암
      discountRate = 0.2;
      break;
    case 'product4': // 노트북 파우치
      discountRate = 0.05;
      break;
    case 'product5': // Lo-Fi 스피커
      discountRate = 0.25;
      break;
    default:
      discountRate = 0;
  }

  const discountAmount = item.itemTotal * discountRate;

  return {
    productId: product.id,
    discountAmount,
    discountRate,
    discountType: 'flash_sale',
  };
};

// 전체 수량 할인 계산
export const calculateBulkDiscount = (items: CartItem[]): ItemDiscount[] => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity < PRODUCT_CONSTANTS.BULK_DISCOUNT_THRESHOLD) {
    return [];
  }

  // 전체 수량 할인이 개별 할인보다 우선
  return items.map((item) => ({
    productId: item.product.id,
    discountAmount: item.itemTotal * (DISCOUNT_PERCENTAGES.BULK / 100),
    discountRate: DISCOUNT_PERCENTAGES.BULK / 100,
    discountType: 'bulk',
  }));
};

// 화요일 할인 계산
export const calculateTuesdayDiscount = (items: CartItem[]): ItemDiscount[] => {
  const today = new Date();
  const isTuesday = today.getDay() === 2; // 0=일요일, 2=화요일

  if (!isTuesday) {
    return [];
  }

  return items.map((item) => ({
    productId: item.product.id,
    discountAmount: item.itemTotal * (DISCOUNT_PERCENTAGES.TUESDAY / 100),
    discountRate: DISCOUNT_PERCENTAGES.TUESDAY / 100,
    discountType: 'tuesday',
  }));
};

// 번개세일 할인 계산
export const calculateFlashSaleDiscount = (
  items: CartItem[],
  flashSaleProductId: string | null
): ItemDiscount[] => {
  if (!flashSaleProductId) return [];

  return items
    .filter((item) => item.product.id === flashSaleProductId)
    .map((item) => ({
      productId: item.product.id,
      discountAmount: item.itemTotal * (DISCOUNT_PERCENTAGES.FLASH_SALE / 100),
      discountRate: DISCOUNT_PERCENTAGES.FLASH_SALE / 100,
      discountType: 'flash_sale',
    }));
};

// 추천할인 계산
export const calculateRecommendationDiscount = (
  items: CartItem[],
  recommendationProductId: string | null
): ItemDiscount[] => {
  if (!recommendationProductId) return [];

  return items
    .filter((item) => item.product.id === recommendationProductId)
    .map((item) => ({
      productId: item.product.id,
      discountAmount:
        item.itemTotal * (DISCOUNT_PERCENTAGES.RECOMMENDATION / 100),
      discountRate: DISCOUNT_PERCENTAGES.RECOMMENDATION / 100,
      discountType: 'recommendation',
    }));
};

// SUPER SALE 할인 계산 (번개세일 + 추천할인 동시 적용)
export const calculateSuperSaleDiscount = (
  items: CartItem[],
  flashSaleProductId: string | null,
  recommendationProductId: string | null
): ItemDiscount[] => {
  if (!flashSaleProductId || !recommendationProductId) return [];

  // 번개세일과 추천할인이 같은 상품에 적용되는 경우
  if (flashSaleProductId === recommendationProductId) {
    return items
      .filter((item) => item.product.id === flashSaleProductId)
      .map((item) => ({
        productId: item.product.id,
        discountAmount:
          item.itemTotal * (DISCOUNT_PERCENTAGES.SUPER_SALE / 100),
        discountRate: DISCOUNT_PERCENTAGES.SUPER_SALE / 100,
        discountType: 'super_sale',
      }));
  }

  return [];
};

// 할인 중복 처리 (최대 할인율 적용)
export const mergeDiscounts = (
  allDiscounts: ItemDiscount[][]
): ItemDiscount[] => {
  const discountMap = new Map<string, ItemDiscount>();

  allDiscounts.flat().forEach((discount) => {
    const existing = discountMap.get(discount.productId);

    if (!existing || discount.discountRate > existing.discountRate) {
      discountMap.set(discount.productId, discount);
    }
  });

  return Array.from(discountMap.values());
};

// 전체 할인 계산
export const calculateDiscounts = (
  items: CartItem[],
  flashSaleProductId: string | null = null,
  recommendationProductId: string | null = null
): DiscountData => {
  if (items.length === 0) {
    return {
      totalAmount: 0,
      itemDiscounts: [],
      discountRate: 0,
    };
  }

  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);

  // 각종 할인 계산
  const individualDiscounts = items.map(calculateIndividualDiscount);
  const bulkDiscounts = calculateBulkDiscount(items);
  const tuesdayDiscounts = calculateTuesdayDiscount(items);
  const flashSaleDiscounts = calculateFlashSaleDiscount(
    items,
    flashSaleProductId
  );
  const recommendationDiscounts = calculateRecommendationDiscount(
    items,
    recommendationProductId
  );
  const superSaleDiscounts = calculateSuperSaleDiscount(
    items,
    flashSaleProductId,
    recommendationProductId
  );

  // 할인 중복 처리
  const allDiscounts = [
    individualDiscounts,
    bulkDiscounts,
    tuesdayDiscounts,
    flashSaleDiscounts,
    recommendationDiscounts,
    superSaleDiscounts,
  ];

  const finalDiscounts = mergeDiscounts(allDiscounts);
  const totalDiscountAmount = finalDiscounts.reduce(
    (sum, discount) => sum + discount.discountAmount,
    0
  );
  const totalAmount = subtotal - totalDiscountAmount;
  const discountRate =
    subtotal > 0 ? (totalDiscountAmount / subtotal) * 100 : 0;

  return {
    totalAmount,
    itemDiscounts: finalDiscounts,
    discountRate,
  };
};
