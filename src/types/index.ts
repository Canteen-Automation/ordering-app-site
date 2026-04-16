export interface FoodItem {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isPopular?: boolean;
  stock?: number;
  stallId?: string;
  stallName?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  image: string;
  color: string;
  description?: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
  stallId?: string;
  stallName?: string;
}

export interface User {
  id: number;
  mobileNumber: string;
  name: string;
  isLoggedIn: boolean;
}

export interface Stall {
  id: string;
  name: string;
  description: string;
  imageData: string;
  active: boolean;
  temporarilyClosed: boolean;
  products?: FoodItem[];
}

export interface Order {
  id: string;
  orderNumber: string;
  displayOrderId: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  archived: boolean;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}
