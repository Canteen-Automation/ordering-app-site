import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import './SuccessScreen.css';

const SuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const orderNumber = state.orderNumber || 'ORD-TEST-UUID';
  const displayOrderId = state.displayOrderId || '000';
  const archived = state.archived || false;
  const status = (state.status || 'PAID').toUpperCase();

  return (
    <div className="container success-page">
      <div className="success-content">
        <div className="success-icon-wrapper">
          <CheckCircle size={80} className="success-icon" />
        </div>
        
        <h1 className="success-title">Order Placed!</h1>
        <p className="success-order-id">Order ID #{displayOrderId}</p>
        
        <div className={`qr-container ${status === 'COMPLETED' ? 'qr-completed' : ''} ${archived ? 'qr-expired' : ''}`}>
          <div className="qr-wrapper-inner">
            <QRCodeCanvas 
              value={orderNumber} 
              size={200}
              level={"H"}
              includeMargin={true}
              className="qr-code"
            />
            {status === 'COMPLETED' && (
              <div className="qr-overlay">
                <span className="overlay-text">COMPLETED</span>
              </div>
            )}
            {archived && (
              <div className="qr-overlay">
                <span className="overlay-text expired">EXPIRED</span>
              </div>
            )}
          </div>
          <p className="qr-hint">
            {archived 
              ? 'This order has expired' 
              : status === 'COMPLETED'
                ? 'Order has been fulfilled'
                : 'Scan this QR at the counter to collect your food'}
          </p>
        </div>
        
        <div className="success-actions">
          <button 
            className="secondary-button"
            onClick={() => navigate('/orders')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <ShoppingBag size={18} /> My Orders
          </button>
          <button 
            className="primary-button"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Home size={18} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
