// // ============================================
// // FILE: app/dashboard/new-shipment/page.tsx
// // Path: /dashboard/new-shipment
// // Pixel Perfect New Shipment Page matching Figma design
// // ============================================

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DashboardLayout } from '@/components/DashboardLayout';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

const STORAGE_BUCKET = 'package-images'; // Supabase storage bucket for shipment images
const UPLOAD_FOLDER = 'package-images';

export default function NewShipmentPage() {
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const LOCATION_OPTIONS = [
  "ASC-M-Darigo Communication 03 LTD-Lafia",
  "ASC-M-Carosammy Concept Ltd-Benue",
  "ASC-M-Crescita Global Resources Ltd-Adamawa",
  "ASC-M-Don-Yellow Tech-Borno",
  "ASC-M-Midas touch-Jos",
  "ASC-M-Midas Touch-Kaduna",
  "ASC-M-Zikniks-Maiduguri-Maiduguri",
  "ASC-M-Zikniks-Minna-Minna",
  "ASC-M-Zikniks-Suleja",
  "ASRP ELOHIM GADGETS-Abuja",
  "OSC-Carlcare-Abuja",
  "OSC-Carlcare-Kano",
  "CP-Abdul Hisbah Communication LTD-Damaturu",
  "CP-Dynasteia Gwagwalada-Abuja",
  "CP-Easy Way Comm (Anyigba)-Kogi",
  "Cp-Jibo Ventures-Zamfara",
  "CP-Excel phones idah-Kogi",
  "ASC-M-Jufel-Tech Communications Ltd-Nasarawa",
  "ASC-M-Magic Brother-Abuja",
  "CP-May Royal Communication-Otukpo",
  "ASC-M-Midas Touch Sokoto-Sokoto",
  "CP-MOSIE SOLID HUB-Kuje",
  "CP-Ndubest-Benue",
  "ASC-M-Reedlim Global Enterprise-Bauchi",
  "ASC-M-Reedlim Global Enterprise-Gombe",
  "ASC-M-SmartPhone Global-Katsina",
  "ASC-M-Smartphone Global Sensible-Duste",
  "ASC-M-Smartphone Global Sensible-Funtua",
  "ASC-M-Switrat limited-Mubi",
  "ASC-M-Ustaz Exclusive Store-Jalingo",
  "ASC-M-Yisab Nig. Ltd. (Lokoja)-Kogi"
];

  const [formData, setFormData] = useState({
    senderName: '',
    receiverName: '',
    receiverPhone: '',
    itemsDescription: '',
    weight: '',
    originLocation: '',
    destination: '',
    shipmentDate: '', // NEW FIELD
  });

  const normalizePhone = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';

    // Only keep digits.
    let normalized = trimmed.replace(/\D/g, '');

    // If user entered country code format (e.g. +2348012345678 or 2348012345678)
    // convert to local 11-digit format (e.g. 08012345678).
    if (normalized.startsWith('234') && normalized.length === 13) {
      normalized = '0' + normalized.slice(3);
    }

    return normalized;
  };

  const isValidPhone = (value: string) => {
    const v = normalizePhone(value);
    // Local format only: exactly 11 digits (e.g. 08012345678)
    return /^\d{11}$/.test(v);
  };

  const [packageImage, setPackageImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size must be less than 1MB' }));
        return;
      }
      setPackageImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const uploadImageToStorage = async (userId: string, file: File) => {
    // Compose a unique path: {folder}/{userId}/{timestamp}_{filename}
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, '_');
    const path = `${UPLOAD_FOLDER}/${userId}/${timestamp}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      return { error: uploadError.message };
    }

    // Try to get a public URL. If your bucket is private, consider createSignedUrl server-side.
    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const publicUrl = publicUrlData?.publicUrl ?? null;

    return {
      bucket: STORAGE_BUCKET,
      path,
      publicUrl,
    };
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const normalizedReceiverPhone = normalizePhone(formData.receiverPhone);

      // Basic client-side validation
      const newErrors: Record<string, string> = {};
      if (!formData.senderName.trim()) newErrors.senderName = 'Sender name is required';
      if (!formData.receiverName.trim()) newErrors.receiverName = 'Receiver name is required';
      if (!formData.receiverPhone.trim()) newErrors.receiverPhone = 'Receiver phone number is required';
      else if (!isValidPhone(formData.receiverPhone)) newErrors.receiverPhone = 'Enter a valid 11-digit phone number (e.g., 08012345678)';
      if (!formData.itemsDescription.trim()) newErrors.itemsDescription = 'Items description is required';
      if (!formData.weight.toString().trim()) newErrors.weight = 'Weight is required';
      if (!formData.originLocation.trim()) newErrors.originLocation = 'Origin location is required';
      if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
      if (!formData.shipmentDate.trim()) newErrors.shipmentDate = 'Date Sent is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Get currently logged in user from session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (sessionError || !user) {
        toast.error('You must be signed in to create a shipment.');
        setIsLoading(false);
        return;
      }

      // If there's an image, upload it first
      let imagePayload: { bucket?: string; path?: string; publicUrl?: string } = {};
      if (packageImage) {
        const uploaded: { error?: string; bucket?: string; path?: string; publicUrl?: string } = await uploadImageToStorage(user.id, packageImage);
        if (uploaded.error) { // The 'uploaded' object already has an 'error' property of type string | undefined
          setErrors({ submit: uploaded.error || 'Image upload failed' });
          setIsLoading(false);
          return;
        }
        imagePayload = uploaded;
      }

      // Prepare shipment record
      const shipmentInsert: Record<string, unknown> = {
        user_id: user.id,
        sender_name: formData.senderName,
        receiver_name: formData.receiverName,
        receiver_contact: {
          phone: normalizedReceiverPhone,
        },
        receiver_phone: normalizedReceiverPhone,
        items_description: formData.itemsDescription,
        weight: formData.weight ? parseFloat(String(formData.weight)) : null,
        origin_location: formData.originLocation,
        destination: formData.destination,
        shipment_date: formData.shipmentDate, // write manual date
        metadata: {},
      };

      if (imagePayload.bucket && imagePayload.path) {
        shipmentInsert.package_image_bucket = imagePayload.bucket;
        shipmentInsert.package_image_path = imagePayload.path;
        shipmentInsert.package_image_url = imagePayload.publicUrl ?? null;
      }

      // Insert into shipments table (RLS: user_id must match auth.uid())
      const { data: insertData, error: insertError } = await supabase
        .from('shipments')
        .insert([shipmentInsert])
        .select()
        .single();

      if (insertError) {
        const msg = insertError.message || 'Failed to create shipment';

        if (msg.includes('shipments_receiver_phone_format')) {
          setErrors((prev) => ({
            ...prev,
            receiverPhone: `Invalid phone number. Use 11 digits (e.g., 08012345678). Your number becomes: ${normalizedReceiverPhone}`,
          }));
          toast.error('Invalid receiver phone number');
        } else {
          toast.error(msg);
        }
        setIsLoading(false);
        return;
      }

      const shipmentId = insertData?.id;
      const trackingNumber = insertData?.tracking_number ?? '—';

      // Optionally, create a shipment_attachments record referencing this shipment
      if (imagePayload.bucket && imagePayload.path && shipmentId) {
        await supabase.from('shipment_attachments').insert([
          {
            shipment_id: shipmentId,
            bucket: imagePayload.bucket,
            path: imagePayload.path,
            url: imagePayload.publicUrl ?? null,
            filename: packageImage?.name ?? null,
            size_bytes: packageImage?.size ?? null,
            mime_type: packageImage?.type ?? null,
          },
        ]);
        // we don't treat attachment insert failure as fatal here, but you could
      }

      // Show success toast
      toast.success(`Shipment created successfully! Tracking #: ${trackingNumber}`);
      
      // Reset form
      setFormData({
        senderName: '',
        receiverName: '',
        receiverPhone: '',
        itemsDescription: '',
        weight: '',
        originLocation: '',
        destination: '',
        shipmentDate: '',
      });
      setPackageImage(null);
      setImagePreview('');
    } catch (err: unknown) {
      console.error('create shipment error', err);
      const message = err instanceof Error ? err.message : undefined;
      toast.error(message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    Boolean(formData.senderName.trim()) &&
    Boolean(formData.receiverName.trim()) &&
    Boolean(formData.receiverPhone.trim()) &&
    Boolean(formData.itemsDescription.trim()) &&
    Boolean(String(formData.weight).trim()) &&
    Boolean(formData.originLocation.trim()) &&
    Boolean(formData.destination.trim());

  return (
    <DashboardLayout>
      {/* Global toaster handled in RootLayout */}

      {/* Content container: width matches screenshot, centered within layout */}
      <div className=" mx-auto pt-6 ">
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold text-slate-800 mb-1">New Shipment Input</h2>
          <p className="text-[13px] text-slate-500">Create a new shipment request for BOLDREACH logistics</p>
        </div>

       

        <div className="">
          <div className="">
            {/* Sender and Receiver Names */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Sender&apos;s Name</label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  className={`w-full px-4 py-3 text-[14px] border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent transition-all ${
                    errors.senderName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.senderName && <p className="mt-1.5 text-xs text-red-600">{errors.senderName}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Receiver&apos;s Name</label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  className={`w-full px-4 py-3 text-[14px] border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent transition-all ${
                    errors.receiverName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.receiverName && <p className="mt-1.5 text-xs text-red-600">{errors.receiverName}</p>}
              </div>
            </div>

            {/* Receiver Phone */}
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-gray-700 mb-2">Receiver&apos;s Phone Number</label>
              <input
                type="tel"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={(e) => {
                  // live-normalize lightly while typing (don’t block input)
                  setFormData((prev) => ({ ...prev, receiverPhone: e.target.value }));
                }}
                onBlur={() => {
                  setFormData((prev) => ({ ...prev, receiverPhone: normalizePhone(prev.receiverPhone) }));
                }}
                placeholder="e.g., 08012345678"
                inputMode="tel"
                autoComplete="tel"
                className={`w-full px-4 py-3 text-[14px] border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent transition-all ${
                  errors.receiverPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.receiverPhone && <p className="mt-1.5 text-xs text-red-600">{errors.receiverPhone}</p>}
            </div>

            {/* Items Description, Weight, Tracking ID */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Items Description</label>
                <textarea
                  name="itemsDescription"
                  value={formData.itemsDescription}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 cartons of Samsung S21 screens"
                  rows={4}
                  className={`w-full px-4 py-3 text-[14px] border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent resize-none transition-all ${
                    errors.itemsDescription ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.itemsDescription && <p className="mt-1.5 text-xs text-red-600">{errors.itemsDescription}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 25.5"
                  step="0.1"
                  min="0"
                  className={`w-full px-4 py-3 text-[14px] border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent transition-all ${
                    errors.weight ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.weight && <p className="mt-1.5 text-xs text-red-600">{errors.weight}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Tracking ID</label>
                <input
                  type="text"
                  value="Auto-generated (BDL-XXX-XXXX)"
                  disabled
                  readOnly
                  className="w-full px-4 py-3 text-[14px] border rounded-md bg-gray-50 text-gray-500 border-gray-300"
                />
                <p className="mt-1.5 text-xs text-gray-500">Generated automatically when you create the shipment.</p>
              </div>
            </div>

            {/* Package Image Upload */}
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-gray-700 mb-2">Package Image (Max 1mb)</label>

              <div className="flex items-start gap-4">
                {/* choose file pill + filename */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="package-image"
                  />
                  <label htmlFor="package-image" className="inline-flex items-center cursor-pointer">
                    <span className="inline-block px-4 py-2 bg-[#FFF4EE] text-[#F97316] rounded-full text-[14px] font-medium shadow-sm">
                      Choose File
                    </span>
                  </label>
                  <div className="text-[13px] text-gray-600">
                    <div className="inline-block align-middle">
                      <span className="text-sm text-slate-600">{packageImage ? packageImage.name : ''}</span>
                      <div className="mt-1">
                        {packageImage ? (
                          <span className="text-[12px] text-emerald-600">Selected file: {packageImage.name}</span>
                        ) : (
                          <span className="text-[12px] text-gray-400">Click to upload or drag and drop</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview box (if provided) */}
                <div className="flex-1">
                  {imagePreview ? (
                    <div className="relative w-full max-w-xs">
                      <Image
                        src={imagePreview}
                        alt="Package preview"
                        width={400}
                        height={200}
                        className="w-full h-28 object-cover rounded-md border border-gray-100"
                      />
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setPackageImage(null);
                          setImagePreview('');
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-xs h-28 flex items-center justify-center rounded-md border border-dashed border-gray-200 bg-white text-[12px] text-gray-300">
                      <span>Preview will appear here</span>
                    </div>
                  )}
                </div>
              </div>

              {errors.image && <p className="mt-2 text-xs text-red-600">{errors.image}</p>}
            </div>

            {/* Date Sent */}
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-gray-700 mb-2">Date Sent</label>
              <input
                type="date"
                name="shipmentDate"
                value={formData.shipmentDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 text-[14px] border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent transition-all ${
                  errors.shipmentDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.shipmentDate && <p className="mt-1.5 text-xs text-red-600">{errors.shipmentDate}</p>}
            </div>

            {/* Origin Location and Destination */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Origin Location</label>
                <select
                  name="originLocation"
                  value={formData.originLocation}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-[14px] border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent transition-all ${
                    errors.originLocation ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Origin</option>
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {errors.originLocation && <p className="mt-1.5 text-xs text-red-600">{errors.originLocation}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Destination</label>
                <select
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-[14px] border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent transition-all ${
                    errors.destination ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Destination</option>
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {errors.destination && <p className="mt-1.5 text-xs text-red-600">{errors.destination}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className={`w-full font-semibold py-3.5 rounded-md transition-all duration-200 shadow-sm text-[15px] ${
                  isFormValid && !isLoading
                    ? 'bg-[#F97316] text-white hover:bg-orange-700'
                    : 'bg-[#FFD9BC] text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Shipment...
                  </span>
                ) : (
                  'Create Shipment'
                )}
              </button>
            </div>
            {/* Submit errors are shown via toast */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}