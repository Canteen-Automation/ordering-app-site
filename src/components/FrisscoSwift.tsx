import React, { useEffect, useState } from 'react';
import { ShieldCheck, Zap, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import './FrisscoSwift.css';

interface FrisscoSwiftProps {
  amount: number;
  paymentUrl?: string; // Optional in fallback mode
  fallbackToCheckout: boolean;
  razorpayOrderId?: string;
  razorpayKey?: string;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const FrisscoSwift: React.FC<FrisscoSwiftProps> = ({ 
  amount, 
  paymentUrl,
  fallbackToCheckout,
  razorpayOrderId,
  razorpayKey,
  onClose 
}) => {
  const [isOpeningModal, setIsOpeningModal] = useState(false);

  useEffect(() => {
    if (fallbackToCheckout && razorpayOrderId && razorpayKey && !isOpeningModal) {
      handleModalFallback();
    }
  }, [fallbackToCheckout, razorpayOrderId, razorpayKey]);

  const handleModalFallback = () => {
    setIsOpeningModal(true);
    if (!window.Razorpay) {
      console.error("Razorpay SDK not loaded");
      return;
    }

    const options = {
      key: razorpayKey,
      amount: amount,
      currency: "INR",
      name: "RIT Canteen",
      description: "Secure Order Payment",
      order_id: razorpayOrderId,
      handler: function() {
        // Status polling will take it from here
        console.log("Payment completed via modal");
      },
      prefill: {
        method: 'upi'
      },
      theme: { color: "#6366f1" },
      modal: {
        ondismiss: function() {
          setIsOpeningModal(false);
          onClose();
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const openUpiApp = () => {
    if (paymentUrl) window.location.href = paymentUrl;
  };

  return (
    <motion.div 
      className="frissco-swift-modal"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="swift-terminal">
        <div className="terminal-header">
          <div className="swift-brand">
            <Zap className="brand-icon" size={24} fill="#6366f1" color="#6366f1" />
            <span>Frissco Swift</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="terminal-content">
          {fallbackToCheckout ? (
            <div className="fallback-ui">
              <div className="fallback-badge">
                <AlertCircle size={20} />
                <span>Secure Gateway Mode</span>
              </div>
              <h2 className="fallback-title">Direct UPI Restricted</h2>
              <p className="fallback-desc">
                Your account setup requires a secure gateway session.
                Opening payment window...
              </p>
              <button className="retry-modal-btn" onClick={handleModalFallback}>
                Re-open Payment Window
              </button>
            </div>
          ) : (
            <>
              <div className="payment-status-badge">
                <div className="pulse-dot"></div>
                Waiting for Payment
              </div>

              <div className="amount-section">
                <span className="label">Total Amount</span>
                <span className="value">R{(amount / 100).toFixed(2)}</span>
              </div>

              <div className="qr-section">
                <div className="qr-frame">
                  <QRCodeCanvas 
                    value={paymentUrl || ''}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="qr-hint">Scan with any UPI App to Pay</p>
              </div>

              <div className="divider">
                <span>OR PAY VIA</span>
              </div>

              <div className="intent-section">
                <button className="intent-btn gpay" onClick={openUpiApp}>
                  <img src="https://cdn.iconscout.com/icon/free/png-256/free-google-pay-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-3-pack-logos-icons-2944849.png" alt="GPay" />
                  GPay
                </button>
                <button className="intent-btn phonepe" onClick={openUpiApp}>
                  <img src="https://cdn.iconscout.com/icon/free/png-256/free-phonepe-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-5-pack-logos-icons-2945037.png" alt="PhonePe" />
                  PhonePe
                </button>
                <button className="intent-btn paytm" onClick={openUpiApp}>
                  <img src="https://cdn.iconscout.com/icon/free/png-256/free-paytm-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-5-pack-logos-icons-2945031.png" alt="Paytm" />
                  Paytm
                </button>
              </div>
            </>
          )}
        </div>

        <div className="terminal-footer">
          <div className="security-note">
            <ShieldCheck size={16} />
            Secure 256-bit encrypted transaction
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FrisscoSwift;
