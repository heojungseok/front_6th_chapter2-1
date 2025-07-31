import { AppError, ErrorCode, ErrorType } from '../types';

export const createAppError = (
  code: ErrorCode,
  message: string,
  type: ErrorType = 'error',
  details?: unknown
): AppError => ({
  code,
  message,
  type,
  details,
  timestamp: Date.now(),
});

export const createStockError = (productName?: string): AppError =>
  createAppError(
    'STOCK_INSUFFICIENT',
    productName ? `${productName}의 재고가 부족합니다.` : '재고가 부족합니다.',
    'warning'
  );

export const createProductNotFoundError = (productId: string): AppError =>
  createAppError(
    'PRODUCT_NOT_FOUND',
    `상품을 찾을 수 없습니다: ${productId}`,
    'error'
  );

export const createNetworkError = (operation: string): AppError =>
  createAppError(
    'NETWORK_ERROR',
    `${operation} 중 네트워크 오류가 발생했습니다.`,
    'error'
  );

export const createValidationError = (message: string): AppError =>
  createAppError('VALIDATION_ERROR', message, 'warning');

export const createTimerError = (message: string): AppError =>
  createAppError('TIMER_ERROR', message, 'error');

export const createCartError = (message: string): AppError =>
  createAppError('CART_ERROR', message, 'error');

export const createDiscountError = (message: string): AppError =>
  createAppError('DISCOUNT_ERROR', message, 'warning');

export const createLoyaltyError = (message: string): AppError =>
  createAppError('LOYALTY_ERROR', message, 'warning');
