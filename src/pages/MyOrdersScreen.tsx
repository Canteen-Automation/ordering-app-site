import React, { useState, useEffect } from 'react';
import { Clock, ShoppingBag as ShoppingBagIcon, ChevronRight as ChevronRightIcon, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrdersContext';
import type { Order } from '../types';
import './MyOrdersScreen.css';
import { db } from '../firebase';
import { collection } from 'firebase/firestore';



const MyOrdersScreen: React.FC = () => {
  const { user } = useAuth();
  const { orders, isLoading: contextLoading } = useOrders();
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);



  const latestOrder = orders.length > 0 ? orders[0] : null;
  const previousOrders = orders.length > 1 ? orders.slice(1) : [];

  if (contextLoading || loading) {
    return <div className="container loading-container">
      <div className="mesh-gradient-bg"></div>
      <div className="loading-content">
        <div className="loading-dots"><span>.</span><span>.</span><span>.</span></div>
        <p>Loading your orders...</p>
      </div>
    </div>;
  }

  return (
    <div className="container orders-page">
      <Header title="My Orders" showCart={false} />
      
      <main className="orders-content safe-area-bottom">
        {orders.length === 0 ? (
          <div className="empty-orders">
            <ShoppingBagIcon size={64} className="empty-icon" />
            <h3>No orders yet</h3>
            <p>Hungry? Place your first order now!</p>
          </div>
        ) : (
          <>
            {/* Latest Order Section */}
            {latestOrder && (
              <section className="latest-order-section">
                <div className="section-label">Active/Latest Order</div>
                <div className="latest-order-card" onClick={() => setSelectedOrder(latestOrder)}>
                  <div className="latest-order-info">
                    <div className="order-main-info">
                      <span className="order-number">Order #{latestOrder.displayOrderId || latestOrder.id}</span>
                      <span className="order-date">{new Date(latestOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="order-status-badge">{latestOrder.status}</div>
                  </div>
                  
                  <div className={`latest-qr-wrapper ${latestOrder.status.toUpperCase() === 'COMPLETED' ? 'qr-completed' : ''} ${latestOrder.archived ? 'qr-expired' : ''}`}>
                    <div className="qr-container">
                      <QRCodeCanvas value={latestOrder.orderNumber} size={120} className="mini-qr" />
                      {latestOrder.status.toUpperCase() === 'COMPLETED' && (
                        <div className="qr-overlay mini">
                          <span className="overlay-text mini">COMPLETED</span>
                        </div>
                      )}
                      {latestOrder.archived && (
                        <div className="qr-overlay mini">
                          <span className="overlay-text mini expired">EXPIRED</span>
                        </div>
                      )}
                    </div>
                    <div className="qr-hint-text">
                      {latestOrder.status.toUpperCase() === 'COMPLETED' ? 'Order Fulfilled' : 'Tap to enlarge QR'}
                    </div>
                  </div>
                  
                  <div className="order-items-summary">
                    {latestOrder.items.map((item, idx) => (
                      <span key={idx}>{item.quantity}x {item.productName}{idx < latestOrder.items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                  
                  <div className="order-total-bar">
                    <span>Total Amount</span>
                    <span className="amount-text">₹{latestOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Previous Orders List */}
            {previousOrders.length > 0 && (
              <section className="previous-orders-section">
                <div className="section-label">Previous Orders</div>
                <div className="orders-list">
                  {previousOrders.map((order) => (
                    <div key={order.id} className="order-item-list" onClick={() => setSelectedOrder(order)}>
                      <div className="order-icon-bg">
                        <Clock size={20} />
                      </div>
                      <div className="order-list-info">
                        <div className="order-list-top">
                          <span className="order-list-number">#{order.displayOrderId}</span>
                          <span className="order-list-price">₹{order.totalAmount.toFixed(0)}</span>
                        </div>
                        <div className="order-list-bottom">
                          <span className="order-list-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="order-list-items">{order.items.length} items</span>
                        </div>
                      </div>
                      <ChevronRightIcon size={20} className="list-chevron" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Order Detail Modal / Overlay */}
      {selectedOrder && (
        <div className="order-detail-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-details" onClick={() => setSelectedOrder(null)}>
              <X size={24} />
            </button>
            
            <div className="modal-header">
              <h3>Order Details</h3>
              <p className="modal-order-id">Order #{selectedOrder.displayOrderId}</p>
            </div>
            
            <div className={`modal-qr-section ${selectedOrder.status.toUpperCase() === 'COMPLETED' ? 'qr-completed' : ''} ${selectedOrder.archived ? 'qr-expired' : ''}`}>
              <div className="qr-container">
                <QRCodeCanvas value={selectedOrder.orderNumber} size={200} includeMargin={true} />
                {selectedOrder.status.toUpperCase() === 'COMPLETED' && (
                  <div className="qr-overlay">
                    <span className="overlay-text">COMPLETED</span>
                  </div>
                )}
                {selectedOrder.archived && (
                  <div className="qr-overlay">
                    <span className="overlay-text expired">EXPIRED</span>
                  </div>
                )}
              </div>
              <p className="modal-qr-hint">
                {selectedOrder.archived 
                  ? 'This order has expired'
                  : selectedOrder.status.toUpperCase() === 'COMPLETED' 
                    ? 'This order has been fulfilled' 
                    : 'Show this QR code at the counter'}
              </p>
            </div>
            
            <div className="modal-info-list">
              <div className="info-item">
                <span className="label">Date</span>
                <span className="value">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span className="label">Payment</span>
                <span className="value">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="info-item">
                <span className="label">Status</span>
                <span className={`value status-badge ${selectedOrder.status.toLowerCase()}`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>
            
            <div className="modal-items-section">
              <h4>Items Ordered</h4>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="modal-item-row">
                  <span>{item.quantity} x {item.productName}</span>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="modal-total-row">
                <span>Grand Total</span>
                <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default MyOrdersScreen;
