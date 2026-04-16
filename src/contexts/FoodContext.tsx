import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FoodItem, Category, Stall } from '../types';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface FoodContextType {
  categories: Category[];
  foodItems: FoodItem[];
  stalls: Stall[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

const EMOJIS = ['🍦', '🍪', '🧃', '🍫', '🥨', '🥐', '🍹', '📦', '🍳', '🍱', '🍔', '🍕', '🥗', '🍲'];
const COLORS = ['#FFF0F6', '#FFF7ED', '#FFFFEB', '#FDF3EF', '#F0FDF4', '#FEFCE8', '#EFF6FF'];

export const FoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [baseItemsSnap, productsSnap, stallsSnap] = await Promise.all([
        getDocs(collection(db, 'baseItems')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'stalls'))
      ]);

      const baseItemsData: any[] = [];
      baseItemsSnap.forEach(d => baseItemsData.push({ id: d.id, ...d.data() }));

      const productsData: any[] = [];
      productsSnap.forEach(d => productsData.push({ id: d.id, ...d.data() }));

      const stallsData: any[] = [];
      stallsSnap.forEach(d => stallsData.push({ id: d.id, ...d.data() }));

      // Map BaseItems to Categories
      const mappedCategories: Category[] = baseItemsData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        emoji: item.emoji || '🍕',
        image: item.image || '', 
        color: item.color || '#f1f5f9'
      }));

      // Map Stalls
      const mappedStalls: Stall[] = stallsData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || 'Our delicious stall',
        imageData: item.imageData || item.image || '',
        active: item.active !== false,
        temporarilyClosed: item.temporarilyClosed || false
      }));

      // Map Products to FoodItems
      const mappedFoodItems: FoodItem[] = productsData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || 'No description available',
        price: item.price || 0,
        category: item.category,
        image: item.image || '',
        isVeg: item.isVeg ?? true,
        isPopular: item.isPopular ?? true, 
        stock: item.stock || 0,
        stallId: item.stallId || '',
        stallName: item.stallName || ''
      }));

      setCategories(mappedCategories);
      setFoodItems(mappedFoodItems);
      setStalls(mappedStalls);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching food data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <FoodContext.Provider value={{ categories, foodItems, stalls, isLoading, error, refreshData: fetchData }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => {
  const context = useContext(FoodContext);
  if (context === undefined) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
};
