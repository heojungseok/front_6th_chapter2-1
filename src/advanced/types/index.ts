// Product
export interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  isFlashSale: boolean;
  isRecommended: boolean;
  category: string;
}

// Cart
export interface CartItem {
  product: Product;
  quantity: number;
  itemTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  totalQuantity: number;
  discountData: DiscountData;
  loyaltyPoints: LoyaltyPoints;
}

// Discount
export interface DiscountData {
  totalAmount: number;
  itemDiscounts: ItemDiscount[];
  discountRate: number;
}

export interface ItemDiscount {
  productId: string;
  discountAmount: number;
  discountRate: number;
  discountType:
    | 'flash_sale'
    | 'recommendation'
    | 'bulk'
    | 'tuesday'
    | 'super_sale';
}

// Loyalty Points
export interface LoyaltyPoints {
  finalPoints: number;
  pointsDetail: {
    basePoints: number;
    bonusPoints: number;
    bulkBonus: number;
  };
}

// UI State
export interface UIState {
  selectedProductId: string | null;
  isManualMode: boolean;
  stockStatusDisplay: HTMLElement | null;
  productSelectElement: HTMLSelectElement | null;
  cartItemsContainer: HTMLElement | null;
  cartTotalDisplay: HTMLElement | null;
}

// Event Handlers
export type QuantityChangeHandler = (
  productId: string,
  changeAmount: number
) => void;
export type RemoveItemHandler = (productId: string) => void;
export type ProductSelectHandler = (productId: string) => void;
