// // app/dashboard/tracking/page.tsx
// // Live Tracking Page - app/page-path: /dashboard/tracking

// 'use client';

// import React, { useState } from 'react';
// import { DashboardLayout } from '@/components/DashboardLayout';
// import { Card } from '@/components/Card';
// import { Button } from '@/components/Button';
// import { Input } from '@/components/Input';
// import { Badge } from '@/components/Badge';
// import { LiveTrackingSchema } from '@/lib/validation';

// interface TrackingEvent {
//   eventType: string;
//   description: string;
//   status: string;
//   eventTimestamp: string;
// }

// interface TrackingData {
//   trackingNumber: string;
//   status: string;
//   shipmentType: string;
//   weightKg: number;
//   pickupLocation: string;
//   deliveryLocation: string;
//   estimatedDeliveryDate: string;
//   events: TrackingEvent[];
// }

// export default function TrackingPage() {
//   const [trackingNumber, setTrackingNumber] = useState('');
//   const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [searched, setSearched] = useState(false);

//   const handleSearch = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSearched(true);

//     // Validate tracking number format
//     const result = LiveTrackingSchema.safeParse({ trackingNumber });
//     if (!result.success) {
//       setError('Invalid tracking number format. Expected: BR-YYMMDD-XXXXXX');
//       setTrackingData(null);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch(`/api/tracking/${trackingNumber}`);
//       if (!response.ok) {
//         setError('Shipment not found');
//         setTrackingData(null);
//         setIsLoading(false);
//         return;
//       }

//       const data = await response.json();
//       setTrackingData(data);
//       setError('');
//     } catch (err) {
//       setError('Failed to fetch tracking information');
//       setTrackingData(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'delivered':
//         return 'text-[#10B981]';
//       case 'in_transit':
//         return 'text-[#F97316]';
//       case 'pending':
//         return 'text-[#F59E0B]';
//       case 'cancelled':
//         return 'text-[#EF4444]';
//       default:
//         return 'text-[#475569]';
//     }
//   };

//   const getStatusBadgeVariant = (status: string) => {
//     switch (status) {
//       case 'delivered':
//         return 'success';
//       case 'in_transit':
//         return 'default';
//       case 'pending':
//         return 'warning';
//       case 'cancelled':
//         return 'error';
//       default:
//         return 'default';
//     }
//   };

//   const getStatusLabel = (status: string) => {
//     return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
//   };

//   const formatDate = (date: string) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const formatDateTime = (date: string) => {
//     return new Date(date).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   return (
//     <DashboardLayout>
//       <div className="space-y-8 max-w-4xl">
//         <div>
//           <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Live Tracking</h1>
//           <p className="text-[#475569]">
//             Enter your tracking number to view real-time shipment status
//           </p>
//         </div>

//         <Card>
//           <form onSubmit={handleSearch} className="space-y-4">
//             <div className="flex gap-3">
//               <Input
//                 id="trackingNumber"
//                 type="text"
//                 placeholder="Enter tracking number (e.g., BR-251211-100001)"
//                 value={trackingNumber}
//                 onChange={(e) => setTrackingNumber(e.target.value)}
//                 error={error && searched ? error : undefined}
//                 className="flex-1"
//               />
//               <Button
//                 type="submit"
//                 variant="primary"
//                 size="medium"
//                 isLoading={isLoading}
//                 disabled={isLoading || !trackingNumber}
//               >
//                 Track
//               </Button>
//             </div>
//           </form>
//         </Card>

//         {searched && !trackingData && error && (
//           <Card className="bg-[#FEE2E2]">
//             <div className="text-[#991B1B]">
//               <p className="font-semibold mb-1">Tracking Error</p>
//               <p className="text-sm">{error}</p>
//             </div>
//           </Card>
//         )}

//         {trackingData && (
//           <div className="space-y-6">
//             {/* Shipment Info Header */}
//             <Card>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//                 <div>
//                   <p className="text-xs text-[#94A3B8] mb-1">Tracking Number</p>
//                   <p className="font-mono font-semibold text-[#1E293B]">
//                     {trackingData.trackingNumber}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-[#94A3B8] mb-1">Status</p>
//                   <Badge variant={getStatusBadgeVariant(trackingData.status)}>
//                     {getStatusLabel(trackingData.status)}
//                   </Badge>
//                 </div>

//                 <div>
//                   <p className="text-xs text-[#94A3B8] mb-1">Shipment Type</p>
//                   <p className="text-sm text-[#1E293B] capitalize">{trackingData.shipmentType}</p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-[#94A3B8] mb-1">Est. Delivery</p>
//                   <p className="text-sm text-[#1E293B]">
//                     {formatDate(trackingData.estimatedDeliveryDate)}
//                   </p>
//                 </div>
//               </div>

//               <div className="border-t border-[#E2E8F0] pt-6">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                   <div>
//                     <p className="text-xs text-[#94A3B8] mb-1">From</p>
//                     <p className="text-sm text-[#1E293B] font-medium">
//                       {trackingData.pickupLocation}
//                     </p>
//                   </div>

//                   <div className="md:col-span-2 flex items-center justify-center">
//                     <div className="flex-1 h-1 bg-[#2563EB]"></div>
//                     <div className="text-2xl mx-4">→</div>
//                     <div className="flex-1 h-1 bg-[#2563EB]"></div>
//                   </div>

//                   <div>
//                     <p className="text-xs text-[#94A3B8] mb-1">To</p>
//                     <p className="text-sm text-[#1E293B] font-medium">
//                       {trackingData.deliveryLocation}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-6 mt-6">
//                 <div>
//                   <p className="text-xs text-[#94A3B8] mb-1">Weight</p>
//                   <p className="text-sm text-[#1E293B]">{trackingData.weightKg} kg</p>
//                 </div>
//               </div>
//             </Card>

//             {/* Timeline */}
//             <Card>
//               <h2 className="text-lg font-semibold text-[#1E293B] mb-6">Tracking Timeline</h2>

//               <div className="space-y-0">
//                 {trackingData.events.map((event, index) => {
//                   const isCompleted = event.status === 'completed';
//                   const isLast = index === trackingData.events.length - 1;

//                   return (
//                     <div key={index} className="relative">
//                       {/* Timeline line */}
//                       {!isLast && (
//                         <div
//                           className={`absolute left-6 top-12 w-1 h-8 ${
//                             isCompleted ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'
//                           }`}
//                         ></div>
//                       )}

//                       {/* Timeline item */}
//                       <div className="flex gap-6 pb-6">
//                         {/* Timeline dot */}
//                         <div className="relative flex flex-col items-center">
//                           <div
//                             className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
//                               isCompleted
//                                 ? 'bg-[#10B981] border-[#10B981]'
//                                 : 'bg-white border-[#E2E8F0]'
//                             }`}
//                           >
//                             {isCompleted && <span className="text-white text-xs">✓</span>}
//                           </div>
//                         </div>

//                         {/* Content */}
//                         <div className="flex-1 pt-0.5">
//                           <p
//                             className={`font-medium ${
//                               isCompleted ? 'text-[#1E293B]' : 'text-[#94A3B8]'
//                             }`}
//                           >
//                             {event.eventType
//                               .split('_')
//                               .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//                               .join(' ')}
//                           </p>
//                           <p className="text-sm text-[#475569] mt-1">{event.description}</p>
//                           <p className="text-xs text-[#94A3B8] mt-2">
//                             {formatDateTime(event.eventTimestamp)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </Card>
//           </div>
//         )}

//         {!searched && (
//           <Card>
//             <div className="text-center py-12">
//               <p className="text-[#94A3B8] mb-4">
//                 Enter a tracking number to get started with live tracking
//               </p>
//               <p className="text-xs text-[#CBD5E1]">Format: BR-XXXXXX-XXXXX</p>
//             </div>
//           </Card>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }

















'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Image from 'next/image';

type EventRow = {
  id: string;
  eventType: string;
  description?: string | null;
  location?: string | null;
  eventTimestamp: string;
};

type TrackingResponse = {
  shipment: {
    id: string;
    trackingNumber: string;
    senderName?: string;
    receiverName?: string;
    originLocation?: string;
    destination?: string;
    weight?: number;
    itemsDescription?: string;
    package_image_url?: string;
    status?: string;
    progressStep?: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered';
    progressIndex?: number; // 0..3
    createdAt?: string;
  };
  estimatedDeliveryDate?: string;
  events: EventRow[];
};

const STEP_LABELS = ['Pending', 'In Transit', 'Out for Delivery', 'Delivered'];

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [data, setData] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSearched(true);

    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      setData(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(trackingNumber.trim())}`);
      if (!res.ok) {
        setError('Shipment not found');
        setData(null);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Failed to fetch tracking information');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const progressIndex = data?.shipment?.progressIndex ?? -1;

  return (
    <DashboardLayout>
      <div className="w-full max-w-[1100px] mx-auto space-y-8 px-4">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-1">Live Tracking</h1>
          <p className="text-[#64748B]">Track your shipment in real-time</p>
        </div>

        {/* Search card */}
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <div className="bg-transparent">
              <form onSubmit={handleSearch} className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[#94A3B8]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M5 11a6 6 0 1012 0 6 6 0 00-12 0z" />
                      </svg>
                    </span>
                    <input
                      className="w-full pl-11 pr-4 h-[44px] text-sm border border-[#E6E7EB] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2C]"
                      placeholder="BR-251212-984470"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="w-[140px] h-[44px] rounded-md bg-[#F97316] hover:bg-[#ea690c] text-white font-medium shadow"
                  type="submit"
                >
                  {loading ? 'Tracking...' : 'Track'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* If not searched: show hint card */}
        {!searched && (
          <Card>
            <div className="py-10 text-center text-[#94A3B8]">
              <p className="mb-1">Enter a tracking number to view real-time shipment status</p>
              <p className="text-xs">Format: BR-251212-984470</p>
            </div>
          </Card>
        )}

        {/* Error */}
        {searched && !data && error && (
          <Card className="bg-[#FEE2E2]">
            <div className="p-4 text-[#991B1B]">
              <p className="font-semibold">Shipment not found</p>
              <p className="text-sm">{error}</p>
            </div>
          </Card>
        )}

        {/* Shipment Details + Progress */}
        {data && data.shipment && (
          <div className="bg-white rounded-[18px] border border-[#E6E7EB] shadow-sm overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-[#1E293B] mb-6">Shipment Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Senders Name</p>
                    <p className="text-sm text-[#1E293B] font-medium">{data.shipment.senderName || '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Tracking ID</p>
                    <p className="text-sm text-[#1E293B] font-medium">{data.shipment.trackingNumber}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Origin Location</p>
                    <p className="text-sm text-[#1E293B]">{data.shipment.originLocation}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Weight</p>
                    <p className="text-sm text-[#1E293B]">{data.shipment.weight ?? '—'}kg</p>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Receivers Name</p>
                    <p className="text-sm text-[#1E293B] font-medium">{data.shipment.receiverName || '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Current Status</p>
                    <p className="text-sm text-[#1E293B] font-medium">{data.shipment.status || data.shipment.progressStep}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Destination</p>
                    <p className="text-sm text-[#1E293B]">{data.shipment.destination}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Description</p>
                    <p className="text-sm text-[#1E293B]">{data.shipment.itemsDescription || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Progress area */}
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-[#1E293B] mb-6">Delivery Progress</h3>

                {/* horizontal progress bar */}
                <div className="relative px-6 pb-6">
                  {/* Background line */}
                  <div className="absolute left-6 right-6 top-8 h-[6px] bg-[#E6E7EB] rounded-full"></div>
                  
                  {/* Filled progress line */}
                  {progressIndex >= 0 && (
                    <div 
                      className="absolute left-6 top-8 h-[6px] bg-[#34D399] rounded-full transition-all duration-500"
                      style={{
                        width: `calc(${(progressIndex / (STEP_LABELS.length - 1)) * 100}% + 22px - ${progressIndex === 0 ? '0px' : '22px'})`,
                      }}
                    ></div>
                  )}

                  <div className="relative flex items-center justify-between">
                    {STEP_LABELS.map((label, idx) => {
                      const completed = idx <= progressIndex;
                      const active = idx === progressIndex;
                      const circleSize = active ? 56 : 44;

                      return (
                        <div key={label} className="flex-1 flex flex-col items-center">
                          <div
                            className={`rounded-full flex items-center justify-center ${completed ? 'border-transparent' : 'border-[#E6E7EB]'}`}
                            style={{
                              width: circleSize,
                              height: circleSize,
                              boxShadow: active ? '0 6px 18px rgba(52,211,153,0.12)' : undefined,
                              background: completed ? '#34D399' : '#FFFFFF',
                              border: completed ? 'none' : '2px solid #E6E7EB',
                            }}
                          >
                            {/* icon */}
                            <div className="text-white text-[18px] font-semibold">
                              {completed ? '✓' : idx + 1}
                            </div>
                          </div>

                          <div className={`mt-3 text-sm ${active ? 'text-[#16A34A]' : completed ? 'text-[#34D399]' : 'text-[#94A3B8]'}`}>
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline / events card */}
        {data && data.events && data.events.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Tracking Timeline</h2>
            <div className="space-y-4">
              {data.events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-4">
                  <div className="w-10">
                    <div className="w-8 h-8 rounded-full bg-[#E6E7EB] flex items-center justify-center text-[#475569]">✓</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#1E293B]">
                      {ev.eventType.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-[#64748B]">{ev.description}</div>
                    <div className="text-xs text-[#94A3B8] mt-1">{new Date(ev.eventTimestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
