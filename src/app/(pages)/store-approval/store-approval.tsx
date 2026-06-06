'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	ColumnDef,
} from '@tanstack/react-table';
import { Store } from '@/app/types/store-types';
import { Search, CheckCircle, Building2 } from 'lucide-react';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import axios from 'axios';
import ActionDropdown from './component/action-dropdown';

const PAGE_SIZE = 10;

export default function StoreApprovalPage() {
	const [storesData, setStoresData] = useState<Store[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [pageIndex, setPageIndex] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [businessTypeFilter, setBusinessTypeFilter] = useState('');

	useEffect(() => {
		const fetchSellerProfiles = async () => {
			try {
				const response = await axios.get('/api/seller/profile/GET');
				console.log(response.data);
				setStoresData(response.data);
				setLoading(false);
			} catch (error) {
				setError('Error loading seller profiles');
				setLoading(false);
				console.error('Error fetching seller profiles:', error);
			}
		};

		fetchSellerProfiles();
	}, []);

	// Filter data based on search and filters
	const filteredData = useMemo(() => {
		return storesData.filter((store) => {
			const matchesSearch =
				store.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				store.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
				store.country.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus =
				statusFilter === '' || store.storeStatus === statusFilter;
			const matchesBusinessType =
				businessTypeFilter === '' || store.businessType === businessTypeFilter;

			return matchesSearch && matchesStatus && matchesBusinessType;
		});
	}, [storesData, searchTerm, statusFilter, businessTypeFilter]);

	const pageCount = Math.ceil(filteredData.length / PAGE_SIZE);

	const pagedData = useMemo(() => {
		const start = pageIndex * PAGE_SIZE;
		return filteredData.slice(start, start + PAGE_SIZE);
	}, [filteredData, pageIndex]);

	const handleUpdateStatus = async (
		storeId: string,
		newStatus: Store['storeStatus']
	) => {
		try {
			// Update the UI optimistically
			setStoresData((prevData) =>
				prevData.map((store) =>
					store.id === storeId ? { ...store, storeStatus: newStatus } : store
				)
			);

			// Call API to update the seller profile status
			const response = await fetch('/api/seller/profile/PUT', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					sellerId: storeId,
					isVerified: true,
					storeStatus: newStatus,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to update seller status');
			}
		} catch (error) {
			console.error('Error updating seller status:', error);
			alert('Error updating store status.');
		}
	};

	const getStatusColor = (status: Store['storeStatus']) => {
		switch (status) {
			case 'approved':
				return 'bg-green-100 text-green-700 border-green-200';
			case 'rejected':
				return 'bg-red-100 text-red-700 border-red-200';
			case 'under review':
				return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'pending':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			case 'waiting submission':
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	const getBusinessTypeColor = (type: string) => {
		switch (type.toLowerCase()) {
			case 'retail':
				return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'wholesale':
				return 'bg-purple-100 text-purple-700 border-purple-200';
			case 'restaurant':
				return 'bg-orange-100 text-orange-700 border-orange-200';
			case 'service':
				return 'bg-teal-100 text-teal-700 border-teal-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	const columns: ColumnDef<Store>[] = [
		{
			header: 'Store',
			accessorKey: 'storeName',
			cell: (info) => {
				const store = info.row.original;
				return (
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
							{store.storeName.charAt(0)}
						</div>
						<div>
							<div className="font-semibold text-gray-900">
								{store.storeName}
							</div>
							<div className="text-sm text-gray-500">Owner: {store.owner}</div>
						</div>
					</div>
				);
			},
		},
		{
			header: 'Business Type',
			accessorKey: 'businessType',
			cell: (info) => (
				<span
					className={`px-3 py-1 rounded-full text-xs font-medium border ${getBusinessTypeColor(
						info.getValue() as string
					)}`}
				>
					{info.getValue() as string}
				</span>
			),
		},
		{
			header: 'Country',
			accessorKey: 'country',
			cell: (info) => (
				<div className="text-sm text-gray-700">{info.getValue() as string}</div>
			),
		},
		{
			header: 'Status',
			accessorKey: 'storeStatus',
			cell: (info) => {
				const status = info.getValue() as Store['storeStatus'];
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
							status
						)}`}
					>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</span>
				);
			},
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<ActionDropdown
					store={row.original}
					onUpdateStatus={handleUpdateStatus}
				/>
			),
		},
	];

	const table = useReactTable({
		data: pagedData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	// Generate pagination items
	const generatePaginationItems = () => {
		const items = [];
		const maxVisiblePages = 5;

		if (pageCount <= maxVisiblePages) {
			// Show all pages if total pages are less than or equal to max visible
			for (let i = 0; i < pageCount; i++) {
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							onClick={() => setPageIndex(i)}
							isActive={i === pageIndex}
							className="cursor-pointer"
						>
							{i + 1}
						</PaginationLink>
					</PaginationItem>
				);
			}
		} else {
			// Show first page
			items.push(
				<PaginationItem key={0}>
					<PaginationLink
						onClick={() => setPageIndex(0)}
						isActive={0 === pageIndex}
						className="cursor-pointer"
					>
						1
					</PaginationLink>
				</PaginationItem>
			);

			// Show ellipsis if current page is far from start
			if (pageIndex > 2) {
				items.push(<PaginationEllipsis key="ellipsis1" />);
			}

			// Show pages around current page
			const start = Math.max(1, pageIndex - 1);
			const end = Math.min(pageCount - 1, pageIndex + 1);

			for (let i = start; i <= end; i++) {
				if (i !== 0 && i !== pageCount - 1) {
					items.push(
						<PaginationItem key={i}>
							<PaginationLink
								onClick={() => setPageIndex(i)}
								isActive={i === pageIndex}
								className="cursor-pointer"
							>
								{i + 1}
							</PaginationLink>
						</PaginationItem>
					);
				}
			}

			// Show ellipsis if current page is far from end
			if (pageIndex < pageCount - 3) {
				items.push(<PaginationEllipsis key="ellipsis2" />);
			}

			// Show last page
			if (pageCount > 1) {
				items.push(
					<PaginationItem key={pageCount - 1}>
						<PaginationLink
							onClick={() => setPageIndex(pageCount - 1)}
							isActive={pageCount - 1 === pageIndex}
							className="cursor-pointer"
						>
							{pageCount}
						</PaginationLink>
					</PaginationItem>
				);
			}
		}

		return items;
	};

	if (loading) {
		return (
			<div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
				<div className="flex items-center justify-center space-x-3">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
					<span className="text-gray-600">Loading stores...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-2xl p-8">
				<div className="text-red-600 text-center">
					<Building2 className="mx-auto mb-2" size={48} />
					<p className="font-semibold">Failed to load stores</p>
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
					<h1 className="text-lg font-bold text-gray-900">Store Approval</h1>
					<div className="text-sm text-gray-500">
						{filteredData.length} stores found
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
								placeholder="Search by store name, owner, or country..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setPageIndex(0);
								}}
								className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white"
							/>
						</div>
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
							<option value="not reviewed">Not Reviewed</option>
							<option value="under review">Under Review</option>
							<option value="approved">Approved</option>
							<option value="rejected">Rejected</option>
						</select>
					</div>

					{/* Business Type Filter */}
					<div className="min-w-[140px]">
						<select
							value={businessTypeFilter}
							onChange={(e) => {
								setBusinessTypeFilter(e.target.value);
								setPageIndex(0);
							}}
							className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white"
						>
							<option value="">All Types</option>
							<option value="Retail">Retail</option>
							<option value="Wholesale">Wholesale</option>
							<option value="Restaurant">Restaurant</option>
							<option value="Service">Service</option>
						</select>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50 border-b border-gray-200">
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
								className={`hover:bg-green-50 transition-colors duration-200 ${
									index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
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
					<Building2 className="mx-auto mb-4 text-gray-400" size={48} />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						No stores found
					</h3>
					<p className="text-gray-500">
						Try adjusting your search or filter criteria.
					</p>
				</div>
			)}

			{/* Pagination using shadcn/ui */}
			{pageCount > 1 && (
				<div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 gap-4">
					<div className="text-sm text-gray-700">
						Showing {pageIndex * PAGE_SIZE + 1} to{' '}
						{Math.min((pageIndex + 1) * PAGE_SIZE, filteredData.length)} of{' '}
						{filteredData.length} stores
					</div>

					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
									className={`cursor-pointer ${
										pageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
									}`}
								/>
							</PaginationItem>

							{generatePaginationItems()}

							<PaginationItem>
								<PaginationNext
									onClick={() =>
										setPageIndex(Math.min(pageCount - 1, pageIndex + 1))
									}
									className={`cursor-pointer ${
										pageIndex === pageCount - 1
											? 'opacity-50 cursor-not-allowed'
											: ''
									}`}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</div>
	);
}
