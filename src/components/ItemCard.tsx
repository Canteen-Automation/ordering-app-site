import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { FoodItem } from '../types';
import { useCart } from '../contexts/CartContext';
import './ItemCard.css';

interface ItemCardProps {
  item: FoodItem;
  isLast?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, isLast }) => {
  const navigate = useNavigate();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);

  return (
    <div 
      className={`item-card ${isLast ? 'last' : ''} ${item.stock === 0 ? 'out-of-stock' : ''}`} 
      onClick={() => navigate(`/item/${item.id}`)}
    >
      <div className="item-info">
        <div className="item-labels">
          <div className={`veg-icon ${item.isVeg ? 'veg' : 'non-veg'}`}>
            <div className="dot" />
          </div>
          {item.isPopular && <span className="bestseller-badge">Popular</span>}
          {item.stock === 0 && <span className="out-of-stock-badge">Out of Stock</span>}
        </div>
        
        <h3 className="item-name">{item.name}</h3>
        <p className="item-price">₹{item.price.toFixed(2)}</p>
        
        <p className="item-description">{item.description}</p>
      </div>

      <div className="item-image-container" onClick={(e) => e.stopPropagation()}>
        {item.image ? (
          <img src={item.image} alt={item.name} className="item-image" />
        ) : (
          <div className="item-image-placeholder">
            <span className="placeholder-icon">🍲</span>
          </div>
        )}
        
        <div className="add-to-cart-container">
          {quantity === 0 ? (
            <button 
              className="add-button"
              onClick={() => addToCart(item)}
              disabled={item.stock === 0}
            >
              {item.stock === 0 ? 'SOLD OUT' : 'ADD'}
            </button>
          ) : (
            <div className="quantity-controls">
              <button onClick={() => updateQuantity(item.id, -1)}>−</button>
              <span className="quantity">{quantity}</span>
              <button onClick={() => addToCart(item)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
