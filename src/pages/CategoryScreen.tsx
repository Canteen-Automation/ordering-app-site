import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ItemCard from '../components/ItemCard';
import CartTab from '../components/CartTab';
import BottomNav from '../components/BottomNav';
import { useFood } from '../contexts/FoodContext';

const CategoryScreen: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>(); // categoryId is actually categoryName now
  const { categories, foodItems, isLoading } = useFood();
  
  const category = categories.find((c) => c.name === categoryId);
  const items = foodItems.filter((item) => item.category === categoryId);

  if (isLoading && categories.length === 0) {
    return <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!category && !isLoading) return <div className="container" style={{ padding: 24 }}>Category not found: {categoryId}</div>;

  return (
    <div className="container">
      <Header title={category?.name || categoryId} />
      
      <main className="safe-area-bottom">
        <div className="items-list">
          {items.map((item, index) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              isLast={index === items.length - 1} 
            />
          ))}
          {items.length === 0 && !isLoading && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-mid)' }}>
              No items found in this category.
            </div>
          )}
        </div>
      </main>
      <CartTab />
      <BottomNav />
    </div>
  );
};

export default CategoryScreen;
