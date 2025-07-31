import { useState, useCallback } from 'react';

export const useProductSelection = (initialProductId: string = 'product1') => {
  const [selectedProductId, setSelectedProductId] =
    useState<string>(initialProductId);

  // 상품 선택
  const selectProduct = useCallback((productId: string) => {
    setSelectedProductId(productId);
  }, []);

  return {
    selectedProductId,
    selectProduct,
  };
};
