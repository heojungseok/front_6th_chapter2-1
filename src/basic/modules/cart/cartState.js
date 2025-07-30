// Cart state management module
import { findProductById } from '../data/productData.js';

// Global state - 함수형으로 변경
let globalState = {
  stockStatusDisplay: null,
  itemCount: 0,
  productSelectElement: null,
  totalAmount: 0,
  cartItemsContainer: null,
  cartTotalDisplay: null,
  lastSelectedProductId: null,
};

// 전역 상태 접근 함수들
export function getStockStatusDisplay() {
  return globalState.stockStatusDisplay;
}

export function setStockStatusDisplay(element) {
  globalState.stockStatusDisplay = element;
}

export function getItemCount() {
  return globalState.itemCount;
}

export function setItemCount(count) {
  globalState.itemCount = count;
}

export function getProductSelectElement() {
  return globalState.productSelectElement;
}

export function setProductSelectElement(element) {
  globalState.productSelectElement = element;
}

export function getTotalAmount() {
  return globalState.totalAmount;
}

export function setTotalAmount(amount) {
  globalState.totalAmount = amount;
}

export function getCartItemsContainer() {
  return globalState.cartItemsContainer;
}

export function setCartItemsContainer(container) {
  globalState.cartItemsContainer = container;
}

export function getCartTotalDisplay() {
  return globalState.cartTotalDisplay;
}

export function setCartTotalDisplay(display) {
  globalState.cartTotalDisplay = display;
}

export function getLastSelectedProductId() {
  return globalState.lastSelectedProductId;
}

export function setLastSelectedProductId(id) {
  globalState.lastSelectedProductId = id;
}

// Cart calculation functions
export function calculateCartItems(cartItems) {
  const items = Array.from(cartItems).map((itemElement) => {
    const product = findProductById(itemElement.id);
    const quantity = parseInt(
      itemElement.querySelector('.quantity-number').textContent
    );
    return {
      product,
      quantity,
      itemTotal: product.price * quantity,
    };
  });

  return {
    items,
    subtotal: items.reduce((sum, item) => sum + item.itemTotal, 0),
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

// Cart item management functions
export function updateExistingCartItem(cartItem, product) {
  const quantityElement = cartItem.querySelector('.quantity-number');
  const currentQuantity = parseInt(quantityElement.textContent);
  const newQuantity = currentQuantity + 1;

  if (newQuantity <= product.stockQuantity + currentQuantity) {
    quantityElement.textContent = newQuantity;
    product.stockQuantity--;
  } else {
    alert('재고가 부족합니다.');
  }
}

export function handleQuantityChange(productId, changeAmount) {
  const itemElement = document.getElementById(productId);
  const product = findProductById(productId);

  if (!itemElement || !product) return;

  const quantityElement = itemElement.querySelector('.quantity-number');
  const currentQuantity = parseInt(quantityElement.textContent);
  const newQuantity = currentQuantity + changeAmount;

  if (
    newQuantity > 0 &&
    newQuantity <= product.stockQuantity + currentQuantity
  ) {
    quantityElement.textContent = newQuantity;
    product.stockQuantity -= changeAmount;
  } else if (newQuantity <= 0) {
    product.stockQuantity += currentQuantity;
    itemElement.remove();
  } else {
    alert('재고가 부족합니다.');
  }
}

export function handleRemoveItem(productId) {
  const itemElement = document.getElementById(productId);
  const product = findProductById(productId);

  if (!itemElement || !product) return;

  const quantityElement = itemElement.querySelector('.quantity-number');
  const removedQuantity = parseInt(quantityElement.textContent);
  product.stockQuantity += removedQuantity;
  itemElement.remove();
}

// State initialization
export function initializeCartState() {
  setTotalAmount(0);
  setItemCount(0);
  setLastSelectedProductId(null);
}
