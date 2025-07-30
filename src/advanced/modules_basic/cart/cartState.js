// Cart state management module
import { findProductById } from '../data/productData.js';

// 전역 상태 객체
let globalState = {
  // DOM 요소들
  stockStatusDisplay: null,
  productSelectElement: null,
  cartItemsContainer: null,
  cartTotalDisplay: null,

  // 비즈니스 상태
  itemCount: 0,
  totalAmount: 0,
  lastSelectedProductId: null,
};

// 상태 변경 구독자들 (React의 리렌더링과 유사)
const subscribers = new Set();

// 상태 변경 알림 함수
function notifySubscribers() {
  subscribers.forEach((callback) => callback(globalState));
}

// 구독 함수 (React의 useEffect와 유사)
export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

// 상태 업데이트 함수 (React의 setState와 유사)
export function updateState(updates) {
  globalState = { ...globalState, ...updates };
  notifySubscribers();
}

// Getter 함수들
export function getStockStatusDisplay() {
  return globalState.stockStatusDisplay;
}

export function getItemCount() {
  return globalState.itemCount;
}

export function getProductSelectElement() {
  return globalState.productSelectElement;
}

export function getTotalAmount() {
  return globalState.totalAmount;
}

export function getCartItemsContainer() {
  return globalState.cartItemsContainer;
}

export function getCartTotalDisplay() {
  return globalState.cartTotalDisplay;
}

export function getLastSelectedProductId() {
  return globalState.lastSelectedProductId;
}

// Setter 함수들 (상태 변경 시 알림)
export function setStockStatusDisplay(element) {
  updateState({ stockStatusDisplay: element });
}

export function setItemCount(count) {
  updateState({ itemCount: count });
}

export function setProductSelectElement(element) {
  updateState({ productSelectElement: element });
}

export function setTotalAmount(amount) {
  updateState({ totalAmount: amount });
}

export function setCartItemsContainer(container) {
  updateState({ cartItemsContainer: container });
}

export function setCartTotalDisplay(display) {
  updateState({ cartTotalDisplay: display });
}

export function setLastSelectedProductId(id) {
  updateState({ lastSelectedProductId: id });
}

// 장바구니 계산 함수들
export function calculateCartItems(cartItems) {
  const items = [];
  let subtotal = 0;
  let totalQuantity = 0;

  for (let i = 0; i < cartItems.length; i++) {
    const itemElement = cartItems[i];
    const product = findProductById(itemElement.id);
    if (!product) continue;

    const quantity = parseInt(
      itemElement.querySelector('.quantity-number').textContent
    );
    const itemTotal = product.price * quantity;

    items.push({ product, quantity, itemTotal });
    subtotal += itemTotal;
    totalQuantity += quantity;
  }

  return { items, subtotal, totalQuantity };
}

export function updateExistingCartItem(cartItem, product) {
  const quantityElement = cartItem.querySelector('.quantity-number');
  const currentQuantity = parseInt(quantityElement.textContent);
  const newQuantity = currentQuantity + 1;

  // 재고가 있는 경우에만 수량 증가
  if (product.stockQuantity > 0) {
    quantityElement.textContent = newQuantity;
    product.stockQuantity--;
  } else {
    // 재고 부족 시 알림
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('재고가 부족합니다.');
    }
  }
}

export function handleQuantityChange(productId, changeAmount) {
  const cartItem = document.getElementById(productId);
  if (!cartItem) return;

  const product = findProductById(productId);
  if (!product) return;

  const quantityElement = cartItem.querySelector('.quantity-number');
  const currentQuantity = parseInt(quantityElement.textContent);
  const newQuantity = currentQuantity + changeAmount;

  if (newQuantity <= 0) {
    handleRemoveItem(productId);
    return;
  }

  // 재고 제한 확인 - 현재 장바구니 수량 + 재고를 초과할 수 없음
  if (
    changeAmount > 0 &&
    newQuantity > currentQuantity + product.stockQuantity
  ) {
    // 재고 부족 시 알림
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('재고가 부족합니다.');
    }
    return;
  }

  // 수량 변경 가능한 경우에만 처리
  if (newQuantity <= currentQuantity + product.stockQuantity) {
    quantityElement.textContent = newQuantity;
    product.stockQuantity -= changeAmount;
  }
}

export function handleRemoveItem(productId) {
  const cartItem = document.getElementById(productId);
  if (!cartItem) return;

  const product = findProductById(productId);
  if (!product) return;

  const quantityElement = cartItem.querySelector('.quantity-number');
  const quantity = parseInt(quantityElement.textContent);
  product.stockQuantity += quantity;

  cartItem.remove();
}

// 상태 초기화 함수
export function initializeCartState() {
  updateState({
    itemCount: 0,
    totalAmount: 0,
    lastSelectedProductId: null,
  });
}

// 상태 스냅샷 함수 (디버깅용)
export function getStateSnapshot() {
  return { ...globalState };
}
