import { Product, CartItem, CartSummary } from '../types';
import { calculateDiscounts } from './discountService';
import { calculateLoyaltyPoints } from './loyaltyService';
import { createCartError, createStockError } from '../utils/errorFactory';

export const createCartItem = (
  product: Product,
  quantity: number
): CartItem => {
  if (quantity <= 0) {
    throw createCartError('수량은 1개 이상이어야 합니다.');
  }

  if (product.stockQuantity < quantity) {
    throw createStockError(product.name);
  }

  return {
    product,
    quantity,
    itemTotal: product.price * quantity,
  };
};

export const updateCartItem = (
  item: CartItem,
  newQuantity: number
): CartItem => {
  if (newQuantity < 0) {
    throw createCartError('수량은 0개 이상이어야 합니다.');
  }

  if (item.product.stockQuantity < newQuantity) {
    throw createStockError(item.product.name);
  }

  return {
    ...item,
    quantity: newQuantity,
    itemTotal: item.product.price * newQuantity,
  };
};

export const addToCart = (
  currentItems: ReadonlyArray<CartItem>,
  product: Product,
  quantity: number
): CartItem[] => {
  if (quantity <= 0) {
    throw createCartError('추가할 수량은 1개 이상이어야 합니다.');
  }

  const existingItemIndex = currentItems.findIndex(
    (item) => item.product.id === product.id
  );

  if (existingItemIndex >= 0) {
    const existingItem = currentItems[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;

    if (product.stockQuantity < newQuantity) {
      throw createStockError(product.name);
    }

    const updatedItems = [...currentItems];
    updatedItems[existingItemIndex] = updateCartItem(existingItem, newQuantity);

    return updatedItems;
  }

  const newItem = createCartItem(product, quantity);
  return [...currentItems, newItem];
};

export const removeFromCart = (
  currentItems: ReadonlyArray<CartItem>,
  productId: string
): CartItem[] => {
  const itemExists = currentItems.some((item) => item.product.id === productId);

  if (!itemExists) {
    throw createCartError('장바구니에 해당 상품이 없습니다.');
  }

  return currentItems.filter((item) => item.product.id !== productId);
};

export const updateCartItemQuantity = (
  currentItems: ReadonlyArray<CartItem>,
  productId: string,
  newQuantity: number
): CartItem[] => {
  if (newQuantity <= 0) {
    return removeFromCart(currentItems, productId);
  }

  const itemExists = currentItems.some((item) => item.product.id === productId);

  if (!itemExists) {
    throw createCartError('장바구니에 해당 상품이 없습니다.');
  }

  return currentItems.map((item) =>
    item.product.id === productId ? updateCartItem(item, newQuantity) : item
  );
};

const createEmptyCartSummary = (): CartSummary => ({
  items: [],
  subtotal: 0,
  totalQuantity: 0,
  discountData: {
    totalAmount: 0,
    itemDiscounts: [],
    discountRate: 0,
  },
  loyaltyPoints: {
    finalPoints: 0,
    pointsDetail: {
      basePoints: 0,
      bonusPoints: 0,
      bulkBonus: 0,
    },
  },
});

export const calculateCartSummary = (
  items: ReadonlyArray<CartItem>,
  flashSaleProductId: string | null = null,
  recommendationProductId: string | null = null
): CartSummary => {
  if (items.length === 0) {
    return createEmptyCartSummary();
  }

  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const discountData = calculateDiscounts(
    items,
    flashSaleProductId,
    recommendationProductId
  );

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
    loyaltyPoints,
  };
};

export const checkStockAvailability = (
  product: Product,
  currentQuantity: number,
  requestedQuantity: number
): boolean => {
  return product.stockQuantity >= requestedQuantity - currentQuantity;
};

export const clearCart = (): CartItem[] => {
  return [];
};
