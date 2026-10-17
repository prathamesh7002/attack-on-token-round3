import React, { useState, useEffect } from 'react';
import { Store, User, MapPin, Phone, Check, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { vendorApi } from '../api/vendorApi';
import { STALL_TYPES } from '../constants/stallTypes';
import AppLayout from '../components/layout/AppLayout';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import ErrorState from '../components/common/ErrorState';

export default function ProfilePage() {
  const { vendor, updateVendorState } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    stallName: '',
    ownerName: '',
    stallType: '',
    location: '',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const profile = await vendorApi.getProfile();
        if (profile) {
          setFormData({
            stallName: profile.stallName || vendor?.vendorName || '',
            ownerName: profile.ownerName || vendor?.ownerName || '',
            stallType: profile.stallType || vendor?.stallType || '',
            location: profile.location || vendor?.location || '',
            phone: profile.phone || vendor?.phone || '',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [vendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.stallName.trim() || !formData.ownerName.trim()) {
      showToast('Stall name and your name are required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await vendorApi.updateProfile(formData);
      updateVendorState({
        ...vendor,
        vendorName: updated.stallName,
        stallName: updated.stallName,
        ownerName: updated.ownerName,
        stallType: updated.stallType,
        location: updated.location,
        phone: updated.phone,
      });
      showToast('Stall profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Stall & Vendor Profile
          </h1>
          <p className="text-sm text-text-muted">
            Manage your street food stall information and contact credentials.
          </p>
        </div>

        {error ? (
          <ErrorState
            title="Could not load stall profile"
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="bg-surface rounded-xl border border-surface-border p-6 animate-pulse flex flex-col gap-4">
            <div className="h-6 w-48 bg-background rounded" />
            <div className="h-40 bg-background rounded" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-surface rounded-xl border border-surface-border shadow-sm p-5 sm:p-6 flex flex-col gap-5"
          >
            {/* Account Summary Banner */}
            <div className="p-4 rounded-lg bg-background border border-surface-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-base flex-shrink-0">
                  {(formData.ownerName || 'V').charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {formData.stallName || 'Food Stall'}
                  </span>
                  <span className="text-xs text-text-muted truncate">
                    Account Email: {vendor?.email || 'N/A'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-status-safe-bg text-status-safe border border-status-safe/30 whitespace-nowrap">
                Active Vendor
              </span>
            </div>

            <Input
              id="profile-stallName"
              name="stallName"
              label="Stall name"
              value={formData.stallName}
              onChange={handleChange}
              placeholder="e.g. Sharma Chaat Corner"
              required
            />

            <Input
              id="profile-ownerName"
              name="ownerName"
              label="Owner / Your name"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="e.g. Ramesh Sharma"
              required
            />

            <Select
              id="profile-stallType"
              name="stallType"
              label="Type of stall"
              value={formData.stallType}
              onChange={handleChange}
              options={STALL_TYPES}
              placeholder="Select stall type"
            />

            <Input
              id="profile-location"
              name="location"
              label="Campus location / Stall number"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. North Campus Gate 4, opposite Science Block"
              helperText="Helps you keep track if you run multiple stalls or event carts."
            />

            <Input
              id="profile-phone"
              name="phone"
              label="Phone number"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
            />

            <div className="pt-3 border-t border-surface-border flex items-center justify-between">
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-status-safe" />
                <span>Isolated vendor account</span>
              </span>

              <Button
                type="submit"
                size="md"
                isLoading={isSaving}
                loadingText="Updating..."
                icon={Check}
              >
                Save profile
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
