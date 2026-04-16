import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Info } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import CartTab from '../components/CartTab';
import BottomNav from '../components/BottomNav';
import type { Stall } from '../types';
import './StallDetailScreen.css';

import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const StallDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stall, setStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStallDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Fetch Stall Metadata
        const stallDoc = await getDoc(doc(db, 'stalls', id));
        if (!stallDoc.exists()) throw new Error('Stall not found');
        const stallData = stallDoc.data();

        // 2. Fetch Associated Products
        const productsQuery = query(collection(db, 'products'), where('stallId', '==', id));
        const productsSnap = await getDocs(productsQuery);
        const stallProducts: any[] = [];
        
        productsSnap.forEach(doc => {
          const p = doc.data();
          stallProducts.push({
            id: doc.id,
            name: p.name,
            description: p.description || 'Delicious meal item',
            price: p.price || 0,
            category: p.category,
            image: p.image || '',
            isVeg: p.isVeg || false,
            isPopular: p.isPopular || false,
            stock: p.stock || 0,
            stallId: id,
            stallName: stallData.name
          });
        });

        const mappedStall: Stall = {
          id: id,
          name: stallData.name,
          description: stallData.description || 'Quality food prepared with care',
          imageData: stallData.imageData || '',
          active: stallData.active ?? true,
          temporarilyClosed: stallData.temporarilyClosed ?? false,
          products: stallProducts
        };
        
        setStall(mappedStall);
      } catch (err: any) {
        console.error('Error fetching stall details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStallDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container stall-detail-page loading">
        <div className="loading-spinner">Loading Stall Details...</div>
      </div>
    );
  }

  if (error || !stall) {
    return (
      <div className="container stall-detail-page error">
        <header className="detail-header sticky">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
        </header>
        <div className="error-content">
          <h2>Stall Not Found</h2>
          <p>{error || "We couldn't find the stall you're looking for."}</p>
          <button className="primary-button" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container stall-detail-page">
      <header className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <div className="header-image-container">
          {stall.imageData ? (
            <img src={stall.imageData} alt={stall.name} className="header-bg-image" />
          ) : (
            <div className="header-placeholder" />
          )}
          <div className="header-overlay"></div>
        </div>
      </header>

      <main className="detail-content safe-area-bottom">
        <div className="stall-main-card">
          <div className="stall-header-info">
            <h1 className="stall-title">{stall.name}</h1>
            {stall.temporarilyClosed && (
              <span className="status-tag closed">Closed Now</span>
            )}
          </div>
          <p className="stall-description">{stall.description}</p>
          
          <div className="stall-meta">
            <div className="meta-item">
              <Clock size={16} />
              <span>Fast Preparation</span>
            </div>
            <div className="meta-item">
              <Info size={16} />
              <span>Clean & Hygienic</span>
            </div>
          </div>
        </div>

        <section className="stall-items-section">
          <h2 className="section-title">Available Products</h2>
          <div className="items-list">
            {stall.products && stall.products.length > 0 ? (
              stall.products.map((item, index) => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  isLast={index === stall.products!.length - 1} 
                />
              ))
            ) : (
              <div className="no-items">
                <p>No products available from this stall at the moment.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <CartTab />
      <BottomNav />
    </div>
  );
};

export default StallDetailScreen;
