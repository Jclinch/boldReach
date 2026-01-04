// app/superAdmin/analytics/page.tsx
// SuperAdmin Analytics - app/page-path: /superAdmin/analytics

'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/Card';

interface AnalyticsData {
	shipmentTrends: Array<{
		date: string;
		count: number;
	}>;
	statusDistribution: Array<{
		status: string;
		count: number;
	}>;
	topRoutes: Array<{
		route: string;
		count: number;
	}>;
}

export default function AdminAnalytics() {
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		fetchAnalytics();
	}, []);

	const fetchAnalytics = async () => {
		try {
			const response = await fetch('/api/admin/analytics');
			if (response.ok) {
				const data = await response.json();
				setAnalytics(data);
				setLoadError(null);
			} else {
				const maybeJson = await response.json().catch(() => null);
				setLoadError(maybeJson?.error || `Failed to load analytics (${response.status})`);
			}
		} catch (error) {
			console.error('Failed to fetch analytics:', error);
			setLoadError('Failed to fetch analytics');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold text-[#1E293B] mb-2">Analytics</h1>
					<p className="text-[#475569]">Loading analytics data...</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{[...Array(3)].map((_, i) => (
						<Card key={i}>
							<div className="animate-pulse">
								<div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
								<div className="space-y-2">
									{[...Array(4)].map((_, j) => (
										<div key={j} className="h-3 bg-gray-200 rounded"></div>
									))}
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-[#1E293B] mb-2">Analytics</h1>
				<p className="text-[#475569]">Platform performance and insights</p>
			</div>

			{loadError ? (
				<Card>
					<p className="text-sm text-red-600">{loadError}</p>
				</Card>
			) : null}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Status Distribution */}
				<Card>
					<h2 className="text-xl font-semibold text-[#1E293B] mb-6">Shipment Status Distribution</h2>
					<div className="space-y-4">
						{analytics?.statusDistribution?.map((item) => (
							<div key={item.status} className="flex items-center justify-between">
								<span className="text-sm text-[#475569] capitalize">{item.status.replace('_', ' ')}</span>
								<span className="font-medium text-[#1E293B]">{item.count}</span>
							</div>
						)) || <p className="text-[#94A3B8] text-center py-4">No data available</p>}
					</div>
				</Card>

				{/* Top Routes */}
				<Card>
					<h2 className="text-xl font-semibold text-[#1E293B] mb-6">Popular Routes</h2>
					<div className="space-y-4">
						{analytics?.topRoutes?.map((route, index) => (
							<div key={index} className="flex items-center justify-between">
								<span className="text-sm text-[#475569]">{route.route}</span>
								<span className="font-medium text-[#1E293B]">{route.count} shipments</span>
							</div>
						)) || <p className="text-[#94A3B8] text-center py-4">No data available</p>}
					</div>
				</Card>

				{/* Shipment Trends */}
				<Card className="md:col-span-2">
					<h2 className="text-xl font-semibold text-[#1E293B] mb-6">Shipment Trends (Last 7 Days)</h2>
					<div className="space-y-4">
						{analytics?.shipmentTrends?.map((trend) => (
							<div key={trend.date} className="flex items-center justify-between">
								<span className="text-sm text-[#475569]">{new Date(trend.date).toLocaleDateString()}</span>
								<div className="flex items-center gap-2">
									<div className="w-24 bg-gray-200 rounded-full h-2">
										<div
											className="bg-[#2563EB] h-2 rounded-full"
											style={{ width: `${Math.min((trend.count / 10) * 100, 100)}%` }}
										></div>
									</div>
									<span className="font-medium text-[#1E293B] w-8 text-right">{trend.count}</span>
								</div>
							</div>
						)) || <p className="text-[#94A3B8] text-center py-4">No data available</p>}
					</div>
				</Card>
			</div>
		</div>
	);
}
