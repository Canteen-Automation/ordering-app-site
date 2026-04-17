import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'orders', icon: ShoppingBag, label: 'My Orders', path: '/orders' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' }
  ];

  // Only show on main screens and stall details
  const isMainScreen = ['/', '/orders', '/profile'].includes(location.pathname);
  const isStallDetail = location.pathname.startsWith('/stall/');
  
  if (!isMainScreen && !isStallDetail) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={24} />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
