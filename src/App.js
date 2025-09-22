import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';
import TravelForm from './components/TravelForm';
import TravelResults from './components/TravelResults';
import EmailForm from './components/EmailForm';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar/Navbar';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import SubscriptionPlans from './components/Subscription/SubscriptionPlans';
import LocationMap from './components/LocationMap/LocationMap';
import BlogList from './components/Blog/BlogList';
import CreateBlog from './components/Blog/CreateBlog';

function AppContent() {
  const [travelInfo, setTravelInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [currentView, setCurrentView] = useState('blog'); // 'blog', 'ai', 'location', 'subscription', 'create-blog'
  const [showAuth, setShowAuth] = useState('login'); // 'login' or 'register'
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);

  const { isAuthenticated, loading: authLoading, user } = useAuth();

  if (authLoading) {
    return (
      <div className="App">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  // Render different views based on currentView
  const renderContent = () => {
    if (!isAuthenticated && currentView !== 'blog') {
      return (
        <div className="auth-container">
          <div className="auth-header">
            <div className="main-title">✈️🌍 AI Travel Agent 🏨🗺️</div>
            <p className="auth-subtitle">Trợ lý du lịch thông minh với AI</p>
          </div>
          
          {showAuth === 'login' ? (
            <LoginForm onSwitchToRegister={() => setShowAuth('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setShowAuth('login')} />
          )}
        </div>
      );
    }

    switch (currentView) {
      case 'blog':
        return <BlogList onSelectPost={setSelectedBlogPost} />;
      
      case 'ai':
        if (!isAuthenticated) {
          return (
            <div className="auth-container">
              <div className="auth-header">
                <div className="main-title">✈️🌍 AI Travel Agent 🏨🗺️</div>
                <p className="auth-subtitle">Đăng nhập để sử dụng AI Du lịch</p>
              </div>
              
              {showAuth === 'login' ? (
                <LoginForm onSwitchToRegister={() => setShowAuth('register')} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setShowAuth('login')} />
              )}
            </div>
          );
        }

        const needsSubscription = !user?.canUseTrial && !user?.isSubscriptionActive;
        
        return (
          <div className="ai-page">
            {needsSubscription && (
              <div className="subscription-warning">
                <p>⚠️ Bạn cần đăng ký gói subscription để tiếp tục sử dụng dịch vụ.</p>
                <button 
                  className="subscribe-now-button"
                  onClick={() => setCurrentView('subscription')}
                >
                  Đăng ký ngay
                </button>
              </div>
            )}

            <div className="main-container">
              <Sidebar />
              <div className="content">
                <div className="center-container">
                  <div className="main-title">✈️🌍 AI Travel Agent 🏨🗺️</div>
                  <TravelForm 
                    setTravelInfo={setTravelInfo}
                    setLoading={setLoading}
                    loading={loading}
                    setThreadId={setThreadId}
                    disabled={needsSubscription}
                  />
                  {loading && (
                    <div className="loading">
                      <div className="spinner"></div>
                      <p>Đang tìm kiếm thông tin du lịch...</p>
                    </div>
                  )}
                  {travelInfo && (
                    <>
                      <TravelResults travelInfo={travelInfo} />
                      <EmailForm threadId={threadId} setTravelInfo={setTravelInfo} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'location':
        return (
          <LocationMap 
            onLocationSelect={(place) => {
              setSelectedLocation(place);
              setCurrentView('ai');
            }}
          />
        );
      
      case 'subscription':
        return <SubscriptionPlans />;
      
      case 'create-blog':
        return (
          <CreateBlog 
            onBlogCreated={(post) => {
              setCurrentView('blog');
              // Optionally show success message or redirect to the new post
            }}
            onCancel={() => setCurrentView('blog')}
          />
        );
      
      default:
        return <BlogList onSelectPost={setSelectedBlogPost} />;
    }
  };

  return (
    <div className="App">
      <Navbar
        onShowLocationMap={() => setCurrentView('location')}
        onShowSubscription={() => setCurrentView('subscription')}
        onShowAI={() => setCurrentView('ai')}
        onShowBlog={() => setCurrentView('blog')}
        onShowCreateBlog={() => setCurrentView('create-blog')}
        currentView={currentView}
      />
      
      {renderContent()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;