import React from 'react';
import { AlertTriangle, Trash2, Edit3, X } from 'lucide-react';
import { motion } from 'framer-motion';
import './StockConflictModal.css';

interface StockConflict {
  productId: number;
  productName: string;
  requested: number;
  available: number;
}

interface StockConflictModalProps {
  conflicts: StockConflict[];
  onRemoveItem: (productId: number) => void;
  onAdjustQuantity: (productId: number, newQty: number) => void;
  onClose: () => void;
}

const StockConflictModal: React.FC<StockConflictModalProps> = ({ 
  conflicts, 
  onRemoveItem, 
  onAdjustQuantity, 
  onClose 
}) => {
  return (
    <div className="conflict-overlay">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="conflict-modal"
      >
        <div className="conflict-header">
          <AlertTriangle size={32} style={{ marginBottom: 12 }} />
          <h2>Inventory Conflict</h2>
          <p>Some items were just sold out or have limited stock.</p>
        </div>

        <div className="conflict-body">
          {conflicts.map((item) => (
            <div key={item.productId} className="conflict-item-card">
              <span className="conflict-item-name">{item.productName}</span>
              
              <div className="conflict-details">
                <div className="detail-box">
                  <span className="detail-label">Requested</span>
                  <span className="detail-value">{item.requested}</span>
                </div>
                <div className="detail-box">
                  <span className="detail-label">Actually Left</span>
                  <span className="detail-value highlight">{item.available}</span>
                </div>
              </div>

              <div className="conflict-actions">
                <button 
                  className="btn-remove-item"
                  onClick={() => onRemoveItem(item.productId)}
                >
                  <Trash2 size={14} style={{ marginRight: 6 }} />
                  Remove
                </button>
                
                {item.available > 0 && (
                  <button 
                    className="btn-adjust-qty"
                    onClick={() => onAdjustQuantity(item.productId, item.available)}
                  >
                    <Edit3 size={14} style={{ marginRight: 6 }} />
                    Order {item.available} Only
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="conflict-footer">
          <button className="btn-close-conflict" onClick={onClose}>
            Close and return to cart
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StockConflictModal;
