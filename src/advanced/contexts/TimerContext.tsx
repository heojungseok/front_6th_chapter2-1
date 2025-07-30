import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TimerState, timerService } from '../services/timerService';
import { productList } from '../data/productData';

// Context 타입 정의
interface TimerContextType {
  timerState: TimerState;
  updateLastSelectedProduct: (productId: string) => void;
}

// Context 생성
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Provider Props 타입
interface TimerProviderProps {
  children: ReactNode;
}

// Provider 컴포넌트
export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [timerState, setTimerState] = useState<TimerState>({
    isFlashSaleActive: false,
    isRecommendationActive: false,
    flashSaleProductId: null,
    recommendationProductId: null,
    lastSelectedProductId: null
  });

  // 타이머 서비스 초기화
  useEffect(() => {
    const handleFlashSaleChange = (productId: string) => {
      if (productId) {
        // 번개세일 시작 알림
        alert(`⚡ 번개세일! ${productList.find(p => p.id === productId)?.name} 상품이 20% 할인됩니다!`);
      }
    };

    const handleRecommendationChange = (productId: string) => {
      if (productId) {
        // 추천할인 시작 알림
        alert(`💝 추천할인! ${productList.find(p => p.id === productId)?.name} 상품이 5% 할인됩니다!`);
      }
    };

    const handleStateChange = (newState: TimerState) => {
      setTimerState(newState);
    };

    // 타이머 서비스 초기화
    timerService.initialize(
      productList,
      handleFlashSaleChange,
      handleRecommendationChange,
      handleStateChange
    );

    // 컴포넌트 언마운트 시 정리
    return () => {
      timerService.cleanup();
    };
  }, []);

  // 마지막 선택 상품 업데이트
  const updateLastSelectedProduct = (productId: string) => {
    timerService.updateLastSelectedProduct(productId);
  };

  const value: TimerContextType = {
    timerState,
    updateLastSelectedProduct
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

// Custom Hook
export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}; 