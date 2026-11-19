// frontend/src/components/Login.jsx
// Purpose: Secure Admin Login Panel with show/hide password, error handling, and college ERP branding.

import React, { useState } from 'react';
import './Login.css';
import { loginAPI } from '../api';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your admin email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const data = await loginAPI(email.trim(), password);
      // Notify parent App component of successful login
      onLoginSuccess(data.admin);
    } catch (error) {
      setErrorMessage(error.message || 'Invalid admin credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        {/* Branding & Logo */}
        <div className="login-header">
          <div className="login-brand-icon">🎓</div>
          <h1 className="login-brand-title">Students Info</h1>
          <div className="login-brand-subtitle">STUDENT MANAGEMENT PORTAL</div>
          <p className="login-welcome-text">Administrative Login for Authorized Personnel</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="login-error-alert" role="alert">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="login-form-group">
            <label className="login-label" htmlFor="adminEmail">
              Admin Email Address
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">✉️</span>
              <input
                id="adminEmail"
                type="email"
                className="login-input"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="login-form-group">
            <label className="login-label" htmlFor="adminPassword">
              Admin Password
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span>⏳</span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Card Footer */}
        <div className="login-card-footer">
          <span>Protected by JWT & HttpOnly Secure Cookie Authentication</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
