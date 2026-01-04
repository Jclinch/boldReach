'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

interface ShipmentRow {
	id: string;
	tracking_number?: string;
	trackingNumber?: string;
	origin_location?: string;
	destination?: string;
	delivery_location?: string;
	receiver_phone?: string | null;
	receiver_contact?: { phone?: string } | null;
	items_description?: string;
	itemsDescription?: string;
	description?: string;
	status?: string;
	progress_step?: string;
	shipment_date?: string;
	created_at?: string;
	createdAt?: string;
}

interface NormalizedShipment {
	id: string;
	trackingNumber: string;
	origin: string;
	destination: string;
	receiverPhone: string;
	description: string;
	status: string;
	progressStep: string;
	shipmentDate: string;
	createdAt: string;
}

function formatDateOnly(dateStr?: string) {
	if (!dateStr) return '';
	const d = new Date(dateStr);
	if (Number.isNaN(d.getTime())) return dateStr;
	return d.toISOString().slice(0, 10);
}

function getStatusLabel(status?: string) {
	const s = (status || '').toLowerCase();
	if (!s) return '';
	if (s === 'draft') return 'Draft';
	if (s === 'created' || s === 'pending') return 'Pending';
	if (s === 'confirmed') return 'Confirmed';
	if (s === 'in_transit') return 'In Transit';
	if (s === 'out_for_delivery') return 'Out for Delivery';
	if (s === 'delivered') return 'Delivered';
	if (s === 'cancelled') return 'Cancelled';
	if (s === 'returned') return 'Returned';
	return status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';
}

function getStatusStyle(status?: string): React.CSSProperties {
	const s = (status || '').toLowerCase();
	switch (s) {
		case 'draft':
			return { backgroundColor: '#9CA3AF', color: '#FFFFFF' }; // Gray
		case 'created':
		case 'pending':
			return { backgroundColor: '#FF8D28', color: '#FFFFFF' }; // Orange
		case 'confirmed':
			return { backgroundColor: '#8B5CF6', color: '#FFFFFF' }; // Purple
		case 'in_transit':
		case 'in transit':
			return { backgroundColor: '#00C8B3', color: '#FFFFFF' }; // Teal
		case 'out_for_delivery':
		case 'out for delivery':
			return { backgroundColor: '#3B82F6', color: '#FFFFFF' }; // Blue
		case 'delivered':
			return { backgroundColor: '#34C759', color: '#FFFFFF' }; // Green
		case 'cancelled':
			return { backgroundColor: '#EF4444', color: '#FFFFFF' }; // Red
		case 'returned':
			return { backgroundColor: '#F59E0B', color: '#FFFFFF' }; // Amber
		default:
			return { backgroundColor: '#6B7280', color: '#FFFFFF' }; // Default gray
	}
}

export default function AdminDashboard() {
	const [stats, setStats] = useState<{ totalShipments: number; activeShipments: number } | null>(null);
	const [loadingStats, setLoadingStats] = useState(true);
	const [shipments, setShipments] = useState<NormalizedShipment[]>([]);
	const [shipmentsLoading, setShipmentsLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | string>('all');

	const normalize = useCallback((row: ShipmentRow): NormalizedShipment => {
		const status = (row.status || '').toString().toLowerCase();

		let displayStatus: string;
		switch (status) {
			case 'draft':
				displayStatus = 'draft';
				break;
			case 'created':
				displayStatus = 'pending';
				break;
			case 'confirmed':
				displayStatus = 'confirmed';
				break;
			case 'in_transit':
				displayStatus = 'in_transit';
				break;
			case 'delivered':
				displayStatus = 'delivered';
				break;
			case 'cancelled':
				displayStatus = 'cancelled';
				break;
			case 'returned':
				displayStatus = 'returned';
				break;
			default:
				displayStatus = status || 'pending';
		}

		return {
			id: row.id,
			trackingNumber: (row.trackingNumber || row.tracking_number || '').toString(),
			origin: (row.origin_location || '').toString(),
			destination: (row.destination || row.delivery_location || '').toString(),
			receiverPhone: (row.receiver_phone || row.receiver_contact?.phone || '').toString(),
			description: (row.items_description || row.itemsDescription || row.description || '').toString(),
			status,
			progressStep: displayStatus,
			shipmentDate: (row.shipment_date || '').toString(),
			createdAt: (row.createdAt || row.created_at || '').toString(),
		};
	}, []);

	const filteredShipments = useMemo(() => {
		// Server already filters, but keep this for quick client-side safety.
		return shipments;
	}, [shipments]);

	const exportShipmentsToCsv = () => {
		const csvEscape = (value: unknown) => {
			const s = (value ?? '').toString();
			if (/[^\S\r\n]|[\n\r",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
			return s;
		};

		const rows = filteredShipments.map((s) => [
			csvEscape(s.trackingNumber),
			csvEscape(s.origin),
			csvEscape(s.destination),
			csvEscape(s.receiverPhone),
			csvEscape(s.description),
			csvEscape(getStatusLabel(s.progressStep)),
			csvEscape(formatDateOnly(s.shipmentDate || s.createdAt)),
		]);

		const csvHeaders = ['Tracking ID', 'Origin', 'Destination', 'Receiver Phone', 'Description', 'Status', 'Shipment Date'];
		const csv = [csvHeaders.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `shipments_${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const fetchStats = async () => {
		try {
			const res = await fetch('/api/admin/dashboard');
			if (!res.ok) return;
			const data = await res.json();
			setStats({
				totalShipments: data?.totalShipments || 0,
				activeShipments: data?.activeShipments || 0,
			});
		} finally {
			setLoadingStats(false);
		}
	};

	const fetchShipments = useCallback(
		async (showLoading = true) => {
			if (showLoading) setShipmentsLoading(true);
			try {
				const params = new URLSearchParams();
				params.set('all', '1');
				params.set('limit', '5000');
				if (search.trim()) params.set('search', search.trim());
				if (statusFilter !== 'all') params.set('status', statusFilter);

				const res = await fetch(`/api/admin/shipments?${params.toString()}`);
				if (!res.ok) {
					setShipments([]);
					return;
				}
				const data = await res.json();
				const rawList: ShipmentRow[] = data?.shipments || data || [];
				setShipments(rawList.map(normalize));
			} catch (e) {
				console.error('Failed to fetch admin shipments:', e);
				setShipments([]);
			} finally {
				if (showLoading) setShipmentsLoading(false);
			}
		},
		[normalize, search, statusFilter]
	);

	useEffect(() => {
		fetchStats();
	}, []);

	useEffect(() => {
		const t = setTimeout(() => fetchShipments(true), 250);
		return () => clearTimeout(t);
	}, [fetchShipments]);

	useEffect(() => {
		const interval = setInterval(() => {
			fetchShipments(false);
			fetchStats();
		}, 30000);
		return () => clearInterval(interval);
	}, [fetchShipments]);

	return (
		<div className="space-y-8">
			<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-[#1E293B] mb-2">Dashboard</h1>
					<p className="text-[#475569]">Shipment Overview</p>
				</div>
				<Button variant="secondary" size="small" onClick={exportShipmentsToCsv} disabled={shipmentsLoading || filteredShipments.length === 0}>
					Export CSV
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-[#64748B] text-sm">Total Shipments</p>
							<p className="text-3xl font-bold text-[#1E293B]">{loadingStats ? '—' : stats?.totalShipments ?? 0}</p>
						</div>
					</div>
				</Card>
				<Card>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-[#64748B] text-sm">Active Shipments</p>
							<p className="text-3xl font-bold text-[#1E293B]">{loadingStats ? '—' : stats?.activeShipments ?? 0}</p>
						</div>
					</div>
				</Card>
			</div>

			<Card>
				<div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
					<div>
						<h2 className="text-xl font-semibold text-[#1E293B]">Shipment Overview</h2>
						<p className="text-sm text-[#64748B]">All shipments across the platform</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
						<div className="w-full sm:w-72">
							<Input
								label="Search"
								placeholder="Tracking ID, destination, description"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
						<div className="w-full sm:w-48">
							<label className="block text-xs font-medium text-[#1E293B] mb-1.5">Status</label>
							<select
								className="w-full px-3 py-2.5 text-sm rounded-md border border-[#E2E8F0] bg-white text-[#1E293B]"
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
							>
								<option value="all">All</option>
								<option value="pending">Pending</option>
								<option value="confirmed">Confirmed</option>
								<option value="in_transit">In Transit</option>
								<option value="delivered">Delivered</option>
								<option value="cancelled">Cancelled</option>
								<option value="returned">Returned</option>
								<option value="draft">Draft</option>
							</select>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full border border-[#E2E8F0] rounded-lg overflow-hidden">
						<thead className="bg-[#F8FAFC]">
							<tr>
								<th className="px-6 py-4 text-left text-sm font-medium text-[#475569]">Tracking ID</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-[#475569]">Origin</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-[#475569]">Destination</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-[#475569] whitespace-nowrap">Receiver Phone</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-[#475569]">Description</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-[#475569]">Status</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-[#475569]">Shipment Date</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-[#E2E8F0]">
							{shipmentsLoading ? (
								<tr>
									<td className="px-6 py-6 text-sm text-[#64748B]" colSpan={7}>
										Loading shipments...
									</td>
								</tr>
							) : filteredShipments.length === 0 ? (
								<tr>
									<td className="px-6 py-6 text-sm text-[#64748B]" colSpan={7}>
										No shipments found.
									</td>
								</tr>
							) : (
								filteredShipments.map((s) => (
									<tr key={s.id} className="hover:bg-[#F8FAFC]">
										<td className="px-6 py-4 text-sm font-medium text-[#1E293B]">{s.trackingNumber || '—'}</td>
										<td className="px-6 py-4 text-sm text-[#475569]">{s.origin || '—'}</td>
										<td className="px-6 py-4 text-sm text-[#475569]">{s.destination || '—'}</td>
										<td className="px-6 py-4 text-sm text-[#475569] whitespace-nowrap">{s.receiverPhone || '—'}</td>
										<td className="px-6 py-4 text-sm text-[#475569]">{s.description || '—'}</td>
										<td className="px-6 py-4 text-sm">
											<span
												className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium"
												style={getStatusStyle(s.progressStep)}
											>
												{getStatusLabel(s.progressStep) || '—'}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-[#475569]">{formatDateOnly(s.shipmentDate || s.createdAt) || '—'}</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
}