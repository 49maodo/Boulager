export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'client';
  phone?: string;
  address?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  allergens: string[];
  isAvailable: boolean;
  promotionId?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryAddress?: string;
  deliveryType: 'pickup' | 'delivery';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number;
  minAmount?: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableProducts: string[];
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  orderId?: string;
  clientId: string;
  employeeId?: string;
  message: string;
  sender: 'client' | 'employee' | 'system';
  timestamp: Date;
  isRead: boolean;
}

export interface Invoice {
  id: string;
  orderId: string;
  clientId: string;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  pdfUrl?: string;
}