import { useCallback } from 'react';

export type ErrorType = 'error' | 'warning' | 'info';

export interface ErrorMessage {
  type: ErrorType;
  message: string;
  title?: string;
}

/**
 * 에러 처리를 위한 커스텀 훅
 */
export const useErrorHandler = () => {
  const showError = useCallback((message: string, type: ErrorType = 'error', title?: string) => {
    const errorMessage: ErrorMessage = {
      type,
      message,
      title
    };

    // 개발 환경에서는 콘솔에 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console[type](`[${type.toUpperCase()}] ${title ? `${title}: ` : ''}${message}`);
    }

    // 사용자에게 알림 표시 (향후 토스트 알림으로 개선 가능)
    switch (type) {
      case 'error':
        alert(`❌ ${title ? `${title}\n` : ''}${message}`);
        break;
      case 'warning':
        alert(`⚠️ ${title ? `${title}\n` : ''}${message}`);
        break;
      case 'info':
        alert(`ℹ️ ${title ? `${title}\n` : ''}${message}`);
        break;
    }
  }, []);

  const showStockError = useCallback((productName?: string) => {
    const message = productName 
      ? `${productName}의 재고가 부족합니다.`
      : '재고가 부족합니다.';
    showError(message, 'warning', '재고 부족');
  }, [showError]);

  const showProductNotFoundError = useCallback((productId: string) => {
    showError(`상품을 찾을 수 없습니다: ${productId}`, 'error', '상품 오류');
  }, [showError]);

  const showNetworkError = useCallback((operation: string) => {
    showError(`${operation} 중 네트워크 오류가 발생했습니다.`, 'error', '네트워크 오류');
  }, [showError]);

  return {
    showError,
    showStockError,
    showProductNotFoundError,
    showNetworkError
  };
}; 