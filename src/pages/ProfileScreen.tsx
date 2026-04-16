import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import './ProfileScreen.css';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', sub: 'View order history', path: '/orders' },
    { icon: ShieldCheck, label: 'Account Security', sub: 'Change Security PIN', path: '/change-pin' },
    { icon: Settings, label: 'Preferences', sub: 'Notifications, Language', path: '#' },
    { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, Contact Us', path: '#' }
  ];

  return (
    <div className="container profile-page">
      <Header title="My Profile" showCart={false} />
      
      <main className="profile-content safe-area-bottom">
        {/* User Profile Card */}
        <section className="profile-card-section">
          <div className="profile-card">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="profile-info">
              <h2 className="user-name">{user?.name || 'User Name'}</h2>
              <div className="user-contact">
                <span className="contact-item"><Phone size={14} /> {user?.mobileNumber || '+91 XXXXX XXXXX'}</span>
                {/* <span className="contact-item"><Mail size={14} /> user@example.com</span> */}
              </div>
            </div>
            <button className="edit-btn">Edit</button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="profile-stats">
          <div className="stat-box" onClick={() => navigate('/orders')}>
            <span className="stat-value">--</span>
            <span className="stat-label">Orders</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">₹0</span>
            <span className="stat-label">Spent</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">0</span>
            <span className="stat-label">Coins</span>
          </div>
        </section>

        {/* Menu Section */}
        <section className="profile-menu">
          {menuItems.map((item, index) => (
            <div key={index} className="menu-item" onClick={() => item.path !== '#' && navigate(item.path)}>
              <div className="menu-icon-bg">
                <item.icon size={20} />
              </div>
              <div className="menu-text">
                <span className="menu-label">{item.label}</span>
                <span className="menu-sub">{item.sub}</span>
              </div>
              <ChevronRight size={20} className="menu-chevron" />
            </div>
          ))}
        </section>

        {/* Logout Button */}
        <section className="logout-section">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
          <p className="app-version">Version 1.0.4 (Stable)</p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
