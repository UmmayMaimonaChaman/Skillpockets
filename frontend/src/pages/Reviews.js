import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/GlobalStyles.css';

const Reviews = () => {
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

  useEffect(() => {
    if (token) {
      fetchReviews();
    } else {
      setError('You must be logged in to view reviews.');
      setLoading(false);
    }
  }, [token]);

  const fetchReviews = async () => {
    try {
      const [receivedResponse, myReviewsResponse] = await Promise.all([
        axios.get(`http://localhost:5001/api/reviews/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5001/api/reviews/mine', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setReceivedReviews(receivedResponse.data);
      setMyReviews(myReviewsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews.');
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="black-bg-page">
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <div className="page-content">
          <div className="black-card">
            <div style={{ textAlign: 'center', color: '#fff' }}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="black-bg-page">
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      <div className="page-content">
        <div className="black-card">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>Reviews</h2>
          
          {error && (
            <div style={{ color: '#ff4d4f', textAlign: 'center', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
            <button
              className={`black-btn ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => setActiveTab('received')}
              style={{
                background: activeTab === 'received' ? '#007bff' : 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid #007bff'
              }}
            >
              Reviews Received ({receivedReviews.length})
            </button>
            <button
              className={`black-btn ${activeTab === 'written' ? 'active' : ''}`}
              onClick={() => setActiveTab('written')}
              style={{
                background: activeTab === 'written' ? '#007bff' : 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid #007bff'
              }}
            >
              Reviews Written ({myReviews.length})
            </button>
          </div>

          {/* Reviews Received Tab */}
          {activeTab === 'received' && (
            <div>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Reviews You've Received</h3>
              {receivedReviews.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#aaa' }}>
                  No reviews received yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {receivedReviews.map((review) => (
                    <div key={review._id} className="black-card" style={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ color: '#fff', margin: 0 }}>
                          Review by {review.reviewer?.name}
                        </h4>
                        <div style={{ color: '#ffc107', fontSize: '1.2rem' }}>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>
                        <strong>Session:</strong> {review.session?.skill?.title || 'N/A'}
                      </p>
                      <p style={{ color: '#fff', fontStyle: 'italic' }}>
                        "{review.comment}"
                      </p>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Written Tab */}
          {activeTab === 'written' && (
            <div>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Reviews You've Written</h3>
              {myReviews.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#aaa' }}>
                  You haven't written any reviews yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {myReviews.map((review) => (
                    <div key={review._id} className="black-card" style={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ color: '#fff', margin: 0 }}>
                          Review for {review.reviewee?.name}
                        </h4>
                        <div style={{ color: '#ffc107', fontSize: '1.2rem' }}>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>
                        <strong>Session:</strong> {review.session?.skill?.title || 'N/A'}
                      </p>
                      <p style={{ color: '#fff', fontStyle: 'italic' }}>
                        "{review.comment}"
                      </p>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
