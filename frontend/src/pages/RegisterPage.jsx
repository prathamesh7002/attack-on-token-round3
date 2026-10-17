import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateEmail, validatePassword, validatePasswordConfirm } from '../utils/validators';
import { STALL_TYPES } from '../constants/stallTypes';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    stallName: '',
    ownerName: '',
    email: '',
    phone: '',
    stallType: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError('');
  };

  const handleBlur = (field) => {
    let err = null;
    if (field === 'stallName' && !formData.stallName.trim()) {
      err = 'Please enter your stall name';
    } else if (field === 'ownerName' && !formData.ownerName.trim()) {
      err = 'Please enter your name';
    } else if (field === 'email') {
      err = validateEmail(formData.email);
    } else if (field === 'password') {
      err = validatePassword(formData.password);
    } else if (field === 'confirmPassword') {
      err = validatePasswordConfirm(formData.password, formData.confirmPassword);
    }

    if (err) {
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.stallName.trim()) {
      newErrors.stallName = 'Please enter your stall name';
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Please enter your name';
    }
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;

    const confirmErr = validatePasswordConfirm(formData.password, formData.confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await register({
        vendor_name: formData.stallName,
        owner_name: formData.ownerName,
        email: formData.email,
        phone: formData.phone || undefined,
        stall_type: formData.stallType || undefined,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      showToast('Stall account created successfully!', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        // Map backend field names (e.g. vendor_name -> stallName)
        const mappedErrors = {};
        if (err.fieldErrors.vendor_name) mappedErrors.stallName = err.fieldErrors.vendor_name;
        if (err.fieldErrors.owner_name) mappedErrors.ownerName = err.fieldErrors.owner_name;
        if (err.fieldErrors.email) mappedErrors.email = err.fieldErrors.email;
        if (err.fieldErrors.password) mappedErrors.password = err.fieldErrors.password;
        if (err.fieldErrors.confirm_password) mappedErrors.confirmPassword = err.fieldErrors.confirm_password;
        setErrors(mappedErrors);
      }
      setServerError(err.message || 'Could not create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 py-8 selection:bg-accent selection:text-white">
      <div className="w-full max-w-[460px] bg-surface rounded-xl border border-surface-border shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5 mb-2">
            <img src="/logo.svg" alt="StreetLedger Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-2xl font-bold tracking-tight text-text-primary">StreetLedger</span>
          </div>
          <p className="text-sm text-text-muted">Register your food stall to get started.</p>
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

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="register-stallName"
            name="stallName"
            label="Stall name"
            value={formData.stallName}
            onChange={handleChange}
            onBlur={() => handleBlur('stallName')}
            placeholder="e.g. Sharma Chaat Corner"
            required
            error={errors.stallName}
          />

          <Input
            id="register-ownerName"
            name="ownerName"
            label="Your name"
            value={formData.ownerName}
            onChange={handleChange}
            onBlur={() => handleBlur('ownerName')}
            placeholder="e.g. Ramesh Sharma"
            required
            error={errors.ownerName}
          />

          <Input
            id="register-email"
            name="email"
            label="Email address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            placeholder="vendor@example.com"
            autoComplete="email"
            required
            error={errors.email}
          />

          <Input
            id="register-password"
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            helperText="At least 8 characters"
            required
            error={errors.password}
          />

          <Input
            id="register-confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={() => handleBlur('confirmPassword')}
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword}
          />

          {/* Visually grouped optional fields */}
          <div className="pt-2 border-t border-surface-border flex flex-col gap-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Optional details
            </span>

            <Input
              id="register-phone"
              name="phone"
              label="Phone number (optional)"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              autoComplete="tel"
              error={errors.phone}
            />

            <Select
              id="register-stallType"
              name="stallType"
              label="Type of stall (optional)"
              value={formData.stallType}
              onChange={handleChange}
              options={STALL_TYPES}
              placeholder="Select stall type"
              error={errors.stallType}
            />
          </div>

          <Button
            type="submit"
            size="md"
            isLoading={isSubmitting}
            loadingText="Creating account..."
            className="w-full mt-2"
          >
            Create account
          </Button>
        </form>

        {/* Login link */}
        <div className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded px-1"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
