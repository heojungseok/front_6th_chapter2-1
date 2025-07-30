// UI 관련 상수
export const CURRENCY_SYMBOL = '₩';
export const SOLD_OUT_TEXT = '품절';
export const ORANGE_COLOR = 'orange';
export const EMPTY_STRING = '';

// CSS 클래스명
export const CSS_CLASSES = {
  PURPLE_BOLD: 'text-purple-600 font-bold',
  RED_BOLD: 'text-red-500 font-bold', 
  BLUE_BOLD: 'text-blue-500 font-bold',
  GRAY: 'text-gray-400',
  LINE_THROUGH: 'line-through text-gray-400'
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_SELECT_NOT_FOUND: 'Product select element not found',
  CART_ITEMS_NOT_FOUND: 'Cart items container not found',
  CART_TOTAL_NOT_FOUND: 'Cart total display not found',
  SELECTED_PRODUCT_NOT_FOUND: 'Selected product not found'
} as const;

// 콘솔 메시지
export const CONSOLE_MESSAGES = {
  STOCK_WARNING: (productName: string, stockQuantity: number): string => 
    `⚠️ ${productName}의 재고가 부족합니다. (${stockQuantity}개 남음)`,
  STOCK_CRITICAL: (productName: string): string => 
    `🚨 ${productName}의 재고가 거의 소진되었습니다!`
} as const;

// 할인 관련 상수
export const DISCOUNT_ICONS = {
  FLASH_SALE: '⚡',
  RECOMMENDATION: '💝',
  SUPER_SALE: '🔥'
} as const;

export const DISCOUNT_LABELS = {
  FLASH_SALE: 'SALE!',
  RECOMMENDATION: 'RECOMMENDED!',
  SUPER_SALE: 'SUPER SALE!'
} as const;

export const DISCOUNT_TEXTS = {
  FLASH_SALE: '번개세일',
  RECOMMENDATION: '추천할인',
  SUPER_SALE: '슈퍼세일'
} as const;

export const DISCOUNT_PERCENTAGES = {
  FLASH_SALE: 20,
  RECOMMENDATION: 5,
  SUPER_SALE: 25,
  BULK: 10,
  TUESDAY: 15
} as const;

// 상품 관련 상수
export const PRODUCT_CONSTANTS = {
  STOCK_WARNING_THRESHOLD: 5,
  LOW_STOCK_THRESHOLD: 2,
  BULK_DISCOUNT_THRESHOLD: 30
} as const;

// 포인트 관련 상수
export const POINTS_CONFIG = {
  BASE_POINTS_RATE: 0.01,
  BONUS_POINTS_RATE: 0.005,
  BULK_BONUS_THRESHOLD: 30,
  BULK_BONUS_POINTS: 100
} as const;

// 타이머 관련 상수
export const TIMING_CONFIG = {
  FLASH_SALE_DURATION: 10000,
  RECOMMENDATION_DURATION: 8000,
  CLEANUP_DELAY: 100
} as const; 