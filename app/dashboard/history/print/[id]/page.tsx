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
  // Back-compat with older schemas
  pickup_location?: string | null;
  delivery_location?: string | null;
  [key: string]: unknown;
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toISOString().slice(0, 10);
}

export default async function PrintShipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient(cookies());

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-700">Unauthorized</p>
      </div>
    );
  }

  // Use `select('*')` so printing keeps working even if some optional columns
  // (like receiver_phone/origin_location) haven't been migrated in the DB yet.
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', id)
    .single();

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
            @page { size: A4; margin: 16mm; }
            @media print {
              .no-print { display: none !important; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          `,
        }}
      />

      <PrintToolbar />

      <div className="mx-auto max-w-[800px] p-8 relative">
        {/* Watermark */}
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

        <div className="relative z-10">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="BOLDREACH" width={140} height={48} priority />
            <div className="leading-tight">
              <div className="text-lg font-bold text-[#0F2940]">Shipment Document</div>
              <div className="text-xs text-slate-600">For logistics handling & delivery</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2">
              <Image src="/fragile.svg" alt="Fragile" width={22} height={22} />
              <div className="text-sm font-semibold text-[#F97316]">FRAGILE</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-slate-200 p-5">
            <div className="text-xs font-semibold text-slate-500">Tracking Number</div>
            <div className="mt-1 text-xl font-bold text-[#0F2940]">{shipment.tracking_number || '—'}</div>
            <div className="mt-2 text-xs text-slate-500">Date Sent: {formatDate(shipment.shipment_date)}</div>
          </div>

          <div className="rounded-lg border border-slate-200 p-5">
            <div className="text-xs font-semibold text-slate-500">Route</div>
            <div className="mt-2">
              <div className="text-sm text-slate-600">Origin</div>
              <div className="text-sm font-semibold text-slate-900">{origin || '—'}</div>
            </div>
            <div className="mt-3">
              <div className="text-sm text-slate-600">Destination</div>
              <div className="text-sm font-semibold text-slate-900">{destination || '—'}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-slate-200 p-5">
            <div className="text-xs font-semibold text-slate-500">Sender</div>
            <div className="mt-2 text-sm font-semibold">{shipment.sender_name || '—'}</div>
          </div>

          <div className="rounded-lg border border-slate-200 p-5">
            <div className="text-xs font-semibold text-slate-500">Receiver</div>
            <div className="mt-2 text-sm font-semibold">{shipment.receiver_name || '—'}</div>
            <div className="mt-1 text-sm text-slate-700">Phone: {receiverPhone}</div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 p-5">
          <div className="text-xs font-semibold text-slate-500">Package</div>
          <div className="mt-2 grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-slate-600">Weight</div>
              <div className="text-sm font-semibold">{shipment.weight ?? '—'} {shipment.weight != null ? 'kg' : ''}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Package Qty</div>
              <div className="text-sm font-semibold">{shipment.package_quantity ?? '—'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-slate-600">Items Description</div>
              <div className="text-sm font-semibold whitespace-pre-wrap">{shipment.items_description || '—'}</div>
            </div>
          </div>

        </div>

        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-slate-200 p-5 h-[110px]">
            <div className="text-xs font-semibold text-slate-500">Sender Signature</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-5 h-[110px]">
            <div className="text-xs font-semibold text-slate-500">Receiver Signature</div>
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-500">
          Handle with care. Confirm receiver identity before release.
        </div>
        </div>
      </div>
    </div>
  );
}
