import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import './StockAlert.css';

const StockAlert: React.FC = () => {
  const { stockError, clearStockError } = useCart();

  useEffect(() => {
    if (stockError) {
      const timer = setTimeout(() => {
        clearStockError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stockError, clearStockError]);

  return (
    <div className="stock-alert-container">
      <AnimatePresence>
        {stockError && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="stock-alert-toast"
          >
            <AlertCircle className="stock-alert-icon" size={20} />
            <span className="stock-alert-message">{stockError}</span>
            <button className="stock-alert-close" onClick={clearStockError}>
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockAlert;
