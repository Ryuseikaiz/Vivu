import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AuthCallback.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        // Handle error
        console.error('OAuth error:', error);
        alert('Đăng nhập thất bại. Vui lòng thử lại.');
        navigate('/login');
        return;
      }

      if (token) {
        try {
          // Save token to localStorage
          localStorage.setItem('token', token);

          // Fetch user data
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.data;
            
            // Update auth context (if your AuthContext has a method to set user data)
            if (login) {
              await login({ token, user: data.user });
            }

            // Redirect to home or dashboard
            navigate('/');
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error);
          alert('Có lỗi xảy ra. Vui lòng thử lại.');
          navigate('/login');
        }
      } else {
        // No token, redirect to login
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="auth-callback">
      <div className="callback-container">
        <div className="spinner"></div>
        <h2>Đang xử lý đăng nhập...</h2>
        <p>Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
};

export default AuthCallback;
