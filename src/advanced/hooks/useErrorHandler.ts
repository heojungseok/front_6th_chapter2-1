import { useCallback } from 'react';

export type ErrorType = 'error' | 'warning' | 'info';

export interface ErrorMessage {
  type: ErrorType;
  message: string;
  title?: string;
}

interface UseErrorHandlerReturn {
  showError: (message: string, type?: ErrorType, title?: string) => void;
  showStockError: (productName?: string) => void;
  showProductNotFoundError: (productId: string) => void;
  showNetworkError: (operation: string) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const showError = useCallback(
    (message: string, type: ErrorType = 'error', title?: string) => {
      if (
        typeof window !== 'undefined' &&
        window.location.hostname === 'localhost'
      ) {
        console.log(
          `[${type.toUpperCase()}] ${title ? `${title}: ` : ''}${message}`
        );
      }

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
    },
    []
  );

  const showStockError = useCallback(
    (productName?: string) => {
      const message = productName
        ? `${productName}의 재고가 부족합니다.`
        : '재고가 부족합니다.';
      showError(message, 'warning', '재고 부족');
    },
    [showError]
  );

  const showProductNotFoundError = useCallback(
    (productId: string) => {
      showError(`상품을 찾을 수 없습니다: ${productId}`, 'error', '상품 오류');
    },
    [showError]
  );

  const showNetworkError = useCallback(
    (operation: string) => {
      showError(
        `${operation} 중 네트워크 오류가 발생했습니다.`,
        'error',
        '네트워크 오류'
      );
    },
    [showError]
  );

  return {
    showError,
    showStockError,
    showProductNotFoundError,
    showNetworkError,
  };
};
