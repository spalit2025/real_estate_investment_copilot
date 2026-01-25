'use client';

/**
 * Assumption Profiles Management Page
 * Create, edit, delete tax/assumption profiles
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { GlobalAssumptions } from '@/types/deal';

interface AssumptionProfile {
  id: string;
  userId: string;
  name: string;
  assumptions: Partial<GlobalAssumptions>;
  isDefault: boolean;
  createdAt: Date;
}

interface PresetProfile {
  name: string;
  assumptions: Partial<GlobalAssumptions>;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<AssumptionProfile[]>([]);
  const [presets, setPresets] = useState<Record<string, PresetProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<AssumptionProfile | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    federalTaxRate: 0.30,
    stateTaxRate: 0.09,
    reitBaselineReturn: 0.06,
    depreciationYears: 27.5,
    landValuePct: 0.20,
    capitalGainsRate: 0.15,
    deprecationRecaptureRate: 0.25,
    isDefault: false,
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      if (!response.ok) throw new Error('Failed to fetch profiles');
      const data = await response.json();
      setProfiles(data.profiles || []);
      setPresets(data.presets || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      federalTaxRate: 0.30,
      stateTaxRate: 0.09,
      reitBaselineReturn: 0.06,
      depreciationYears: 27.5,
      landValuePct: 0.20,
      capitalGainsRate: 0.15,
      deprecationRecaptureRate: 0.25,
      isDefault: false,
    });
    setEditingProfile(null);
    setShowNewForm(false);
  };

  const loadProfileForEdit = (profile: AssumptionProfile) => {
    setFormData({
      name: profile.name,
      federalTaxRate: profile.assumptions.federalTaxRate ?? 0.30,
      stateTaxRate: profile.assumptions.stateTaxRate ?? 0.09,
      reitBaselineReturn: profile.assumptions.reitBaselineReturn ?? 0.06,
      depreciationYears: profile.assumptions.depreciationYears ?? 27.5,
      landValuePct: profile.assumptions.landValuePct ?? 0.20,
      capitalGainsRate: profile.assumptions.capitalGainsRate ?? 0.15,
      deprecationRecaptureRate: profile.assumptions.deprecationRecaptureRate ?? 0.25,
      isDefault: profile.isDefault,
    });
    setEditingProfile(profile);
    setShowNewForm(true);
  };

  const createFromPreset = async (presetKey: string) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: presetKey }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create profile');
      }

      setSuccess('Profile created successfully');
      fetchProfiles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsSaving(false);
    }
  };

  const saveProfile = async () => {
    if (!formData.name.trim()) {
      setError('Profile name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const assumptions: Partial<GlobalAssumptions> = {
        federalTaxRate: formData.federalTaxRate,
        stateTaxRate: formData.stateTaxRate,
        reitBaselineReturn: formData.reitBaselineReturn,
        depreciationYears: formData.depreciationYears,
        landValuePct: formData.landValuePct,
        capitalGainsRate: formData.capitalGainsRate,
        deprecationRecaptureRate: formData.deprecationRecaptureRate,
      };

      const url = editingProfile
        ? `/api/profiles/${editingProfile.id}`
        : '/api/profiles';

      const response = await fetch(url, {
        method: editingProfile ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          assumptions,
          isDefault: formData.isDefault,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      setSuccess(editingProfile ? 'Profile updated successfully' : 'Profile created successfully');
      resetForm();
      fetchProfiles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProfileById = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete profile');
      }

      setSuccess('Profile deleted successfully');
      fetchProfiles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
    }
  };

  const setAsDefault = async (profileId: string) => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set default');
      }

      setSuccess('Default profile updated');
      fetchProfiles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default');
    }
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assumption Profiles</h1>
        <p className="text-gray-500">
          Create and manage tax assumption profiles to quickly apply to new deals
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Quick Create from Presets */}
      {!showNewForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Create from Preset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(presets).map(([key, preset]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{preset.name}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Federal Tax: {formatPercent(preset.assumptions.federalTaxRate ?? 0)}</p>
                    <p>State Tax: {formatPercent(preset.assumptions.stateTaxRate ?? 0)}</p>
                    <p>Land Value: {formatPercent(preset.assumptions.landValuePct ?? 0)}</p>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => createFromPreset(key)}
                    disabled={isSaving}
                  >
                    Create Profile
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New/Edit Profile Form */}
      {showNewForm ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingProfile ? 'Edit Profile' : 'Create New Profile'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Profile Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Custom Profile"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="federalTaxRate">Federal Tax Rate (%)</Label>
                  <Input
                    id="federalTaxRate"
                    type="number"
                    step="0.1"
                    value={(formData.federalTaxRate * 100).toFixed(1)}
                    onChange={(e) => setFormData({ ...formData, federalTaxRate: parseFloat(e.target.value) / 100 })}
                  />
                </div>
                <div>
                  <Label htmlFor="stateTaxRate">State Tax Rate (%)</Label>
                  <Input
                    id="stateTaxRate"
                    type="number"
                    step="0.1"
                    value={(formData.stateTaxRate * 100).toFixed(1)}
                    onChange={(e) => setFormData({ ...formData, stateTaxRate: parseFloat(e.target.value) / 100 })}
                  />
                </div>
                <div>
                  <Label htmlFor="reitBaselineReturn">REIT Baseline (%)</Label>
                  <Input
                    id="reitBaselineReturn"
                    type="number"
                    step="0.1"
                    value={(formData.reitBaselineReturn * 100).toFixed(1)}
                    onChange={(e) => setFormData({ ...formData, reitBaselineReturn: parseFloat(e.target.value) / 100 })}
                  />
                </div>
                <div>
                  <Label htmlFor="depreciationYears">Depreciation Years</Label>
                  <Input
                    id="depreciationYears"
                    type="number"
                    step="0.5"
                    value={formData.depreciationYears}
                    onChange={(e) => setFormData({ ...formData, depreciationYears: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="landValuePct">Land Value (%)</Label>
                  <Input
                    id="landValuePct"
                    type="number"
                    step="1"
                    value={(formData.landValuePct * 100).toFixed(0)}
                    onChange={(e) => setFormData({ ...formData, landValuePct: parseFloat(e.target.value) / 100 })}
                  />
                </div>
                <div>
                  <Label htmlFor="capitalGainsRate">Capital Gains Rate (%)</Label>
                  <Input
                    id="capitalGainsRate"
                    type="number"
                    step="1"
                    value={(formData.capitalGainsRate * 100).toFixed(0)}
                    onChange={(e) => setFormData({ ...formData, capitalGainsRate: parseFloat(e.target.value) / 100 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isDefault" className="font-normal">
                  Set as default profile for new deals
                </Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveProfile} disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingProfile ? 'Update Profile' : 'Create Profile'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowNewForm(true)} className="mb-6">
          + Create Custom Profile
        </Button>
      )}

      {/* Existing Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No profiles yet. Create one from a preset above or create a custom profile.
            </p>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`p-4 border rounded-lg ${profile.isDefault ? 'border-blue-500 bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{profile.name}</h4>
                        {profile.isDefault && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">DEFAULT</span>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-sm text-gray-600">
                        <p>Federal: {formatPercent(profile.assumptions.federalTaxRate ?? 0)}</p>
                        <p>State: {formatPercent(profile.assumptions.stateTaxRate ?? 0)}</p>
                        <p>REIT Baseline: {formatPercent(profile.assumptions.reitBaselineReturn ?? 0)}</p>
                        <p>Land Value: {formatPercent(profile.assumptions.landValuePct ?? 0)}</p>
                        <p>Depreciation: {profile.assumptions.depreciationYears ?? 27.5} yrs</p>
                        <p>Cap Gains: {formatPercent(profile.assumptions.capitalGainsRate ?? 0)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!profile.isDefault && (
                        <Button variant="outline" size="sm" onClick={() => setAsDefault(profile.id)}>
                          Set Default
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => loadProfileForEdit(profile)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteProfileById(profile.id)} className="text-red-600 hover:text-red-700">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
