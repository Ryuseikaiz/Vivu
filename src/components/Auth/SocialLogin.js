import React, { useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './SocialLogin.css';

const SocialLogin = ({ mode = 'login' }) => {
  const { loginWithGoogle } = useAuth();

  const handleGoogleResponse = useCallback(async (response) => {
    console.log('Google response received:', response);
    try {
      if (response.credential) {
        console.log('Calling loginWithGoogle with token...');
        const result = await loginWithGoogle(response.credential);
        
        if (result.success) {
          console.log('Login successful!');
          // Wait for React state to update fully before redirect
          setTimeout(() => {
            console.log('Redirecting to home page...');
            window.location.href = '/';
          }, 1000);
        } else {
          console.error('Login failed:', result.error);
          alert('Đăng nhập thất bại: ' + result.error);
        }
      } else {
        console.error('No credential in response');
        alert('Không nhận được thông tin đăng nhập từ Google');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Đăng nhập Google thất bại: ' + error.message);
    }
  }, [loginWithGoogle]);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Sign-In script loaded');
      if (window.google) {
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '1019363317955-5e9ho3m5a66kdghhr7u5g55okd0dne2k.apps.googleusercontent.com';
        console.log('Initializing Google Sign-In with client ID:', clientId);
        
        // Define callback globally to ensure it's accessible
        window.handleGoogleCallback = handleGoogleResponse;
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: window.handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        console.log('Google Sign-In initialized successfully');
      } else {
        console.error('Google Sign-In library not loaded');
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleGoogleResponse]);

  const handleGoogleLogin = () => {
    console.log('Google login button clicked');
    if (window.google) {
      console.log('Prompting Google Sign-In...');
      window.google.accounts.id.prompt((notification) => {
        console.log('Prompt notification:', notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Prompt was not displayed or skipped, showing One Tap UI');
          // Fallback: render the button
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { 
              theme: 'outline', 
              size: 'large',
              text: 'signin_with',
              width: 300
            }
          );
        }
      });
    } else {
      console.error('Google Sign-In not initialized yet');
      alert('Google Sign-In chưa sẵn sàng. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="social-login">
      <div className="social-buttons">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="social-btn google-btn"
          id="google-signin-button"
        >
          <svg className="social-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Đăng nhập với Google</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;
