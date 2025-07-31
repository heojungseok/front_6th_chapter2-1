import { AppError, ErrorHandler, ErrorType } from '../types';

export const createErrorHandler = (): ErrorHandler => {
  const logError = (error: AppError): void => {
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      console.log(
        `[${error.type.toUpperCase()}] ${error.code}: ${error.message}`,
        error.details ? error.details : ''
      );
    }
  };

  const showAlert = (error: AppError): void => {
    const icon = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    }[error.type];

    const title =
      {
        STOCK_INSUFFICIENT: '재고 부족',
        PRODUCT_NOT_FOUND: '상품 오류',
        NETWORK_ERROR: '네트워크 오류',
        VALIDATION_ERROR: '입력 오류',
        TIMER_ERROR: '타이머 오류',
        CART_ERROR: '장바구니 오류',
        DISCOUNT_ERROR: '할인 오류',
        LOYALTY_ERROR: '포인트 오류',
      }[error.code] || '오류';

    alert(`${icon} ${title}\n${error.message}`);
  };

  const handleError = (error: AppError): void => {
    logError(error);
    showAlert(error);
  };

  const showError = (
    message: string,
    type: ErrorType = 'error',
    title?: string
  ): void => {
    const error: AppError = {
      code: 'VALIDATION_ERROR',
      message,
      type,
      timestamp: Date.now(),
    };

    if (title) {
      alert(
        `${type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'} ${title}\n${message}`
      );
    } else {
      handleError(error);
    }
  };

  const showStockError = (productName?: string): void => {
    const error: AppError = {
      code: 'STOCK_INSUFFICIENT',
      message: productName
        ? `${productName}의 재고가 부족합니다.`
        : '재고가 부족합니다.',
      type: 'warning',
      timestamp: Date.now(),
    };
    handleError(error);
  };

  const showProductNotFoundError = (productId: string): void => {
    const error: AppError = {
      code: 'PRODUCT_NOT_FOUND',
      message: `상품을 찾을 수 없습니다: ${productId}`,
      type: 'error',
      timestamp: Date.now(),
    };
    handleError(error);
  };

  const showNetworkError = (operation: string): void => {
    const error: AppError = {
      code: 'NETWORK_ERROR',
      message: `${operation} 중 네트워크 오류가 발생했습니다.`,
      type: 'error',
      timestamp: Date.now(),
    };
    handleError(error);
  };

  return {
    handleError,
    showError,
    showStockError,
    showProductNotFoundError,
    showNetworkError,
  };
};
