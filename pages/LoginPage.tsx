import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-gradient" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo / Brand */}
        <div className="login-header">
          <motion.div
            className="login-logo"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <span className="login-logo-icon">🎨</span>
          </motion.div>
          <h1 className="login-title">RoopVana</h1>
          <p className="login-subtitle">AI Fashion Design Generator</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="login-form-title">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <span className="login-error-icon">⚠️</span>
              {error}
            </motion.div>
          )}

          <div className="login-field">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {isSignUp && (
            <motion.div
              className="login-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label htmlFor="confirmPassword" className="login-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="login-input"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </motion.div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </button>

          <div className="login-toggle">
            <span className="login-toggle-text">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              className="login-toggle-button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
