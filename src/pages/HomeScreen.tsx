import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCcw, X } from 'lucide-react';
import Header from '../components/Header';
import ItemCard from '../components/ItemCard';
import CartTab from '../components/CartTab';
import BottomNav from '../components/BottomNav';
import { useFood } from '../contexts/FoodContext';
import { useAuth } from '../contexts/AuthContext';
import './HomeScreen.css';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { categories, stalls, foodItems, isLoading, error, refreshData } = useFood();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const randomItems = useMemo(() => {
    return [...foodItems].sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [foodItems]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return foodItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  }, [foodItems, searchQuery]);

  if (isLoading && categories.length === 0) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner">Loading delicious food...</div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Oops! Something went wrong</h2>
        <p style={{ color: 'var(--text-mid)', marginBottom: 24 }}>{error}</p>
        <button className="primary-button" onClick={refreshData} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCcw size={18} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <Header />

      <main className="safe-area-bottom">
        <div className="welcome-section">
          <h1 className="welcome-message">Hello {user?.name || 'Guest'}!</h1>
          <p className="welcome-subtitle">What would you like to eat today?</p>
        </div>

        <div className="search-bar-container">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {searchQuery.trim() ? (
          <section className="search-results-section">
            <div className="section-header">
              <h2 className="section-title">Search Results for "{searchQuery}"</h2>
            </div>
            <div className="items-list">
              {filteredItems.map((item, index) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isLast={index === filteredItems.length - 1}
                />
              ))}
              {filteredItems.length === 0 && (
                <div className="no-results">
                  <p>No items found matching your search.</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="categories-section">
              <div className="section-header">
                <h2 className="section-title">Categories</h2>
              </div>
              <div className="categories-grid">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="category-item"
                    onClick={() => navigate(`/category/${category.name}`)}
                  >
                    <div className="category-image-wrapper" style={{ backgroundColor: category.color }}>
                      <span style={{ fontSize: 32 }}>{category.emoji}</span>
                    </div>
                    <span className="category-name">{category.name}</span>
                  </div>
                ))}
              </div>
              {categories.length === 0 && !isLoading && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)' }}>
                  No categories found.
                </div>
              )}
            </section>
            
            <section className="stalls-section">
              <div className="section-header">
                <h2 className="section-title">Our Favorite Stalls</h2>
              </div>
              <div className="stalls-carousel">
                {stalls.map((stall) => (
                  <div 
                    key={stall.id} 
                    className={`stall-card ${stall.temporarilyClosed ? 'closed' : ''}`}
                    onClick={() => navigate(`/stall/${stall.id}`)}
                  >
                    <div className="stall-image-container">
                      {stall.imageData ? (
                        <img src={stall.imageData} alt={stall.name} className="stall-image" />
                      ) : (
                        <div className="header-placeholder" style={{ width: '100%', height: '100%' }} />
                      )}
                      <div className="stall-vignette" />
                      <div className="stall-info-overlay">
                        <h3 className="stall-name">{stall.name}</h3>
                        <p className="stall-desc">{stall.description}</p>
                      </div>
                      {stall.temporarilyClosed && (
                        <div className="stall-closed-overlay">CLOSED</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {stalls.length === 0 && !isLoading && (
                <div className="no-stalls">No stalls available.</div>
              )}
            </section>

            <section className="popular-section">
              <div className="section-header">
                <h2 className="section-title">Recommended for You</h2>
              </div>
              <div className="items-list">
                {randomItems.map((item, index) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isLast={index === randomItems.length - 1}
                  />
                ))}
                {randomItems.length === 0 && !isLoading && (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)' }}>
                    No items at the moment.
                  </div>
                )}
              </div>
            </section>

            <footer style={{ 
              padding: '40px 20px 80px', 
              textAlign: 'center', 
              background: 'white',
              marginTop: '20px'
            }}>
              <p style={{ 
                fontFamily: "'Inter', sans-serif", 
                fontSize: '1.5rem', 
                fontWeight: '800', 
                color: '#231651',
                fontStyle: 'italic',
                opacity: 0.8
              }}>
                Bon Appetite!
              </p>
            </footer>
          </>
        )}
      </main>
      <CartTab />
      <BottomNav />
    </div>
  );
};

export default HomeScreen;
