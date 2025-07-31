import { useState, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { productList } from '../data/productData';
import {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
} from '../services/cartService';
import { useErrorHandler } from './useErrorHandler';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { showStockError, showProductNotFoundError } = useErrorHandler();

  const addItemToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      const currentQuantity =
        cartItems.find((item) => item.product.id === product.id)?.quantity || 0;

      if (product.stockQuantity <= currentQuantity) {
        showStockError(product.name);
        return;
      }

      const updatedCart = addToCart(cartItems, product, quantity);
      setCartItems(updatedCart);
    },
    [cartItems, showStockError]
  );

  const removeItemFromCart = useCallback(
    (productId: string) => {
      const updatedCart = removeFromCart(cartItems, productId);
      setCartItems(updatedCart);
    },
    [cartItems]
  );

  const updateItemQuantity = useCallback(
    (productId: string, change: number) => {
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
    },
    [cartItems, removeItemFromCart]
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
