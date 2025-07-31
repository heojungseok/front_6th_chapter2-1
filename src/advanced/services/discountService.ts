import { CartItem, DiscountData, ItemDiscount } from '../types';
import { DISCOUNT_PERCENTAGES } from '../constants';
import {
  DISCOUNT_THRESHOLDS,
  PRODUCT_DISCOUNT_MAP,
  DAYS_OF_WEEK,
} from '../constants/businessRules';

export const calculateIndividualDiscount = (item: CartItem): ItemDiscount => {
  const { product, quantity } = item;

  if (quantity < DISCOUNT_THRESHOLDS.INDIVIDUAL_DISCOUNT_MIN_QUANTITY) {
    return {
      productId: product.id,
      discountAmount: 0,
      discountRate: 0,
      discountType: 'flash_sale',
    };
  }

  // 상품별 할인율 적용 (매핑 테이블 사용)
  const discountRate =
    PRODUCT_DISCOUNT_MAP[product.id as keyof typeof PRODUCT_DISCOUNT_MAP] || 0;

  const discountAmount = item.itemTotal * discountRate;

  return {
    productId: product.id,
    discountAmount,
    discountRate,
    discountType: 'flash_sale',
  };
};

export const calculateBulkDiscount = (items: CartItem[]): ItemDiscount[] => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity < DISCOUNT_THRESHOLDS.BULK_DISCOUNT_MIN_QUANTITY) {
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

export const calculateTuesdayDiscount = (items: CartItem[]): ItemDiscount[] => {
  const today = new Date();
  const isTuesday = today.getDay() === DAYS_OF_WEEK.TUESDAY;

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

// 빈 할인 데이터 생성
const createEmptyDiscountData = (): DiscountData => ({
  totalAmount: 0,
  itemDiscounts: [],
  discountRate: 0,
});

// 모든 할인 유형 계산
const calculateAllDiscountTypes = (
  items: CartItem[],
  flashSaleProductId: string | null,
  recommendationProductId: string | null
) => {
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

  return [
    individualDiscounts,
    bulkDiscounts,
    tuesdayDiscounts,
    flashSaleDiscounts,
    recommendationDiscounts,
    superSaleDiscounts,
  ];
};

// 최종 할인 금액 및 할인율 계산
const calculateFinalDiscountAmount = (
  finalDiscounts: ItemDiscount[],
  subtotal: number
) => {
  const totalDiscountAmount = finalDiscounts.reduce(
    (sum, discount) => sum + discount.discountAmount,
    0
  );
  const totalAmount = subtotal - totalDiscountAmount;
  const discountRate =
    subtotal > 0 ? (totalDiscountAmount / subtotal) * 100 : 0;

  return { totalAmount, totalDiscountAmount, discountRate };
};

export const calculateDiscounts = (
  items: CartItem[],
  flashSaleProductId: string | null = null,
  recommendationProductId: string | null = null
): DiscountData => {
  if (items.length === 0) {
    return createEmptyDiscountData();
  }

  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  const allDiscounts = calculateAllDiscountTypes(
    items,
    flashSaleProductId,
    recommendationProductId
  );
  const finalDiscounts = mergeDiscounts(allDiscounts);
  const { totalAmount, discountRate } = calculateFinalDiscountAmount(
    finalDiscounts,
    subtotal
  );

  return {
    totalAmount,
    itemDiscounts: finalDiscounts,
    discountRate,
  };
};
