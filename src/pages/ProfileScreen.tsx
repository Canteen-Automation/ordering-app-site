import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Phone,
  ShieldCheck,
  User,
  X,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import './ProfileScreen.css';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editMobile, setEditMobile] = useState(user?.mobileNumber || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditMobile(user.mobileNumber);
    }
  }, [user]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const handleEditClick = () => {
    setEditName(user?.name || '');
    setEditMobile(user?.mobileNumber || '');
    setError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editMobile.trim()) {
      setError('Name and mobile number are required');
      return;
    }

    if (!/^[0-9]{10}$/.test(editMobile)) {
      setError('Mobile number must be 10 digits');
      return;
    }

    setIsUpdating(true);
    setError(null);

    const result = await updateProfile(editName, editMobile);
    setIsUpdating(false);

    if (result.success) {
      setIsEditModalOpen(false);
      // Optional: Show success message
    } else {
      setError(result.message);
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
              </div>
            </div>
            <button className="edit-btn" onClick={handleEditClick}>Edit</button>
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="modal-container"
            >
              <div className="modal-header">
                <h2>Edit Profile</h2>
                <button type="button" className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateProfile}>
                <div className="modal-body">
                  {error && <div className="error-message" style={{ color: '#ff4d4f', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '600' }}>{error}</div>}
                  
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <UserIcon className="input-icon" size={20} />
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Mobile Number</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={20} />
                      <input 
                        type="tel" 
                        value={editMobile}
                        onChange={(e) => setEditMobile(e.target.value)}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-save" disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
