'use client';

import React, { useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	ColumnDef,
} from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '../../../types/user';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import UserProfileModal from '@/app/(pages)/user-management/components/view-profile-modal';
import {
	Search,
	Users,
	MoreHorizontal,
	Eye,
	Ban,
	Pause,
} from 'lucide-react';

const fetchUsers = async (): Promise<User[]> => {
	const res = await axios.get('/api/users/get');
	return res.data;
};

const PAGE_SIZE = 10;

const UserTable: React.FC = () => {
	const queryClient = useQueryClient();
	const {
		data = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['users'],
		queryFn: fetchUsers,
	});

	const [pageIndex, setPageIndex] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleViewProfile = (user: User) => {
		setSelectedUser(user);
		setIsModalOpen(true);
	};

	// Filter data based on search and filters
	const filteredData = useMemo(() => {
		return data.filter((user) => {
			const matchesSearch =
				`${user.firstName} ${user.lastName}`
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesRole = roleFilter === '' || user.role === roleFilter;
			const matchesStatus =
				statusFilter === '' || (user.status || 'ACTIVE') === statusFilter;

			return matchesSearch && matchesRole && matchesStatus;
		});
	}, [data, searchTerm, roleFilter, statusFilter]);

	const pageCount = Math.ceil(filteredData.length / PAGE_SIZE);

	const pagedData = useMemo(() => {
		const start = pageIndex * PAGE_SIZE;
		return filteredData.slice(start, start + PAGE_SIZE);
	}, [filteredData, pageIndex]);

	const handleStatusChange = useCallback(
		async (id: string, status: 'SUSPENDED' | 'BANNED') => {
			try {
				await axios.put('/api/users/update', { id, status });
				queryClient.invalidateQueries({ queryKey: ['users'] });
			} catch (error) {
				console.error('Failed to update status', error);
				alert('Error updating user status.');
			}
		},
		[queryClient]
	);

	const getStatusColor = (status: string | undefined) => {
		switch (status) {
			case 'ACTIVE':
			case undefined:
				return 'bg-green-100 text-green-700 border-green-200';
			case 'SUSPENDED':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			case 'BANNED':
				return 'bg-red-100 text-red-700 border-red-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case 'BUYER':
				return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'SELLER':
				return 'bg-orange-100 text-orange-700 border-orange-200';
			case 'ADMIN':
				return 'bg-purple-100 text-purple-700 border-purple-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	const columns = useMemo<ColumnDef<User>[]>(
		() => [
			{
				header: 'User',
				accessorFn: (row) =>
					`${row.firstName} ${row.middleName ?? ''} ${row.lastName} ${row.suffix ?? ''
						}`.trim(),
				cell: (info) => {
					const user = info.row.original;
					return (
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
								{user.firstName[0]}
								{user.lastName[0]}
							</div>
							<div>
								<div className="font-semibold text-gray-900">
									{info.getValue() as string}
								</div>
								<div className="text-sm text-gray-500">{user.email}</div>
							</div>
						</div>
					);
				},
			},
			{
				header: 'Role',
				accessorKey: 'role',
				cell: (info) => (
					<span
						className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
							info.getValue() as string
						)}`}
					>
						{info.getValue() as string}
					</span>
				),
			},
			{
				header: 'Status',
				accessorKey: 'status',
				cell: (info) => {
					const status = info.getValue() as string | undefined;
					const displayStatus = status || 'ACTIVE';
					return (
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
								status
							)}`}
						>
							{displayStatus}
						</span>
					);
				},
			},
			{
				header: 'Registration Date',
				accessorKey: 'createdAt',
				cell: (info) => {
					const date = new Date(info.getValue() as string);
					return (
						<div className="text-sm text-gray-700">
							{date.toLocaleDateString(undefined, {
								year: 'numeric',
								month: 'short',
								day: 'numeric',
							})}
						</div>
					);
				},
			},
			{
				header: 'Contact',
				accessorKey: 'contactNumber',
				cell: (info) => (
					<div className="text-sm text-gray-700">
						{(info.getValue() as string) || 'Not provided'}
					</div>
				),
			},
			{
				id: 'actions',
				header: 'Actions',
				cell: (info) => {
					const user = info.row.original;
					return (
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
								aria-label={`Actions for ${user.firstName}`}
							>
								<MoreHorizontal size={16} className="text-gray-600" />
							</DropdownMenu.Trigger>

							<DropdownMenu.Portal>
								<DropdownMenu.Content
									className="bg-white rounded-lg shadow-lg border p-1 min-w-[160px] z-50"
									sideOffset={5}
								>
									<DropdownMenu.Item
										className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 cursor-pointer text-gray-700 text-sm"
										onSelect={() => handleViewProfile(user)}
									>
										<Eye size={16} />
										View Profile
									</DropdownMenu.Item>

									<DropdownMenu.Item
										className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 cursor-pointer text-red-600 text-sm"
										onSelect={() => handleStatusChange(user.id, 'BANNED')}
									>
										<Ban size={16} />
										Ban User
									</DropdownMenu.Item>

									<DropdownMenu.Item
										className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-yellow-50 cursor-pointer text-yellow-600 text-sm"
										onSelect={() => handleStatusChange(user.id, 'SUSPENDED')}
									>
										<Pause size={16} />
										Suspend User
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Portal>
						</DropdownMenu.Root>
					);
				},
			},
		],
		[handleStatusChange]
	);

	const table = useReactTable({
		data: pagedData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (isLoading) {
		return (
			<div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
				<div className="flex items-center justify-center space-x-3">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
					<span className="text-gray-600">Loading users...</span>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-2xl p-8">
				<div className="text-red-600 text-center">
					<Users className="mx-auto mb-2" size={48} />
					<p className="font-semibold">Failed to load users</p>
					<p className="text-sm">Please try refreshing the page</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-4 py-3">
				<div className="flex items-center justify-between">
					<h1 className="text-lg font-bold text-gray-900">User Management</h1>
					<div className="text-sm text-gray-500">
						{filteredData.length} users found
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
				<div className="flex flex-col sm:flex-row gap-3">
					{/* Search */}
					<div className="flex-1">
						<div className="relative">
							<Search
								className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
								size={20}
							/>
							<input
								type="text"
								placeholder="Search by name or email..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setPageIndex(0);
								}}
								className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white"
							/>
						</div>
					</div>

					{/* Role Filter */}
					<div className="min-w-[140px]">
						<select
							value={roleFilter}
							onChange={(e) => {
								setRoleFilter(e.target.value);
								setPageIndex(0);
							}}
							className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white"
						>
							<option value="">All Roles</option>
							<option value="BUYER">Buyers</option>
							<option value="SELLER">Sellers</option>
							<option value="ADMIN">Admins</option>
						</select>
					</div>

					{/* Status Filter */}
					<div className="min-w-[140px]">
						<select
							value={statusFilter}
							onChange={(e) => {
								setStatusFilter(e.target.value);
								setPageIndex(0);
							}}
							className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white"
						>
							<option value="">All Status</option>
							<option value="ACTIVE">Active</option>
							<option value="SUSPENDED">Suspended</option>
							<option value="BANNED">Banned</option>
						</select>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
									>
										{header.isPlaceholder
											? null
											: flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{table.getRowModel().rows.map((row, index) => (
							<tr
								key={row.id}
								className={`hover:bg-green-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
									}`}
							>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="px-4 py-2 text-sm whitespace-nowrap">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Empty State */}
			{filteredData.length === 0 && (
				<div className="text-center py-12 bg-gray-50">
					<Users className="mx-auto mb-4 text-gray-400" size={48} />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						No users found
					</h3>
					<p className="text-gray-500">
						Try adjusting your search or filter criteria.
					</p>
				</div>
			)}

			{/* Pagination */}
			{pageCount > 1 && (
				<div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
					<div className="text-sm text-gray-700">
						Showing {pageIndex * PAGE_SIZE + 1} to{' '}
						{Math.min((pageIndex + 1) * PAGE_SIZE, filteredData.length)} of{' '}
						{filteredData.length} users
					</div>

					<div className="flex items-center space-x-2">
						<button
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
							onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
							disabled={pageIndex === 0}
						>
							Previous
						</button>

						<div className="flex space-x-1">
							{Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
								const page =
									pageCount <= 5
										? i
										: pageIndex < 3
											? i
											: pageIndex >= pageCount - 3
												? pageCount - 5 + i
												: pageIndex - 2 + i;

								return (
									<button
										key={page}
										className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${page === pageIndex
											? 'bg-green-600 text-white shadow-md'
											: 'text-gray-700 hover:bg-green-100 bg-white border border-gray-300'
											}`}
										onClick={() => setPageIndex(page)}
									>
										{page + 1}
									</button>
								);
							})}
						</div>

						<button
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
							onClick={() =>
								setPageIndex((old) => Math.min(old + 1, pageCount - 1))
							}
							disabled={pageIndex === pageCount - 1}
						>
							Next
						</button>
					</div>
				</div>
			)}

			{/* Modal */}
			<UserProfileModal
				user={selectedUser}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</div>
	);
};

export default UserTable;
