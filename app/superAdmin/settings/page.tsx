// // app/superAdmin/settings/page.tsx
// // SuperAdmin Settings - app/page-path: /superAdmin/settings

// 'use client';

// import React, { useState } from 'react';
// import { Card } from '@/components/Card';
// import { Button } from '@/components/Button';
// import { Input } from '@/components/Input';
// import { toast } from 'sonner';

// export default function AdminSettings() {
// 	const [settings, setSettings] = useState({
// 		companyName: 'Logistics Pro',
// 		supportEmail: 'support@logisticspro.com',
// 		defaultDeliveryDays: 5,
// 		maxShipmentWeight: 50,
// 		enableNotifications: true,
// 		maintenanceMode: false,
// 	});

// 	const [saving, setSaving] = useState(false);

// 	const handleSave = async () => {
// 		setSaving(true);
// 		try {
// 			// Simulate API call
// 			await new Promise((resolve) => setTimeout(resolve, 1000));
// 			// Here you would make an actual API call to save settings
// 			toast.success('Settings saved successfully!');
// 		} catch {
// 			toast.error('Failed to save settings');
// 		} finally {
// 			setSaving(false);
// 		}
// 	};

// 	const handleInputChange = (field: string, value: string | number | boolean) => {
// 		setSettings((prev) => ({
// 			...prev,
// 			[field]: value,
// 		}));
// 	};

// 	return (
// 		<div className="space-y-8">
// 			<div>
// 				<h1 className="text-3xl font-bold text-[#1E293B] mb-2">Settings</h1>
// 				<p className="text-[#475569]">Configure platform settings and preferences</p>
// 			</div>

// 			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// 				{/* General Settings */}
// 				<Card>
// 					<h2 className="text-xl font-semibold text-[#1E293B] mb-6">General Settings</h2>
// 					<div className="space-y-6">
// 						<div>
// 							<label className="block text-sm font-medium text-[#1E293B] mb-2">Company Name</label>
// 							<Input
// 								type="text"
// 								value={settings.companyName}
// 								onChange={(e) => handleInputChange('companyName', e.target.value)}
// 							/>
// 						</div>

// 						<div>
// 							<label className="block text-sm font-medium text-[#1E293B] mb-2">Support Email</label>
// 							<Input
// 								type="email"
// 								value={settings.supportEmail}
// 								onChange={(e) => handleInputChange('supportEmail', e.target.value)}
// 							/>
// 						</div>

// 						<div>
// 							<label className="block text-sm font-medium text-[#1E293B] mb-2">Default Delivery Days</label>
// 							<Input
// 								type="number"
// 								value={settings.defaultDeliveryDays}
// 								onChange={(e) => handleInputChange('defaultDeliveryDays', parseInt(e.target.value))}
// 								min="1"
// 								max="30"
// 							/>
// 						</div>

// 						<div>
// 							<label className="block text-sm font-medium text-[#1E293B] mb-2">Max Shipment Weight (kg)</label>
// 							<Input
// 								type="number"
// 								value={settings.maxShipmentWeight}
// 								onChange={(e) => handleInputChange('maxShipmentWeight', parseInt(e.target.value))}
// 								min="1"
// 								max="1000"
// 							/>
// 						</div>
// 					</div>
// 				</Card>

// 				{/* System Settings */}
// 				<Card>
// 					<h2 className="text-xl font-semibold text-[#1E293B] mb-6">System Settings</h2>
// 					<div className="space-y-6">
// 						<div className="flex items-center justify-between">
// 							<div>
// 								<label className="block text-sm font-medium text-[#1E293B] mb-1">Enable Notifications</label>
// 								<p className="text-xs text-[#94A3B8]">Send email notifications for shipment updates</p>
// 							</div>
// 							<label className="relative inline-flex items-center cursor-pointer">
// 								<input
// 									type="checkbox"
// 									className="sr-only peer"
// 									checked={settings.enableNotifications}
// 									onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
// 								/>
// 								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
// 							</label>
// 						</div>

// 						<div className="flex items-center justify-between">
// 							<div>
// 								<label className="block text-sm font-medium text-[#1E293B] mb-1">Maintenance Mode</label>
// 								<p className="text-xs text-[#94A3B8]">Temporarily disable user access to the platform</p>
// 							</div>
// 							<label className="relative inline-flex items-center cursor-pointer">
// 								<input
// 									type="checkbox"
// 									className="sr-only peer"
// 									checked={settings.maintenanceMode}
// 									onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
// 								/>
// 								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
// 							</label>
// 						</div>
// 					</div>
// 				</Card>
// 			</div>

// 			{/* Save Button */}
// 			<div className="flex justify-end">
// 				<Button onClick={handleSave} isLoading={saving} disabled={saving}>
// 					{saving ? 'Saving...' : 'Save Settings'}
// 				</Button>
// 			</div>
// 		</div>
// 	);
// }

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { toast } from 'sonner';

type LocationRow = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export default function SuperAdminSettings() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string>('');
  const [newLocationName, setNewLocationName] = useState('');

  const activeLocations = useMemo(
    () => locations.filter((l) => l.is_active),
    [locations]
  );
  const inactiveLocations = useMemo(
    () => locations.filter((l) => !l.is_active),
    [locations]
  );

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/locations');
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string } | null)?.error || 'Failed to load locations');
        setLocations([]);
        return;
      }
      setLocations((data as { locations?: LocationRow[] } | null)?.locations || []);
    } catch (e) {
      console.error('Failed to load locations:', e);
      toast.error('Failed to load locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const addLocation = async () => {
    const name = newLocationName.trim();
    if (!name) {
      toast.error('Enter a location name');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string } | null)?.error || 'Failed to add location');
        return;
      }
      const loc = (data as { location?: LocationRow } | null)?.location;
      if (loc) {
        setLocations((prev) => {
          const exists = prev.some((p) => p.id === loc.id);
          return exists ? prev.map((p) => (p.id === loc.id ? loc : p)) : [loc, ...prev];
        });
      }
      setNewLocationName('');
      toast.success('Location added');
    } finally {
      setSaving(false);
    }
  };

  const removeLocation = async (id: string) => {
    const ok = window.confirm('Remove this location? It will be hidden from dropdowns.');
    if (!ok) return;
    setRemovingId(id);
    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: 'DELETE' });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string } | null)?.error || 'Failed to remove location');
        return;
      }
      setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, is_active: false } : l)));
      toast.success('Location removed');
    } finally {
      setRemovingId('');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Settings</h1>
        <p className="text-[#475569]">Manage platform locations and preferences</p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-[#1E293B] mb-2">Location Management</h2>
        <p className="text-sm text-[#94A3B8] mb-6">
          Locations are stored in the database and used across dropdowns.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#1E293B] mb-2">Add Location</label>
            <Input
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="e.g., OSC-Carlcare-Abuja"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addLocation} disabled={saving}>
              {saving ? 'Saving…' : 'Add'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-[#94A3B8]">Loading locations…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-[#1E293B] mb-3">Active</h3>
              <div className="space-y-2">
                {activeLocations.length === 0 ? (
                  <div className="text-sm text-[#94A3B8]">No active locations.</div>
                ) : (
                  activeLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-[#E2E8F0] bg-white px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-[#1E293B] wrap-break-word">{loc.name}</p>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => removeLocation(loc.id)}
                        disabled={removingId === loc.id}
                        className="border border-red-200 text-red-700 hover:bg-red-50"
                      >
                        {removingId === loc.id ? 'Removing…' : 'Remove'}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1E293B] mb-3">Inactive</h3>
              <div className="space-y-2">
                {inactiveLocations.length === 0 ? (
                  <div className="text-sm text-[#94A3B8]">No inactive locations.</div>
                ) : (
                  inactiveLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="rounded-md border border-[#E2E8F0] bg-white px-3 py-2"
                    >
                      <p className="text-sm text-[#94A3B8] wrap-break-word">{loc.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}