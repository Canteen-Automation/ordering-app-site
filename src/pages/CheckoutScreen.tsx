import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import StockConflictModal from '../components/StockConflictModal';
import FrisscoSwift from '../components/FrisscoSwift';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useFood } from '../contexts/FoodContext';
import './CheckoutScreen.css';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-google-pay-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-3-pack-logos-icons-2944849.png' },
  { id: 'phonepe', name: 'PhonePe', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-phonepe-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-5-pack-logos-icons-2945037.png' },
  { id: 'paytm', name: 'Paytm', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-paytm-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-5-pack-logos-icons-2945031.png' },
  { id: 'bhim', name: 'BHIM UPI', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6-6R-pUu-Wj4V_vO8t-qXz9-7vjJ7XvK36A&s' },
  { id: 'other', name: 'Others', icon: null }
];

const CheckoutScreen: React.FC = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const { refreshData } = useFood();
  const [selectedApp, setSelectedApp] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentUrl: string;
    qrCodeId: string;
    razorpayOrderId: string;
    amount: number;
    key: string;
    fallbackToCheckout: boolean;
  } | null>(null);
  
  // Conflict state
  const [stockConflicts, setStockConflicts] = useState<any[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const startPolling = (orderId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://${window.location.hostname}:8080/api/payments/status/${orderId}`);
        const data = await response.json();
        
        if (data.success && data.status === 'PAID') {
          clearInterval(interval);
          await refreshData();
          clearCart();
          navigate('/success', { 
            state: { 
              orderNumber: data.orderNumber, 
              displayOrderId: data.displayOrderId 
            } 
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);
    return interval;
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setIsProcessing(true);

    const orderData = {
      userId: user.id,
      totalAmount: totalPrice,
      paymentMethod: 'Frissco Swift (UPI)',
      orderType: 'MY_ORDER',
      items: cart.map(item => ({
        productId: Number(item.id),
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        stallId: item.stallId ? Number(item.stallId) : null,
        stallName: item.stallName || null
      }))
    };

    try {
      const response = await fetch(`http://${window.location.hostname}:8080/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (data.success) {
        setPaymentDetails({
          paymentUrl: data.paymentUrl,
          qrCodeId: data.razorpayQrCodeId,
          razorpayOrderId: data.razorpayOrderId,
          amount: data.amount,
          key: data.key,
          fallbackToCheckout: data.fallbackToCheckout
        });
        // Use QR ID if available, otherwise Order ID for polling
        startPolling(data.razorpayQrCodeId || data.razorpayOrderId);
      } else if (data.errorType === 'STOCK_ERROR') {
        console.error('Stock Conflict:', data.message);
        alert(data.message);
        await refreshData(true);
      } else {
        alert(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Initiation error:', error);
      alert('Error connecting to server. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveConflictItem = (productId: number) => {
    removeFromCart(productId.toString());
    const remaining = stockConflicts.filter(c => c.productId !== productId);
    setStockConflicts(remaining);
    if (remaining.length === 0) setShowConflictModal(false);
  };

  const handleAdjustConflictQuantity = (productId: number, newQty: number) => {
    const item = cart.find(i => i.id === productId.toString());
    if (item) {
      const delta = newQty - item.quantity;
      updateQuantity(productId.toString(), delta);
    }
    const remaining = stockConflicts.filter(c => c.productId !== productId);
    setStockConflicts(remaining);
    if (remaining.length === 0) setShowConflictModal(false);
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

      <AnimatePresence>
        {paymentDetails && (
          <div className="payment-overlay">
            <FrisscoSwift 
              amount={paymentDetails.amount}
              paymentUrl={paymentDetails.paymentUrl}
              fallbackToCheckout={paymentDetails.fallbackToCheckout}
              razorpayOrderId={paymentDetails.razorpayOrderId}
              razorpayKey={paymentDetails.key}
              onClose={() => setPaymentDetails(null)}
            />
          </div>
        )}

        {showConflictModal && (
          <StockConflictModal 
            conflicts={stockConflicts}
            onRemoveItem={handleRemoveConflictItem}
            onAdjustQuantity={handleAdjustConflictQuantity}
            onClose={() => navigate('/cart')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutScreen;
