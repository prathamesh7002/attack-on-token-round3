import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateEmail, validatePassword } from '../utils/validators';
import { USE_MOCK } from '../config/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard or intended route
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validateForm = () => {
    const newErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
      }
      setServerError(err.message || 'Email or password is incorrect.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
    setServerError('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-accent selection:text-white">
      <div className="w-full max-w-[420px] bg-surface rounded-xl border border-surface-border shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5 mb-2">
            <img src="/logo.svg" alt="StreetLedger Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-2xl font-bold tracking-tight text-text-primary">StreetLedger</span>
          </div>
          <p className="text-sm text-text-muted">Track your stall's expenses.</p>
        </div>

        {/* Server error alert banner */}
        {serverError && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-status-exceeded-bg border border-status-exceeded/40 text-status-exceeded text-sm font-medium animate-in fade-in duration-150"
          >
            {serverError}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="login-email"
            name="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              if (serverError) setServerError('');
            }}
            onBlur={() => {
              const err = validateEmail(email);
              if (err) setErrors((prev) => ({ ...prev, email: err }));
            }}
            placeholder="vendor@example.com"
            autoComplete="email"
            autoFocus
            required
            error={errors.email}
          />

          <Input
            id="login-password"
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              if (serverError) setServerError('');
            }}
            onBlur={() => {
              const err = validatePassword(password);
              if (err) setErrors((prev) => ({ ...prev, password: err }));
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            error={errors.password}
          />

          <Button
            type="submit"
            size="md"
            isLoading={isSubmitting}
            loadingText="Logging in..."
            className="w-full mt-2"
          >
            Log in
          </Button>
        </form>

        {/* Demo accounts helper (Only in Mock mode) */}
        {USE_MOCK && (
          <div className="pt-2 border-t border-surface-border flex flex-col gap-2 text-center">
            <span className="text-xs text-text-muted font-medium">Quick Demo Accounts:</span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('sharma.chaat@example.com', 'Vendor@123')}
                className="text-xs px-2.5 py-1.5 rounded bg-background border border-surface-border text-text-primary hover:border-accent hover:text-accent font-medium transition-colors"
              >
                Sharma Chaat (82% used)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('annapurna.dosa@example.com', 'Vendor@123')}
                className="text-xs px-2.5 py-1.5 rounded bg-background border border-surface-border text-text-primary hover:border-accent hover:text-accent font-medium transition-colors"
              >
                Annapurna Dosa (48% used)
              </button>
            </div>
          </div>
        )}

        {/* Sign up link */}
        <div className="text-center text-sm text-text-muted">
          New here?{' '}
          <Link
            to="/register"
            className="font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded px-1"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
