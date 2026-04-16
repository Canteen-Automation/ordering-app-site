import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { useFood } from '../contexts/FoodContext';
import CartTab from '../components/CartTab';
import './ItemDetailScreen.css';

const ItemDetailScreen: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { foodItems, isLoading } = useFood();
  
  const item = foodItems.find((i) => i.id === itemId);
  const quantity = item ? getItemQuantity(item.id) : 0;

  if (isLoading && foodItems.length === 0) {
    return <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!item && !isLoading) return <div className="container" style={{ padding: 24 }}>Item not found</div>;
  if (!item) return null;

  return (
    <div className={`container item-detail-page ${item.stock === 0 ? 'out-of-stock' : ''}`}>
      <Header title="" />
      
      <main className="safe-area-bottom">
        <div className="item-hero">
          {item.image ? (
            <img src={item.image} alt={item.name} className="item-hero-image" />
          ) : (
            <div className="item-hero-placeholder">
              <span className="placeholder-emoji">🍲</span>
            </div>
          )}
        </div>

        <div className="item-details-content">
          <div className="item-header-info">
            <div className="item-labels">
              <div className={`veg-icon ${item.isVeg ? 'veg' : 'non-veg'}`}>
                <div className="dot" />
              </div>
              {item.isPopular && <span className="bestseller-badge">Popular</span>}
              {item.stock === 0 && <span className="out-of-stock-badge">Sold Out</span>}
            </div>
            
            <h1 className="item-name-large">{item.name}</h1>
            <p className="item-price-large">₹{item.price.toFixed(2)}</p>
          </div>

          <div className="item-description-section">
            <h2 className="section-title">Description</h2>
            <p className="item-long-description">
              {item.longDescription || item.description}
            </p>
          </div>

          <div className="item-extra-info">
            <div className="info-row">
              <span className="info-label">Category</span>
              <span className="info-value">{item.category}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Dietary</span>
              <span className="info-value">{item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Availability</span>
              <span className={`info-value ${item.stock && item.stock > 0 ? 'green' : 'red'}`}>
                {item.stock && item.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="item-footer">
        <div className="footer-price-info">
          <span className="total-label">Price</span>
          <span className="total-value">₹{(item.price * Math.max(1, quantity)).toFixed(2)}</span>
        </div>
        
        <div className="footer-action">
          {quantity === 0 ? (
            <button 
              className="primary-action-button"
              onClick={() => addToCart(item)}
              disabled={item.stock === 0}
              style={{ opacity: item.stock === 0 ? 0.5 : 1 }}
            >
              {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          ) : (
            <div className="footer-quantity-controls">
              <button onClick={() => updateQuantity(item.id, -1)}>−</button>
              <span className="quantity">{quantity}</span>
              <button 
                onClick={() => addToCart(item)}
                disabled={item.stock !== undefined && quantity >= item.stock}
              >+</button>
            </div>
          )}
        </div>
      </footer>
      <CartTab />
    </div>
  );
};

export default ItemDetailScreen;
