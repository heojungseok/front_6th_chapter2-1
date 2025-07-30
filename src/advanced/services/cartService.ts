import { Product, CartItem, CartSummary } from '../types';
import { calculateDiscounts } from './discountService';
import { calculateLoyaltyPoints } from './loyaltyService';

// 장바구니 아이템 생성
export const createCartItem = (product: Product, quantity: number): CartItem => {
  return {
    product,
    quantity,
    itemTotal: product.price * quantity
  };
};

// 장바구니 아이템 업데이트
export const updateCartItem = (item: CartItem, newQuantity: number): CartItem => {
  return {
    ...item,
    quantity: newQuantity,
    itemTotal: item.product.price * newQuantity
  };
};

// 장바구니에 상품 추가
export const addToCart = (
  currentItems: CartItem[],
  product: Product,
  quantity: number
): CartItem[] => {
  const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);
  
  if (existingItemIndex >= 0) {
    // 기존 아이템 수량 증가
    const existingItem = currentItems[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;
    
    const updatedItems = [...currentItems];
    updatedItems[existingItemIndex] = updateCartItem(existingItem, newQuantity);
    
    return updatedItems;
  } else {
    // 새 아이템 추가
    const newItem = createCartItem(product, quantity);
    return [...currentItems, newItem];
  }
};

// 장바구니에서 상품 제거
export const removeFromCart = (
  currentItems: CartItem[],
  productId: string
): CartItem[] => {
  return currentItems.filter(item => item.product.id !== productId);
};

// 장바구니 아이템 수량 변경
export const updateCartItemQuantity = (
  currentItems: CartItem[],
  productId: string,
  newQuantity: number
): CartItem[] => {
  if (newQuantity <= 0) {
    return removeFromCart(currentItems, productId);
  }
  
  return currentItems.map(item => 
    item.product.id === productId 
      ? updateCartItem(item, newQuantity)
      : item
  );
};

// 장바구니 요약 계산
export const calculateCartSummary = (
  items: CartItem[],
  flashSaleProductId: string | null = null,
  recommendationProductId: string | null = null
): CartSummary => {
  if (items.length === 0) {
    return {
      items: [],
      subtotal: 0,
      totalQuantity: 0,
      discountData: {
        totalAmount: 0,
        itemDiscounts: [],
        discountRate: 0
      },
      loyaltyPoints: {
        finalPoints: 0,
        pointsDetail: {
          basePoints: 0,
          bonusPoints: 0,
          bulkBonus: 0
        }
      }
    };
  }
  
  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // 할인 계산 (타이머 상태 반영)
  const discountData = calculateDiscounts(items, flashSaleProductId, recommendationProductId);
  
  // 포인트 계산
  const loyaltyPoints = calculateLoyaltyPoints(
    discountData.totalAmount,
    totalQuantity,
    items
  );
  
  return {
    items,
    subtotal,
    totalQuantity,
    discountData,
    loyaltyPoints
  };
};

// 재고 확인
export const checkStockAvailability = (
  product: Product,
  currentQuantity: number,
  requestedQuantity: number
): boolean => {
  return product.stockQuantity >= (requestedQuantity - currentQuantity);
};

// 장바구니 비우기
export const clearCart = (): CartItem[] => {
  return [];
}; 