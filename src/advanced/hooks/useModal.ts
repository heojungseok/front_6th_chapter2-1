import { useState, useCallback } from 'react';

export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  // 모달 열기
  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  // 모달 닫기
  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 모달 토글
  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};
