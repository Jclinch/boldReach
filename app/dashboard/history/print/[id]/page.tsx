import Image from 'next/image';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { PrintAuto } from './PrintAuto';
import { PrintToolbar } from './PrintToolbar';

type Shipment = {
  id: string;
  tracking_number: string | null;
  sender_name: string | null;
  receiver_name: string | null;
  receiver_phone?: string | null;
  receiver_contact: { phone?: string } | null;
  items_description: string | null;
  weight: number | null;
  package_quantity?: number | null;
  origin_location?: string | null;
  destination: string | null;
  shipment_date: string | null;
  created_at: string | null;
  package_image_url: string | null;
  pickup_location?: string | null;
  delivery_location?: string | null;
  [key: string]: unknown;
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
}

export default async function PrintShipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-700">Shipment not found</p>
      </div>
    );
  }

  const shipment = data as unknown as Shipment;
  const receiverPhone = shipment.receiver_phone || shipment.receiver_contact?.phone || '—';
  const origin =
    (shipment.origin_location || shipment.pickup_location || null) as string | null;
  const destination =
    (shipment.destination || shipment.delivery_location || null) as string | null;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PrintAuto />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page { size: A5; margin: 5mm; }
            @media print {
              .no-print { display: none !important; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          `,
        }}
      />

      <PrintToolbar />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-[520px] h-[200px]">
          <Image
            src="/logo.png"
            alt=""
            fill
            className="object-contain opacity-[0.06]"
            priority
          />
        </div>
      </div>

      <div className="mx-auto max-w-[900px] p-8">
        <div className="bg-white p-8 shadow-sm">
          <div className="grid grid-cols-[160px_1fr_260px] gap-6 items-center mb-8 pb-6 border-b-2 border-slate-200">
            <div className="bg-slate-900 p-5 flex items-center justify-center shadow-md">
              <Image src="/logo.png" alt="BOLDREACH" width={140} height={48} priority />
            </div>

            <div className="flex flex-col justify-center pl-2">
              <div className="text-2xl font-extrabold text-slate-900 tracking-wider leading-tight">
                BOLDREACH LOGISTICS
              </div>
              <div className="text-xs text-slate-500 mt-1 tracking-wide">
                SHIPPING & DELIVERY SERVICES
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative bg-gradient-to-br from-red-600 to-red-700 text-white px-5 py-3 text-center shadow-lg overflow-hidden border-2 border-red-800">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.3) 10px, rgba(255,255,255,.3) 20px)'
                }}></div>
                <div className="relative">
                  <div className="text-2xl font-black tracking-wider">⚠ FRAGILE</div>
                  <div className="text-xs font-semibold mt-1 tracking-wide">HANDLE WITH EXTREME CARE</div>
                </div>
              </div>
              <div className="text-right text-sm bg-slate-50 px-3 py-2 rounded">
                <span className="font-semibold text-slate-700">Date:</span>
                <span className="ml-2 font-medium">{formatDate(shipment.shipment_date)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white px-6 py-3 mb-6 text-center shadow-md">
            <div className="text-2xl font-black tracking-widest">PRIORITY PARCEL</div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="border border-slate-300 p-5 bg-slate-50 shadow-sm">
              <div className="text-base font-bold mb-3 pb-2 border-b border-slate-400 text-slate-900">
                FROM: <span className="text-slate-700">{origin?.toUpperCase() || '—'}</span>
              </div>
              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">Name:</span>
                  <span className="ml-2 text-slate-900">{shipment.sender_name || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Location:</span>
                  <span className="text-slate-900 mt-1 pl-2">{origin || '—'}</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-300 p-5 bg-slate-50 shadow-sm">
              <div className="text-base font-bold mb-3 pb-2 border-b border-slate-400 text-slate-900">
                TO: <span className="text-slate-700">{destination?.toUpperCase() || '—'}</span>
              </div>
              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">Name:</span>
                  <span className="ml-2 text-slate-900">{shipment.receiver_name || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Location:</span>
                  <span className="text-slate-900 mt-1 pl-2">{destination || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Phone:</span>
                  <span className="ml-2 text-slate-900">{receiverPhone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="border border-slate-300 p-5 bg-blue-50 shadow-sm">
              <div className="text-sm font-bold mb-2 text-slate-700 uppercase tracking-wide">
                Tracking ID
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-wide break-all">
                {shipment.tracking_number || '—'}
              </div>
            </div>

            <div className="border border-slate-300 p-5 bg-amber-50 shadow-sm">
              <div className="text-sm font-bold mb-2 text-slate-700 uppercase tracking-wide">
                Additional Information
              </div>
              <div className="text-sm mb-2 text-slate-900">
                {shipment.items_description || '—'}
              </div>
              <div className="text-sm mt-3 pt-3 border-t border-amber-200">
                <span className="font-semibold text-slate-700">Weight:</span>
                <span className="ml-2 text-lg font-bold text-slate-900">{shipment.weight ?? '—'} KG</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 text-center space-y-1">
            <p className="font-semibold">Handle with care • Confirm receiver identity before release</p>
          </div>
        </div>
      </div>
    </div>
  );
}
