// 타이머 관리 모듈 import
import {
  startLightningSaleTimer,
  startRecommendationTimer,
  stopAllTimers,
} from './modules/promotion/promotionScheduler.js';

// Product data and constants import
import {
  PRODUCT_CONSTANTS,
  DISCOUNT_RATES,
  POINTS_CONFIG,
  TIMING_CONFIG,
  STOCK_WARNING_THRESHOLD,
  LOW_STOCK_THRESHOLD,
  productList,
  findProductById,
  getTotalStock,
  getLowStockProducts,
  getOutOfStockProducts,
} from './modules/data/productData.js';

// Discount service import
import {
  calculateIndividualDiscount,
  calculateBulkDiscount,
  calculateTuesdayDiscount,
  calculateDiscounts,
  isTuesday,
} from './modules/services/discountService.js';

// Loyalty service import
import { calculateLoyaltyPoints } from './modules/services/loyaltyService.js';

// Cart state management import
import {
  getStockStatusDisplay,
  setStockStatusDisplay,
  getItemCount,
  setItemCount,
  getProductSelectElement,
  setProductSelectElement,
  getTotalAmount,
  setTotalAmount,
  getCartItemsContainer,
  setCartItemsContainer,
  getCartTotalDisplay,
  setCartTotalDisplay,
  getLastSelectedProductId,
  setLastSelectedProductId,
  calculateCartItems,
  updateExistingCartItem,
  handleQuantityChange,
  handleRemoveItem,
  initializeCartState,
} from './modules/cart/cartState.js';

// 중복 코드 제거를 위한 헬퍼 함수들
function getRequiredElement(
  getterFunction,
  errorMessage = 'Required element not found'
) {
  const element = getterFunction();
  if (!element) {
    console.warn(errorMessage);
    return null;
  }
  return element;
}

function getRequiredProduct(productId, errorMessage = 'Product not found') {
  const product = findProductById(productId);
  if (!product) {
    console.warn(errorMessage);
    return null;
  }
  return product;
}

function getPriceDisplay(product) {
  if (!product.isFlashSale && !product.isRecommended) {
    return formatPrice(product.price);
  }

  const priceClass =
    product.isFlashSale && product.isRecommended
      ? 'text-purple-600'
      : product.isFlashSale
        ? 'text-red-500'
        : 'text-blue-500';

  return `
    <span class="line-through text-gray-400">${formatPrice(product.originalPrice)}</span>
    <span class="${priceClass}">${formatPrice(product.price)}</span>
  `;
}

function getDiscountIcon(product) {
  return `${product.isFlashSale ? '⚡' : ''}${product.isRecommended ? '💝' : ''}`;
}

function getDiscountClassName(product) {
  if (product.isFlashSale && product.isRecommended) {
    return 'text-purple-600 font-bold';
  } else if (product.isFlashSale) {
    return 'text-red-500 font-bold';
  } else if (product.isRecommended) {
    return 'text-blue-500 font-bold';
  }
  return '';
}

function formatPrice(price) {
  return '₩' + price.toLocaleString();
}

function createProductOption(product) {
  const option = document.createElement('option');
  option.value = product.id;

  const discountText =
    getDiscountIcon(product) +
    (product.isFlashSale ? 'SALE' : '') +
    (product.isRecommended ? '추천' : '');

  if (product.stockQuantity === 0) {
    option.textContent = `${product.name} - ${product.price}원 (품절)${discountText}`;
    option.disabled = true;
    option.className = 'text-gray-400';
  } else {
    const discountIcon = getDiscountIcon(product);
    const className = getDiscountClassName(product);

    if (product.isFlashSale || product.isRecommended) {
      const discountPercent =
        product.isFlashSale && product.isRecommended
          ? 25
          : product.isFlashSale
            ? 20
            : 5;
      const discountLabel =
        product.isFlashSale && product.isRecommended
          ? 'SUPER SALE!'
          : product.isFlashSale
            ? 'SALE!'
            : '추천할인!';
      option.textContent = `${discountIcon}${product.name} - ${product.originalPrice}원 → ${product.price}원 (${discountPercent}% ${discountLabel})`;
      option.className = className;
    } else {
      option.textContent = `${product.name} - ${product.price}원${discountText}`;
    }
  }

  return option;
}

function updateSelectOptions() {
  const productSelectElement = getRequiredElement(
    getProductSelectElement,
    'Product select element not found'
  );
  if (!productSelectElement) return 0;

  productSelectElement.innerHTML = '';
  const totalStock = getTotalStock();

  productList.forEach((product) => {
    const option = createProductOption(product);
    productSelectElement.appendChild(option);
  });

  if (totalStock < LOW_STOCK_THRESHOLD) {
    productSelectElement.style.borderColor = 'orange';
  } else {
    productSelectElement.style.borderColor = '';
  }

  return totalStock;
}

function updateStockInfo() {
  const stockStatusDisplay = getRequiredElement(
    getStockStatusDisplay,
    'Stock status display not found'
  );
  if (!stockStatusDisplay) return;

  const lowStockItems = getLowStockProducts();
  const outOfStockItems = getOutOfStockProducts();

  let stockMessage = '';

  lowStockItems.forEach((item) => {
    stockMessage += `${item.name}: 재고 부족 (${item.stockQuantity}개 남음)\n`;
  });

  outOfStockItems.forEach((item) => {
    stockMessage += `${item.name}: 품절\n`;
  });

  stockStatusDisplay.textContent = stockMessage;
}

function updatePricesInCart() {
  const cartItemsContainer = getRequiredElement(
    getCartItemsContainer,
    'Cart items container not found'
  );
  if (!cartItemsContainer) return;

  const cartItems = cartItemsContainer.children;

  for (let i = 0; i < cartItems.length; i++) {
    const itemElement = cartItems[i];
    const product = getRequiredProduct(
      itemElement.id,
      `Product with id ${itemElement.id} not found`
    );

    if (product) {
      const priceDiv = itemElement.querySelector('.text-lg');
      const nameDiv = itemElement.querySelector('h3');

      priceDiv.innerHTML = getPriceDisplay(product);
      nameDiv.textContent = getDiscountIcon(product) + product.name;
    }
  }

  updateCartCalculations();
}

function updateLoyaltyPointsDisplay(points, pointsDetail) {
  const loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (!loyaltyPointsDiv) return;

  if (getCartItemsContainer().children.length === 0) {
    loyaltyPointsDiv.style.display = 'none';
    return;
  }

  if (points > 0) {
    loyaltyPointsDiv.innerHTML = `
      <div>적립 포인트: <span class="font-bold">${points}p</span></div>
      <div class="text-2xs opacity-70 mt-1">${pointsDetail.join(', ')}</div>
    `;
    loyaltyPointsDiv.style.display = 'block';
  } else {
    loyaltyPointsDiv.textContent = '적립 포인트: 0p';
    loyaltyPointsDiv.style.display = 'block';
  }
}

function updateItemCountDisplay(count) {
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${count} items in cart`;
  }
}

function updateSummaryDetails(cartItems, subtotal, itemDiscounts) {
  const summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';

  if (subtotal > 0) {
    // Add individual items
    Array.from(cartItems).forEach((itemElement) => {
      const product = findProductById(itemElement.id);
      const quantity = parseInt(
        itemElement.querySelector('.quantity-number').textContent
      );
      const itemTotal = product.price * quantity;

      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${product.name} x ${quantity}</span>
          <span>${formatPrice(itemTotal)}</span>
        </div>
      `;
    });

    // Add subtotal
    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>${formatPrice(subtotal)}</span>
          </div>
    `;

    // Add bulk discount
    if (getItemCount() >= DISCOUNT_RATES.BULK_PURCHASE_THRESHOLD) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-${DISCOUNT_RATES.BULK_PURCHASE_DISCOUNT}%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach((item) => {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
        </div>
      `;
      });
    }

    // Add Tuesday discount
    if (isTuesday()) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-purple-400">
          <span class="text-xs">🌟 화요일 추가 할인</span>
          <span class="text-xs">-${DISCOUNT_RATES.TUESDAY_DISCOUNT}%</span>
        </div>
      `;
    }

    // Add shipping
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }
}

function updateDiscountInfo(discountRate, totalAmount, originalTotal) {
  const discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';

  if (discountRate > 0 && totalAmount > 0) {
    const savedAmount = originalTotal - totalAmount;
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(discountRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">${formatPrice(Math.round(savedAmount))} 할인되었습니다</div>
      </div>
    `;
  }
}

function updateTuesdaySpecialDisplay() {
  const tuesdaySpecial = document.getElementById('tuesday-special');
  const totalAmount = getTotalAmount();
  if (isTuesday() && totalAmount > 0) {
    tuesdaySpecial.classList.remove('hidden');
  } else {
    tuesdaySpecial.classList.add('hidden');
  }
}

// DOM 생성 함수들
function createHeader() {
  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;
  return header;
}

function createProductSelector() {
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';

  const productSelectElement = document.createElement('select');
  productSelectElement.id = 'product-select';
  productSelectElement.className =
    'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  const addBtn = document.createElement('button');
  addBtn.id = 'add-to-cart';
  addBtn.innerHTML = 'Add to Cart';
  addBtn.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';
  addBtn.addEventListener('click', insertProductToCart);

  const stockStatusDisplay = document.createElement('div');
  stockStatusDisplay.id = 'stock-status';
  stockStatusDisplay.className =
    'text-xs text-red-500 mt-3 whitespace-pre-line';

  // 전역 상태에 저장
  setProductSelectElement(productSelectElement);
  setStockStatusDisplay(stockStatusDisplay);

  selectorContainer.appendChild(productSelectElement);
  selectorContainer.appendChild(addBtn);
  selectorContainer.appendChild(stockStatusDisplay);

  return selectorContainer;
}

function initializeCartDisplay() {
  const cartItemsContainer = document.createElement('div');
  cartItemsContainer.id = 'cart-items';
  setCartItemsContainer(cartItemsContainer);
}

function createOrderSummary() {
  const rightColumn = document.createElement('div');
  rightColumn.className = 'bg-black text-white p-8 flex flex-col';
  rightColumn.innerHTML = `
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div class="text-2xl tracking-tight">₩0</div>
          </div>
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  `;
  const cartTotalDisplay = rightColumn.querySelector('#cart-total');
  setCartTotalDisplay(cartTotalDisplay);
  return rightColumn;
}

function createManualOverlay() {
  const manualOverlay = document.createElement('div');
  const manualColumn = document.createElement('div');
  const manualToggle = document.createElement('button');

  manualToggle.className =
    'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  manualToggle.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle('hidden');
    manualColumn.classList.toggle('translate-x-full');
  };

  manualOverlay.className =
    'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  };

  manualColumn.className =
    'fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
  manualColumn.innerHTML = `
    <button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="document.querySelector('.fixed.inset-0').classList.add('hidden'); this.parentElement.classList.add('translate-x-full')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">개별 상품</p>
          <p class="text-gray-700 text-xs pl-2">
            • 키보드 10개↑: 10%<br>
            • 마우스 10개↑: 15%<br>
            • 모니터암 10개↑: 20%<br>
            • 스피커 10개↑: 25%
          </p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">전체 수량</p>
          <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">특별 할인</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: +10%<br>
            • ⚡번개세일: 20%<br>
            • 💝추천할인: 5%
          </p>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">기본</p>
          <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">추가</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: 2배<br>
            • 키보드+마우스: +50p<br>
            • 풀세트: +100p<br>
            • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
          </p>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 pt-4 mt-4">
      <p class="text-xs font-bold mb-1">💡 TIP</p>
      <p class="text-2xs text-gray-600 leading-relaxed">
        • 화요일 대량구매 = MAX 혜택<br>
        • ⚡+💝 중복 가능<br>
        • 상품4 = 품절
      </p>
    </div>
  `;

  manualOverlay.appendChild(manualColumn);
  return { manualToggle, manualOverlay };
}

// 이벤트 핸들러 함수들
function insertProductToCart() {
  const productSelectElement = getRequiredElement(
    getProductSelectElement,
    'Product select element not found'
  );
  const cartItemsContainer = getRequiredElement(
    getCartItemsContainer,
    'Cart items container not found'
  );
  const cartTotalDisplay = getRequiredElement(
    getCartTotalDisplay,
    'Cart total display not found'
  );

  if (!productSelectElement || !cartItemsContainer || !cartTotalDisplay)
    return null;

  const selectedProduct = getRequiredProduct(
    productSelectElement.value,
    'Selected product not found'
  );
  if (!selectedProduct || selectedProduct.stockQuantity <= 0) return null;

  const existingCartItem = document.getElementById(selectedProduct.id);
  if (existingCartItem) {
    updateExistingCartItem(existingCartItem, selectedProduct);
  } else {
    createCartItem(selectedProduct);
  }

  updateCartCalculations();
  setLastSelectedProductId(selectedProduct.id);
}

function createCartItem(product) {
  const cartItemsContainer = getRequiredElement(
    getCartItemsContainer,
    'Cart items container not found'
  );
  if (!cartItemsContainer) return null;

  const cartItemElement = document.createElement('div');
  cartItemElement.id = product.id;
  cartItemElement.className =
    'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';

  const discountIcon = getDiscountIcon(product);
  const priceDisplay = getPriceDisplay(product);

  cartItemElement.innerHTML = `
    <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
    <div>
      <h3 class="text-base font-normal mb-1 tracking-tight">${discountIcon}${product.name}</h3>
      <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
      <p class="text-xs text-black mb-3">${priceDisplay}</p>
      <div class="flex items-center gap-4">
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="-1">−</button>
        <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="1">+</button>
      </div>
        </div>
    <div class="text-right">
      <div class="text-lg mb-2 tracking-tight tabular-nums">${priceDisplay}</div>
      <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${product.id}">Remove</a>
          </div>
        `;

  cartItemsContainer.appendChild(cartItemElement);
  product.stockQuantity--;
}

function handleCartItemClick(event) {
  const targetElement = event.target;

  if (
    !targetElement.classList.contains('quantity-change') &&
    !targetElement.classList.contains('remove-item')
  ) {
    return;
  }

  const productId = targetElement.dataset.productId;
  const product = getRequiredProduct(
    productId,
    `Product with id ${productId} not found`
  );

  if (!product) return;

  if (targetElement.classList.contains('quantity-change')) {
    const changeAmount = parseInt(targetElement.dataset.change);
    handleQuantityChange(productId, changeAmount);
  } else if (targetElement.classList.contains('remove-item')) {
    handleRemoveItem(productId);
  }

  // 재고가 부족한 경우 처리 (현재는 빈 블록이지만 향후 확장 가능)
  if (product && product.stockQuantity < STOCK_WARNING_THRESHOLD) {
    // 재고 부족 알림 로직 추가 가능
    console.warn(
      `⚠️ ${product.name}의 재고가 부족합니다. (${product.stockQuantity}개 남음)`
    );

    // 재고가 매우 적을 때 (2개 이하) 사용자에게 알림
    if (product.stockQuantity <= 2) {
      console.log(`🚨 ${product.name}의 재고가 거의 소진되었습니다!`);
    }
  }

  updateCartCalculations();
  updateSelectOptions();
}

// 타이머 정리 함수 (모듈 함수 래핑)
function cleanupTimers() {
  stopAllTimers();
}

// 초기화 함수
function initializeApp() {
  const rootElement = document.getElementById('app');

  // DOM 요소들 생성
  const header = createHeader();
  const productSelector = createProductSelector();
  initializeCartDisplay();
  const orderSummary = createOrderSummary();
  const { manualToggle, manualOverlay } = createManualOverlay();

  // 레이아웃 구성
  const gridContainer = document.createElement('div');
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  const leftColumn = document.createElement('div');
  leftColumn.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';
  leftColumn.appendChild(productSelector);
  leftColumn.appendChild(getCartItemsContainer());

  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(orderSummary);

  // DOM에 추가
  rootElement.appendChild(header);
  rootElement.appendChild(gridContainer);
  rootElement.appendChild(manualToggle);
  rootElement.appendChild(manualOverlay);

  // 초기 상태 설정
  updateSelectOptions();
  updateCartCalculations();

  // 타이머 시작 (모듈 함수 사용)
  startLightningSaleTimer(productList, updateSelectOptions, updatePricesInCart);
  startRecommendationTimer(
    productList,
    getLastSelectedProductId,
    updateSelectOptions,
    updatePricesInCart
  );
}

function updateCartCalculations() {
  const cartItemsContainer = getRequiredElement(
    getCartItemsContainer,
    'Cart items container not found'
  );
  const cartTotalDisplay = getRequiredElement(
    getCartTotalDisplay,
    'Cart total display not found'
  );
  if (!cartItemsContainer || !cartTotalDisplay) return null;

  const cartItems = cartItemsContainer.children;

  // Calculate cart items and totals
  const cartData = calculateCartItems(cartItems);
  const { items, subtotal, totalQuantity } = cartData;

  // Calculate discounts
  const discountData = calculateDiscounts(cartData);
  const {
    totalAmount: calculatedTotalAmount,
    itemDiscounts,
    discountRate,
  } = discountData;

  // Update global state
  setTotalAmount(calculatedTotalAmount);
  setItemCount(totalQuantity);

  // Update visual styling for bulk items
  items.forEach(({ product, quantity }) => {
    const itemElement = document.getElementById(product.id);
    if (itemElement) {
      const priceElements = itemElement.querySelectorAll('.text-lg, .text-xs');
      priceElements.forEach((elem) => {
        if (elem.classList.contains('text-lg')) {
          elem.style.fontWeight =
            quantity >= DISCOUNT_RATES.INDIVIDUAL_DISCOUNT_THRESHOLD
              ? 'bold'
              : 'normal';
        }
      });
    }
  });

  // Update UI
  updateItemCountDisplay(totalQuantity);
  updateSummaryDetails(cartItems, subtotal, itemDiscounts);
  updateDiscountInfo(discountRate, calculatedTotalAmount, subtotal);
  updateTuesdaySpecialDisplay();

  // Update total display
  const totalDiv = cartTotalDisplay.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = formatPrice(Math.round(calculatedTotalAmount));
  }

  // Calculate and display loyalty points
  const { finalPoints, pointsDetail } = calculateLoyaltyPoints(
    calculatedTotalAmount,
    totalQuantity,
    Array.from(cartItems)
  );
  updateLoyaltyPointsDisplay(finalPoints, pointsDetail);

  // Update stock information
  updateStockInfo();
}

// 최종 main 함수
function main() {
  // 기존 타이머 정리
  cleanupTimers();

  // 장바구니 상태 초기화
  initializeCartState();
  initializeApp();
  getCartItemsContainer().addEventListener('click', handleCartItemClick);
}

main();
