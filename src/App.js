import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import BlogDetail from './components/Blog/BlogDetail';

const LoadingScreen = () => (
  <div className="App">
    <div className="loading">
      <div className="spinner"></div>
      <p>Đang tải...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}`;
    return <Navigate to="/auth/login" replace state={{ from: redirectTo }} />;
  }

  return children;
};

const AuthPage = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isLogin = mode !== 'register';

  if (isAuthenticated) {
    const redirectTo = location.state?.from || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="main-title">✈️🌍 AI Travel Agent 🏨🗺️</div>
        <p className="auth-subtitle">
          {isLogin ? 'Trợ lý du lịch thông minh với AI' : 'Tạo tài khoản để bắt đầu khám phá'}
        </p>
      </div>

      {isLogin ? (
        <LoginForm onSwitchToRegister={() => navigate('/auth/register')} />
      ) : (
        <RegisterForm onSwitchToLogin={() => navigate('/auth/login')} />
      )}
    </div>
  );
};

const AiPage = ({
  travelInfo,
  setTravelInfo,
  loading,
  setLoading,
  threadId,
  setThreadId,
  selectedLocation,
  clearSelectedLocation
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const needsSubscription = !user?.canUseTrial && !user?.isSubscriptionActive;

  return (
    <div className="ai-page">
      {needsSubscription && (
        <div className="subscription-warning">
          <p>⚠️ Bạn cần đăng ký gói subscription để tiếp tục sử dụng dịch vụ.</p>
          <button
            className="subscribe-now-button"
            onClick={() => navigate('/subscription')}
          >
            Đăng ký ngay
          </button>
        </div>
      )}

      <div className="main-container">
        <Sidebar />
        <div className="content">
          <div className="center-container">
            <div className="main-title">✈️ AI Travel Agent </div>
            <TravelForm
              setTravelInfo={setTravelInfo}
              setLoading={setLoading}
              loading={loading}
              setThreadId={setThreadId}
              disabled={needsSubscription}
              selectedLocation={selectedLocation}
              onClearSelectedLocation={clearSelectedLocation}
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
};

const LocationPage = ({ onSelect }) => {
  const navigate = useNavigate();

  return (
    <LocationMap
      onLocationSelect={(place) => {
        onSelect(place);
        navigate('/ai');
      }}
    />
  );
};

const CreateBlogPage = () => {
  const navigate = useNavigate();

  return (
    <CreateBlog
      onBlogCreated={() => navigate('/')}
      onCancel={() => navigate(-1)}
    />
  );
};

const AppShell = () => {
  const { loading: authLoading } = useAuth();
  const [travelInfo, setTravelInfo] = useState(null);
  const [travelLoading, setTravelLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="/blog/:postId" element={<BlogDetail />} />
        <Route
          path="/blog/create"
          element={(
            <ProtectedRoute>
              <CreateBlogPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/ai"
          element={(
            <ProtectedRoute>
              <AiPage
                travelInfo={travelInfo}
                setTravelInfo={setTravelInfo}
                loading={travelLoading}
                setLoading={setTravelLoading}
                threadId={threadId}
                setThreadId={setThreadId}
                selectedLocation={selectedLocation}
                clearSelectedLocation={() => setSelectedLocation(null)}
              />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/location"
          element={(
            <ProtectedRoute>
              <LocationPage onSelect={(place) => setSelectedLocation(place)} />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/subscription"
          element={(
            <ProtectedRoute>
              <SubscriptionPlans />
            </ProtectedRoute>
          )}
        />
        <Route path="/auth/login" element={<AuthPage mode="login" />} />
        <Route path="/auth/register" element={<AuthPage mode="register" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}

export default App;