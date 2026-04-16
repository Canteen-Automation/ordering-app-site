import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import Header from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useFood } from '../contexts/FoodContext';
import './CheckoutScreen.css';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-google-pay-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-3-pack-logos-icons-2944849.png' },
  { id: 'phonepe', name: 'PhonePe', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-phonepe-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-5-pack-logos-icons-2945037.png' },
  { id: 'paytm', name: 'Paytm', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-paytm-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-5-pack-logos-icons-2945031.png' },
  { id: 'bhim', name: 'BHIM UPI', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6-6R-pUu-Wj4V_vO8t-qXz9-7vjJ7XvK36A&s' },
  { id: 'other', name: 'Others', icon: null }
];

const CheckoutScreen: React.FC = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { refreshData } = useFood();
  const [selectedApp, setSelectedApp] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) return;
    setIsProcessing(true);

    try {
      const now = new Date();
      const orderNumber = `ORD-${now.getTime()}`;
      const displayOrderId = now.getTime().toString().slice(-6);

      const orderData = {
        userId: user.id,
        user: {
          name: user.name || 'Customer',
          mobileNumber: user.mobileNumber || ''
        },
        totalAmount: totalPrice,
        status: 'PAID', // Default to PAID as it's a mobile ordering site
        paymentMethod: UPI_APPS.find(a => a.id === selectedApp)?.name || 'UPI',
        orderNumber: orderNumber,
        displayOrderId: displayOrderId,
        createdAt: serverTimestamp(),
        items: cart.map(item => ({
          productId: item.id.toString(),
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          stallId: item.stallId ? item.stallId.toString() : null,
          stallName: item.stallName || null
        }))
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      await refreshData();
      clearCart();
      navigate('/success', { 
        state: { 
          orderNumber: orderNumber, 
          displayOrderId: displayOrderId 
        } 
      });
    } catch (error) {
      console.error('Order error:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container checkout-page">
      <Header title="Checkout" showCart={false} />
      
      <main className="safe-area-bottom">
        <section className="checkout-section">
          <div className="section-header">
            <h2 className="section-title">Pay using UPI</h2>
            <p className="section-subtitle">Select your preferred UPI app</p>
          </div>
          
          <div className="payment-options">
            {UPI_APPS.map((app) => (
              <div 
                key={app.id}
                className={`payment-card ${selectedApp === app.id ? 'selected' : ''}`}
                onClick={() => setSelectedApp(app.id)}
              >
                <div className="payment-icon">
                  {app.icon ? (
                    <img src={app.icon} alt={app.name} className="upi-app-icon" />
                  ) : (
                    <div className="upi-placeholder">
                      <Smartphone size={20} />
                    </div>
                  )}
                </div>
                <div className="payment-info">
                  <span className="payment-name">{app.name}</span>
                  <span className="payment-sub">
                    {app.id === 'other' ? 'Pay via any installed UPI app' : `Fast & secure payments via ${app.name}`}
                  </span>
                </div>
                <div className="selection-radio">
                  <div className="radio-inner" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="order-summary-mini">
          <div className="summary-row">
            <span>Amount to pay</span>
            <span className="summary-price">₹{(totalPrice + 0).toFixed(2)}</span>
          </div>
          <p className="tax-info">Inclusive of all taxes and charges</p>
        </div>
      </main>

      <div className="checkout-footer">
        <button 
          className="place-order-button"
          onClick={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)} & Place Order`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutScreen;
