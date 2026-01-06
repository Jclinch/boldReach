// app/superAdmin/users/page.tsx
// SuperAdmin User Management - app/page-path: /superAdmin/users

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

interface User {
	id: string;
	email: string;
	fullName: string;
	role: 'user' | 'admin' | 'super_admin';
	location?: string;
	createdAt: string;
	lastSignIn?: string;
	shipmentCount: number;
}

export default function AdminUsers() {
	const pathname = usePathname();
	const isSuperAdminArea = pathname.startsWith('/superAdmin');

	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string>('');
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const [locationOptions, setLocationOptions] = useState<string[]>([]);
	const [locationsLoading, setLocationsLoading] = useState(false);

	const fetchLocations = useCallback(async () => {
		setLocationsLoading(true);
		try {
			const res = await fetch('/api/locations');
			const data: unknown = await res.json().catch(() => ({}));
			if (!res.ok) {
				console.warn('Failed to load locations:', (data as { error?: string } | null)?.error);
				setLocationOptions([]);
				return;
			}
			const list = (data as { locations?: Array<{ name?: string }> } | null)?.locations || [];
			setLocationOptions(list.map((l) => (l?.name ?? '').toString()).filter(Boolean));
		} catch (e) {
			console.error('Failed to load locations:', e);
			setLocationOptions([]);
		} finally {
			setLocationsLoading(false);
		}
	}, []);

	const [createForm, setCreateForm] = useState({
		fullName: '',
		email: '',
		password: '',
		location: '',
	});
	const [creating, setCreating] = useState(false);
	const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

	const fetchUsers = useCallback(async () => {
		setLoadError('');
		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: '20',
				search: searchTerm,
			});

			const response = await fetch(`/api/admin/users?${params}`);
			const data: unknown = await response.json().catch(() => ({}));
			if (!response.ok) {
				setUsers([]);
				setTotalPages(1);
				const errMsg = (data as { error?: string } | null)?.error;
				setLoadError(errMsg || 'Failed to load users');
				return;
			}

			const payload = data as { users?: User[]; totalPages?: number } | null;
			setUsers(payload?.users || []);
			setTotalPages(Number(payload?.totalPages || 1));
		} catch (error) {
			console.error('Failed to fetch users:', error);
			setUsers([]);
			setTotalPages(1);
			setLoadError('Failed to load users');
		} finally {
			setLoading(false);
		}
	}, [currentPage, searchTerm]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	useEffect(() => {
		fetchLocations();
	}, [fetchLocations]);

	const updateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role: newRole }),
			});

			if (response.ok) {
				// Refresh the users list
				fetchUsers();
			} else {
				const data = await response.json().catch(() => ({}));
				setLoadError(data.error || 'Failed to update user role');
			}
		} catch (error) {
			console.error('Failed to update user role:', error);
			setLoadError('Failed to update user role');
		}
	};

	const updateUserLocation = async (userId: string, newLocation: string) => {
		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ location: newLocation }),
			});

			if (response.ok) {
				fetchUsers();
			} else {
				const data = await response.json().catch(() => ({}));
				setLoadError(data.error || 'Failed to update user location');
			}
		} catch (error) {
			console.error('Failed to update user location:', error);
			setLoadError('Failed to update user location');
		}
	};

	const handleCreateUser = async () => {
		setCreateErrors({});

		const errs: Record<string, string> = {};
		if (!createForm.fullName.trim()) errs.fullName = 'Full name is required';
		if (!createForm.email.trim()) errs.email = 'Email is required';
		if (!createForm.password.trim() || createForm.password.trim().length < 8) {
			errs.password = 'Password must be at least 8 characters';
		}
		if (!createForm.location.trim()) errs.location = 'Location is required';

		if (Object.keys(errs).length > 0) {
			setCreateErrors(errs);
			return;
		}

		setCreating(true);
		try {
			const res = await fetch('/api/admin/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fullName: createForm.fullName,
					email: createForm.email,
					password: createForm.password,
					location: createForm.location,
				}),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setCreateErrors({ submit: data.error || 'Failed to create user' });
				return;
			}

			setCreateForm({ fullName: '', email: '', password: '', location: '' });
			setCurrentPage(1);
			fetchUsers();
		} finally {
			setCreating(false);
		}
	};

	const formatDate = (date: string) => {
		try {
			return new Date(date).toLocaleString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				timeZoneName: 'short',
			});
		} catch {
			return date;
		}
	};

	if (loading) {
		return (
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold text-[#1E293B] mb-2">User Management</h1>
					<p className="text-[#475569]">Loading users...</p>
				</div>
				<Card>
					<div className="animate-pulse space-y-4">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="h-16 bg-gray-200 rounded"></div>
						))}
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-[#1E293B] mb-2">User Management</h1>
				<p className="text-[#475569]">Manage user accounts and permissions</p>
				{loadError ? <p className="mt-2 text-sm text-red-600">{loadError}</p> : null}
			</div>

			{/* Create User (SuperAdmin only) */}
			<Card>
				<h2 className="text-lg font-semibold text-[#1E293B] mb-4">Create User Account</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-[#1E293B] mb-2">Full Name</label>
						<Input
							type="text"
							placeholder="e.g., Jane Doe"
							value={createForm.fullName}
							onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))}
						/>
						{createErrors.fullName ? <p className="mt-1 text-xs text-red-600">{createErrors.fullName}</p> : null}
					</div>

					<div>
						<label className="block text-sm font-medium text-[#1E293B] mb-2">Email</label>
						<Input
							type="email"
							placeholder="e.g., jane@example.com"
							value={createForm.email}
							onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
						/>
						{createErrors.email ? <p className="mt-1 text-xs text-red-600">{createErrors.email}</p> : null}
					</div>

					<div>
						<label className="block text-sm font-medium text-[#1E293B] mb-2">Temporary Password</label>
						<Input
							type="password"
							placeholder="Minimum 8 characters"
							value={createForm.password}
							onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
						/>
						{createErrors.password ? <p className="mt-1 text-xs text-red-600">{createErrors.password}</p> : null}
					</div>

					<div>
						<label className="block text-sm font-medium text-[#1E293B] mb-2">Location</label>
						<select
							className="w-full text-sm border border-[#E2E8F0] rounded px-3 py-2 bg-white"
							value={createForm.location}
							onChange={(e) => setCreateForm((p) => ({ ...p, location: e.target.value }))}
						>
							<option value="">Select location</option>
							{locationOptions.map((loc) => (
								<option key={loc} value={loc}>
									{loc}
								</option>
							))}
						</select>
						{locationsLoading ? <p className="mt-1 text-xs text-[#94A3B8]">Loading locations…</p> : null}
						{createErrors.location ? <p className="mt-1 text-xs text-red-600">{createErrors.location}</p> : null}
					</div>
				</div>

				{createErrors.submit ? <p className="mt-3 text-sm text-red-600">{createErrors.submit}</p> : null}

				<div className="mt-4 flex justify-end">
					<Button onClick={handleCreateUser} disabled={creating}>
						{creating ? 'Creating...' : 'Create User'}
					</Button>
				</div>
			</Card>

			{/* Search */}
			<Card>
				<div className="flex gap-4 items-end">
					<div className="flex-1">
						<label className="block text-sm font-medium text-[#1E293B] mb-2">Search by Email or Name</label>
						<Input
							type="text"
							placeholder="Enter email or name..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Button
						variant="secondary"
						onClick={() => {
							setSearchTerm('');
							setCurrentPage(1);
						}}
					>
						Clear Search
					</Button>
				</div>
			</Card>

			{/* Users Table */}
			<Card>
				{/* Mobile cards */}
				<div className="space-y-3 sm:hidden">
					{users.length === 0 ? (
						<div className="text-sm text-[#94A3B8]">No users found.</div>
					) : (
						users.map((user) => (
							<div key={user.id} className="rounded-lg border border-[#E2E8F0] bg-white p-4">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="font-medium text-[#1E293B] wrap-break-word">{user.fullName}</p>
										<p className="text-sm text-[#94A3B8] wrap-break-word">{user.email}</p>
									</div>
									<Badge variant={user.role === 'admin' ? 'success' : 'default'}>
										{user.role === 'super_admin' ? 'SuperAdmin' : user.role === 'admin' ? 'Admin' : 'User'}
									</Badge>
								</div>

								<div className="mt-3 grid grid-cols-2 gap-3">
									<div>
										<p className="text-xs text-[#94A3B8]">Shipments</p>
										<p className="text-sm text-[#1E293B]">{user.shipmentCount}</p>
									</div>
									<div>
										<p className="text-xs text-[#94A3B8]">Last Sign In</p>
										<p className="text-sm text-[#1E293B] wrap-break-word">{user.lastSignIn ? formatDate(user.lastSignIn) : 'Never'}</p>
									</div>
									<div className="col-span-2">
										<p className="text-xs text-[#94A3B8]">Location</p>
										<select
											className="mt-1 w-full text-sm border border-[#E2E8F0] rounded px-3 py-2 bg-white"
											value={user.location || ''}
											disabled={user.role === 'super_admin'}
											onChange={(e) => updateUserLocation(user.id, e.target.value)}
										>
											<option value="">Select location</option>
											{locationOptions.map((loc) => (
												<option key={loc} value={loc}>
													{loc}
												</option>
											))}
										</select>
									</div>
									<div className="col-span-2">
										<p className="text-xs text-[#94A3B8]">Created</p>
										<p className="text-sm text-[#1E293B] wrap-break-word">{formatDate(user.createdAt)}</p>
									</div>
								</div>

								<div className="mt-4">
									<label className="block text-xs font-medium text-[#1E293B] mb-2">Role</label>
									<select
										className="w-full text-sm border border-[#E2E8F0] rounded px-3 py-2"
										value={user.role}
										disabled={user.role === 'super_admin'}
										onChange={(e) => updateUserRole(user.id, e.target.value as 'user' | 'admin' | 'super_admin')}
									>
										<option value="user">User</option>
										{isSuperAdminArea ? <option value="admin">Admin</option> : null}
										{isSuperAdminArea ? <option value="super_admin">SuperAdmin</option> : null}
									</select>
								</div>
							</div>
						))
					)}
				</div>

				{/* Desktop table */}
				<div className="hidden sm:block overflow-x-auto">
					<table className="w-full min-w-[820px] text-xs sm:text-sm">
						<thead>
							<tr className="border-b border-[#E2E8F0]">
								<th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-[#1E293B]">User</th>
								<th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-[#1E293B]">Role</th>
								<th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-[#1E293B]">Location</th>
								<th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-[#1E293B]">Shipments</th>
								<th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-[#1E293B]">Last Sign In</th>
								<th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-[#1E293B]">Created</th>
								<th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-[#1E293B]">Actions</th>
							</tr>
						</thead>
						<tbody>
							{users.length === 0 ? (
								<tr>
									<td className="py-6 px-4 text-sm text-[#94A3B8]" colSpan={7}>
										No users found.
									</td>
								</tr>
							) : (
								users.map((user) => (
									<tr key={user.id} className="border-b border-[#E2E8F0]">
										<td className="py-2 sm:py-3 px-2 sm:px-4">
											<div>
												<p className="font-medium text-[#1E293B] wrap-break-word">{user.fullName}</p>
												<p className="text-xs sm:text-sm text-[#94A3B8] wrap-break-word">{user.email}</p>
											</div>
										</td>
										<td className="py-2 sm:py-3 px-2 sm:px-4">
											<Badge variant={user.role === 'admin' ? 'success' : 'default'}>
												{user.role === 'super_admin' ? 'SuperAdmin' : user.role === 'admin' ? 'Admin' : 'User'}
											</Badge>
										</td>
										<td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[#475569]">
											<select
												className="w-full text-xs sm:text-sm border border-[#E2E8F0] rounded px-2 py-1 bg-white"
												value={user.location || ''}
												disabled={user.role === 'super_admin'}
												onChange={(e) => updateUserLocation(user.id, e.target.value)}
											>
												<option value="">Select location</option>
												{locationOptions.map((loc) => (
													<option key={loc} value={loc}>
														{loc}
													</option>
												))}
											</select>
										</td>
										<td className="py-2 sm:py-3 px-2 sm:px-4">{user.shipmentCount}</td>
										<td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[#94A3B8]">
											{user.lastSignIn ? formatDate(user.lastSignIn) : 'Never'}
										</td>
										<td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[#94A3B8]">{formatDate(user.createdAt)}</td>
										<td className="py-2 sm:py-3 px-2 sm:px-4">
											<select
												className="text-xs sm:text-sm border border-[#E2E8F0] rounded px-2 py-1"
												value={user.role}
												disabled={user.role === 'super_admin'}
												onChange={(e) => updateUserRole(user.id, e.target.value as 'user' | 'admin' | 'super_admin')}
											>
												<option value="user">User</option>
												{isSuperAdminArea ? <option value="admin">Admin</option> : null}
												{isSuperAdminArea ? <option value="super_admin">SuperAdmin</option> : null}
											</select>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center items-center gap-2 mt-6">
						<Button
							variant="secondary"
							size="small"
							disabled={currentPage === 1}
							onClick={() => setCurrentPage(currentPage - 1)}
						>
							Previous
						</Button>
						<span className="text-sm text-[#94A3B8]">Page {currentPage} of {totalPages}</span>
						<Button
							variant="secondary"
							size="small"
							disabled={currentPage === totalPages}
							onClick={() => setCurrentPage(currentPage + 1)}
						>
							Next
						</Button>
					</div>
				)}
			</Card>
		</div>
	);
}
