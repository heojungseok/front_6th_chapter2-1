import { useState, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { productList } from '../data/productData';
import {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
} from '../services/cartService';
import { useErrorHandler } from './useErrorHandler';

interface UseCartReturn {
  cartItems: ReadonlyArray<CartItem>;
  addItemToCart: (product: Product, quantity?: number) => void;
  removeItemFromCart: (productId: string) => void;
  updateItemQuantity: (productId: string, change: number) => void;
  addProductById: (productId: string) => void;
}

export const useCart = (): UseCartReturn => {
  const [cartItems, setCartItems] = useState<ReadonlyArray<CartItem>>([]);
  const { handleError, showProductNotFoundError } = useErrorHandler();

  const addItemToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      try {
        const updatedCart = addToCart(cartItems, product, quantity);
        setCartItems(updatedCart);
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
          handleError(error as any);
        } else {
          handleError({
            code: 'CART_ERROR',
            message: '장바구니에 상품을 추가하는 중 오류가 발생했습니다.',
            type: 'error',
            timestamp: Date.now(),
          });
        }
      }
    },
    [cartItems, handleError]
  );

  const removeItemFromCart = useCallback(
    (productId: string) => {
      try {
        const updatedCart = removeFromCart(cartItems, productId);
        setCartItems(updatedCart);
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
          handleError(error as any);
        } else {
          handleError({
            code: 'CART_ERROR',
            message: '장바구니에서 상품을 제거하는 중 오류가 발생했습니다.',
            type: 'error',
            timestamp: Date.now(),
          });
        }
      }
    },
    [cartItems, handleError]
  );

  const updateItemQuantity = useCallback(
    (productId: string, change: number) => {
      try {
        const item = cartItems.find((item) => item.product.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + change;

        if (newQuantity <= 0) {
          removeItemFromCart(productId);
        } else {
          const updatedCart = updateCartItemQuantity(
            cartItems,
            productId,
            newQuantity
          );
          setCartItems(updatedCart);
        }
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error) {
          handleError(error as any);
        } else {
          handleError({
            code: 'CART_ERROR',
            message: '상품 수량을 변경하는 중 오류가 발생했습니다.',
            type: 'error',
            timestamp: Date.now(),
          });
        }
      }
    },
    [cartItems, removeItemFromCart, handleError]
  );

  const addProductById = useCallback(
    (productId: string) => {
      const product = productList.find((p) => p.id === productId);
      if (!product) {
        showProductNotFoundError(productId);
        return;
      }
      addItemToCart(product, 1);
    },
    [addItemToCart, showProductNotFoundError]
  );

  return {
    cartItems,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    addProductById,
  };
};
