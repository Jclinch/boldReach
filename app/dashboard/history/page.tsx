// app/dashboard/history/page.tsx
// Logistic History Page - app/page-path: /dashboard/history
'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

interface ShipmentRow {
  id: string;
  tracking_number?: string;
  trackingNumber?: string;
  origin_location?: string;
  destination?: string;
  delivery_location?: string;
  receiver_phone?: string;
  receiver_contact?: { phone?: string } | null;
  items_description?: string;
  itemsDescription?: string;
  weight?: number | string | null;
  package_quantity?: number | null;
  status?: string;
  shipment_date?: string;
  created_at?: string;
  createdAt?: string;
  latest_event_time?: string;
  estimated_delivery_date?: string;
}

export default function HistoryPage() {
  const supabase = createClient();
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userLocation, setUserLocation] = useState<string>('');
  const [locationMissing, setLocationMissing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchShipments = async () => {
      setIsLoading(true);
      try {
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('Not authenticated');
          if (isMounted) setShipments([]);
          setIsLoading(false);
          return;
        }

        // Load user's location (used to filter shipment history)
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('location')
          .eq('id', user.id)
          .single();

        const location = (profile?.location || '').toString().trim();
        if (isMounted) setUserLocation(location);

        const hasLocation = !profileError && Boolean(location);
        if (isMounted) setLocationMissing(!hasLocation);

        // Build base query (shared history: show shipments from all users)
        let query = supabase
          .from('shipments')
          .select('*')
          .order('created_at', { ascending: false });

        if (hasLocation) {
          // Only show shipments sent from or to the user's location
          query = query.or(`origin_location.eq.${location},destination.eq.${location}`);
        } else {
          // Fallback: if the user's profile/location isn't set, at least show shipments they created.
          query = query.eq('user_id', user.id);
        }

        // Apply status filter
        if (filterStatus !== 'all') {
          // Normalize UI filter values to the set of statuses stored in DB
          // (e.g. we display "Pending" for the DB status "created").
          const statusValues: string[] = (() => {
            switch (filterStatus) {
              case 'pending':
                // DB enum uses 'created' for what the UI calls "Pending"
                return ['created'];
              case 'in_transit':
                return ['in_transit', 'in-transit'];
              default:
                return [filterStatus];
            }
          })();

          query = statusValues.length === 1
            ? query.eq('status', statusValues[0])
            : query.in('status', statusValues);
        }

        // Execute query
        const { data, error } = await query;

        if (error) {
          // PostgREST errors sometimes appear as `{}` in Next dev overlay unless
          // we log the individual fields.
          const err = error as unknown as {
            message?: string;
            details?: string;
            hint?: string;
            code?: string;
          };

          console.error('Failed to fetch shipments', {
            message: err.message,
            details: err.details,
            hint: err.hint,
            code: err.code,
          });
          if (isMounted) setShipments([]);
          return;
        }

        // Apply search filter (client-side)
        let filtered = Array.isArray(data) ? data : [];
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (ship) =>
              (ship.tracking_number || '').toLowerCase().includes(searchLower) ||
              (ship.destination || '').toLowerCase().includes(searchLower) ||
              (ship.items_description || '').toLowerCase().includes(searchLower) ||
              (ship.origin_location || '').toLowerCase().includes(searchLower)
          );
        }

        if (isMounted) setShipments(filtered);
      } catch (error) {
        console.error('Failed to fetch shipments:', error);
        if (isMounted) setShipments([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Small debounce for search
    const t = setTimeout(fetchShipments, 250);
    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, [searchTerm, filterStatus, supabase]);

  const getStatusBadgeVariant = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'in_transit':
      case 'in-transit':
        return 'default';
      case 'pending':
      case 'created':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return 'Unknown';
    // Map 'created' to 'Pending'
    if (status.toLowerCase() === 'created') {
      return 'Pending';
    }
    return status
      .toString()
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDateTime = (dt?: string) => {
    if (!dt) return '';
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    // Format as YYYY-MM-DD only
    return d.toISOString().slice(0, 10);
  };

  // normalize each row to the fields our UI uses
  const normalize = (row: ShipmentRow) => {
    const receiverPhone =
      (row.receiver_phone || row.receiver_contact?.phone || '').toString();

    return {
      id: row.id,
      trackingNumber: (row.trackingNumber || row.tracking_number || '').toString(),
      origin: (row.origin_location || '').toString(),
      destination: (row.destination || row.delivery_location || '').toString(),
      receiverPhone,
      description: (row.itemsDescription || row.items_description || '').toString(),
      packageQuantity: row.package_quantity == null ? '' : String(row.package_quantity),
      status: (row.status || '').toString(),
      dateTime: (row.shipment_date || row.latest_event_time || row.createdAt || row.created_at || '').toString(), // Prefer shipment_date
      estimatedDelivery: (row.estimated_delivery_date || '').toString(),
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Logistics History</h1>
          <p className="text-[#475569]">
            {locationMissing
              ? 'Your location is not set. Showing only shipments you created.'
              : userLocation
                ? `Showing shipments from/to ${userLocation}`
                : 'Showing shipments from/to your location'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-end">
            <div className="lg:col-span-2 w-full max-w-full sm:max-w-md lg:max-w-none mx-auto lg:mx-0">
              <label className="text-sm text-slate-600 mb-2 block">Items Description</label>
                <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by tracking ID, address, or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-[#1E293B] focus:border-[#fa9e09] focus:outline-none focus:ring-3 focus:ring-opacity-10 focus:ring-[#fa9e09] w-full max-w-full md:max-w-md lg:max-w-none sm:text-sm text-xs py-2 sm:py-2.5"
                />
                </div>
            </div>

            <div className="w-full max-w-full sm:max-w-xs lg:max-w-none mx-auto lg:mx-0">
              <label className="text-sm text-slate-600 mb-2 block"> &nbsp;</label>
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#94A3B8] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-md border border-[#E2E8F0] bg-white text-[#1E293B] focus:border-[#fa9e09] focus:outline-none focus:ring-3 focus:ring-opacity-10 focus:ring-[#fa9e09] appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  {/* <option value="confirmed">Confirmed</option> */}
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#94A3B8] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-[#94A3B8]">Loading shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-12">
            {/* Placeholder illustration (large) */}
            <div className="mx-auto max-w-[720px]">
             <Image
              src="/feeling.png"
              alt="No History Illustration"
              width={400}
              height={300}
              className="mx-auto mb-6"
             />
            </div>

            <p className="text-gray-950 mt-6 mb-6">You do not any have History</p>
           
          </div>
        ) : (
          <div className="space-y-4">
            {/* Export CSV Button */}
            <div>
              <Button
                className="mb-2 bg-[#F97316] text-white px-4 py-2 rounded-md"
                onClick={async () => {
                  const csvEscape = (value: unknown) => {
                    const s = (value ?? '').toString();
                    if (/[\n\r",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
                    return s;
                  };

                  const ids = shipments
                    .filter((s) => (s.status || '').toString().toLowerCase() === 'delivered')
                    .map((s) => s.id)
                    .filter(Boolean);

                  let deliveredAtById: Record<string, string> = {};
                  try {
                    if (ids.length > 0) {
                      const res = await fetch('/api/shipments/delivery-dates', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ shipmentIds: ids }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        deliveredAtById = (data?.deliveredAtById || {}) as Record<string, string>;
                      }
                    }
                  } catch {
                    // If delivery dates fail, export still proceeds with blank delivery date.
                  }

                  const csvHeaders = [
                    'Tracking ID',
                    'Origin Location',
                    'Destination',
                    'Receiver Phone',
                    'Description',
                    'Weight (kg)',
                    'Package Qty',
                    'Status',
                    'Date Sent',
                    'Delivery Date',
                  ];
                  const csvRows = [csvHeaders.join(',')];

                  shipments.forEach((s) => {
                    const row = normalize(s);
                    const deliveryDate = deliveredAtById[s.id] ? formatDateTime(deliveredAtById[s.id]) : '';
                    const weightKg = s.weight === null || s.weight === undefined ? '' : String(s.weight);
                    const qty = s.package_quantity == null ? '' : String(s.package_quantity);

                    csvRows.push(
                      [
                        csvEscape(row.trackingNumber),
                        csvEscape(row.origin),
                        csvEscape(row.destination),
                        csvEscape(row.receiverPhone),
                        csvEscape(row.description),
                        csvEscape(weightKg),
                        csvEscape(qty),
                        csvEscape(getStatusLabel(row.status)),
                        csvEscape(row.dateTime),
                        csvEscape(deliveryDate),
                      ].join(',')
                    );
                  });

                  const csvContent = csvRows.join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'shipment_history.csv';
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
              >
                Export CSV
              </Button>
            </div>

            {/* Table for desktop, cards for mobile */}
            {/* Desktop Table (hidden on mobile) */}
            <div className="rounded-md shadow-sm hidden sm:block">
              <div className="overflow-x-auto">
                <div className="min-w-[600px] lg:min-w-0">
                  <div className="bg-[#0F2940] text-white grid grid-cols-8 gap-4 items-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                    <div>Tracking ID</div>
                    <div>Origin</div>
                    <div>Destination</div>
                    <div>Receiver Phone</div>
                    <div>Description</div>
                    <div className="whitespace-nowrap">Package Qty</div>
                    <div>Status</div>
                    <div className="text-right">Date / Print</div>
                  </div>
                  {/* rows */}
                  <div className="bg-white divide-y divide-gray-100">
                    {shipments.map((s) => {
                      const row = normalize(s);
                      return (
                        <div
                          key={row.id}
                          className="grid grid-cols-8 gap-4 items-center px-4 sm:px-6 py-4 sm:py-6 text-xs sm:text-sm"
                        >
                          <div className="font-semibold text-[#0F2940] wrap-break-word">{row.trackingNumber || '—'}</div>
                          <div className="text-[#475569] wrap-break-word">{row.origin || '—'}</div>
                          <div className="text-[#475569] wrap-break-word">{row.destination || '—'}</div>
                          <div className="text-[#475569] wrap-break-word">{row.receiverPhone || '—'}</div>
                          <div className="text-[#475569] wrap-break-word">{row.description || '—'}</div>
                          <div className="text-[#475569] wrap-break-word">{row.packageQuantity || '—'}</div>
                          <div>
                            <Badge variant={getStatusBadgeVariant(row.status)}>{getStatusLabel(row.status)}</Badge>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <div className="text-[#94A3B8]">{formatDateTime(row.dateTime)}</div>
                            <button
                              type="button"
                              className="mt-2 inline-flex items-center justify-center rounded-md border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#0F2940] hover:bg-[#F8FAFC]"
                              onClick={() => {
                                const url = `/dashboard/history/print/${row.id}`;
                                window.open(url, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              Print
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Cards (shown only on mobile) */}
            <div className="sm:hidden space-y-4">
              {shipments.map((s) => {
                const row = normalize(s);
                return (
                  <div key={row.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#fa9e09]">{formatDateTime(row.dateTime)}</span>
                      <Badge variant={getStatusBadgeVariant(row.status)}>{getStatusLabel(row.status)}</Badge>
                    </div>
                    <div className="mt-1">
                      <div className="text-xs text-[#475569]">Tracking ID</div>
                      <div className="font-semibold text-[#0F2940] wrap-break-word text-sm">{row.trackingNumber || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#475569]">Origin</div>
                      <div className="text-[#475569] wrap-break-word text-sm">{row.origin || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#475569]">Destination</div>
                      <div className="text-[#475569] wrap-break-word text-sm">{row.destination || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#475569]">Receiver Phone</div>
                      <div className="text-[#475569] wrap-break-word text-sm">{row.receiverPhone || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#475569]">Description</div>
                      <div className="text-[#475569] wrap-break-word text-sm">{row.description || '—'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-[#475569]">Package Qty</div>
                      <div className="text-[#475569] wrap-break-word text-sm">{row.packageQuantity || '—'}</div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          const url = `/dashboard/history/print/${row.id}`;
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        Print
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}