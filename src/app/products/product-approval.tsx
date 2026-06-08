'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	ColumnDef,
	getPaginationRowModel,
	getFilteredRowModel,
} from '@tanstack/react-table';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Table } from '@tanstack/react-table';
import { API_ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/use-debounce';

// Define the Product interface
interface Product {
	id: string;
	productName: string;
	storeOwner: string;
	storeName: string;
	category: string;
	subCategory: string;
	price: number;
	salePrice: number | null;
	status: 'under review' | 'approved' | 'rejected';
	images: {
		id: string;
		url: string;
		alt: string;
		isDefault: boolean;
	}[];
	variants: {
		id: string;
		title: string;
		option: string;
		price: number;
		sku: string | null;
		images: {
			id: string;
			url: string;
			alt: string;
			isDefault: boolean;
		}[];
	}[];
}

// Custom hook moved to @/hooks/use-debounce

interface ActionDropdownProps {
	product: Product;
	onUpdateStatus: (productId: string, approved: boolean) => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
	product,
	onUpdateStatus,
}) => {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};

		if (open) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [open]);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-green-50 transition-colors duration-200"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-5 w-5 text-gray-600"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
				</svg>
			</button>

			{open && (
				<div className="absolute right-0 z-20 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
					<div className="py-1">
						<button
							onClick={() => {
								onUpdateStatus(product.id, true);
								setOpen(false);
							}}
							className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="text-green-600 h-4 w-4 mr-2"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="m9 12 2 2 4-4" />
							</svg>
							Approve product
						</button>

						<button
							onClick={() => {
								onUpdateStatus(product.id, false);
								setOpen(false);
							}}
							className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 mr-2 text-orange-600"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
									clipRule="evenodd"
								/>
							</svg>
							Reject product
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

// Pagination component
const Pagination: React.FC<{ table: Table<Product> }> = ({ table }) => {
	return (
		<div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
			<div className="flex items-center text-sm text-gray-500">
				<span className="mr-2">Rows per page:</span>
				<select
					value={table.getState().pagination.pageSize}
					onChange={(e) => {
						table.setPageSize(Number(e.target.value));
					}}
					className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
				>
					{[10, 20, 30, 40, 50].map((pageSize) => (
						<option key={pageSize} value={pageSize}>
							{pageSize}
						</option>
					))}
				</select>
			</div>

			<div className="flex items-center space-x-2">
				<span className="text-sm text-gray-700">
					{table.getState().pagination.pageIndex *
						table.getState().pagination.pageSize +
						1}{' '}
					to{' '}
					{Math.min(
						(table.getState().pagination.pageIndex + 1) *
							table.getState().pagination.pageSize,
						table.getFilteredRowModel().rows.length
					)}{' '}
					of {table.getFilteredRowModel().rows.length} results
				</span>

				<div className="flex items-center space-x-1">
					<button
						className="inline-flex items-center px-2 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft className="h-4 w-4" />
					</button>

					<span className="text-sm text-gray-700 px-2">
						Page {table.getState().pagination.pageIndex + 1} of{' '}
						{table.getPageCount()}
					</span>

					<button
						className="inline-flex items-center px-2 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default function ProductApprovalPage() {
	const [productsData, setProductsData] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [viewImage, setViewImage] = useState<string | null>(null);
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [categoryFilter, setCategoryFilter] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<string>('');
	
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	// Debounced search value with longer delay to reduce lag
	const debouncedSearchTerm = useDebounce(globalFilter, 500);

	// Fetch products from database
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await fetch(API_ROUTES.productsReview);
				if (!response.ok) {
					throw new Error('Failed to fetch products');
				}

				const data = await response.json();
				setProductsData(data);
				setLoading(false);
			} catch (error) {
				setError('Error loading products');
				setLoading(false);
				console.error('Error fetching products:', error);
			}
		};

		fetchProducts();
	}, []);

	const handleUpdateStatus = async (productId: string, approved: boolean) => {
		try {
			// Update the UI optimistically
			setProductsData((prevData) =>
				prevData.map((product) =>
					product.id === productId
						? { ...product, status: approved ? 'approved' : 'rejected' }
						: product
				)
			);

			// Call API to update the product approval status
			const response = await fetch(API_ROUTES.productsReview, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					productId,
					adminApproved: approved,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to update product status');
			}

			console.log(`Product ${productId} ${approved ? 'approved' : 'rejected'}`);
		} catch (error) {
			console.error('Error updating product status:', error);
		}
	};

	// Get unique categories for filter dropdown
	const uniqueCategories = useMemo(
		() => Array.from(new Set(productsData.map((product) => product.category))),
		[productsData]
	);

	const columns: ColumnDef<Product>[] = [
		{
			header: 'Product',
			accessorKey: 'productName',
			cell: (info) => (
				<div className="font-medium text-gray-900">
					{info.getValue<string>()}
				</div>
			),
		},
		{
			header: 'Store Owner',
			accessorKey: 'storeOwner',
		},
		{
			header: 'Category',
			accessorKey: 'category',
			cell: ({ row }) => {
				const product = row.original;
				return (
					<div className="flex flex-col space-y-1">
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
							{product.category}
						</span>
						{product.subCategory && product.subCategory !== 'N/A' && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
								{product.subCategory}
							</span>
						)}
					</div>
				);
			},
		},
		{
			header: 'Price',
			accessorKey: 'price',
			cell: (info) => (
				<div className="font-medium">${info.getValue<number>().toFixed(2)}</div>
			),
		},
		{
			header: 'Image',
			id: 'image',
			cell: ({ row }) => {
				const product = row.original;
				const defaultImage =
					product.images.find((img) => img.isDefault)?.url ||
					product.images[0]?.url;

				return defaultImage ? (
					<button
						onClick={() => setViewImage(defaultImage)}
						className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4 mr-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						View
					</button>
				) : (
					<span className="text-gray-400">No image</span>
				);
			},
		},
		{
			header: 'Status',
			accessorKey: 'status',
			cell: (info) => {
				const status = info.getValue<
					'under review' | 'approved' | 'rejected'
				>();

				const statusStyles = {
					'under review': 'bg-yellow-100 text-yellow-800',
					approved: 'bg-green-100 text-green-800',
					rejected: 'bg-orange-100 text-orange-800',
				};

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
					>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</span>
				);
			},
		},
		{
			header: '',
			id: 'actions',
			cell: ({ row }) => (
				<ActionDropdown
					product={row.original}
					onUpdateStatus={handleUpdateStatus}
				/>
			),
		},
	];

	// Optimized filtering with useMemo
	const filteredData = useMemo(() => {
		return productsData.filter((product) => {
			const matchesSearch =
				debouncedSearchTerm === '' ||
				product.productName
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				product.storeOwner
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase()) ||
				product.category
					.toLowerCase()
					.includes(debouncedSearchTerm.toLowerCase());

			const matchesCategory =
				categoryFilter === '' || product.category === categoryFilter;
			const matchesStatus =
				statusFilter === '' || product.status === statusFilter;

			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [productsData, debouncedSearchTerm, categoryFilter, statusFilter]);

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			pagination,
		},
		onPaginationChange: setPagination,
	});

	const clearFilters = () => {
		setGlobalFilter('');
		setCategoryFilter('');
		setStatusFilter('');
	};

	const hasActiveFilters = globalFilter || categoryFilter || statusFilter;

	if (loading) {
		return (
			<div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
				<div className="flex items-center justify-center space-x-3">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
					<span className="text-gray-600">Loading products...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
				<p className="text-red-600 font-semibold">{error}</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-4 py-3">
				<div className="flex items-center justify-between">
					<h1 className="text-lg font-bold text-gray-900">Product Approval</h1>
					<div className="text-sm text-gray-500">
						{filteredData.length} products found
					</div>
				</div>
			</div>

					{/* Search and Filters */}
					<div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
						<div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
							{/* Search Bar */}
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<input
									type="text"
									placeholder="Search products, stores, or categories..."
									value={globalFilter}
									onChange={(e) => setGlobalFilter(e.target.value)}
									className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
								/>
							</div>

							{/* Filters */}
							<div className="flex flex-wrap gap-3">
								{/* Category Filter */}
								<div className="relative">
									<select
										value={categoryFilter}
										onChange={(e) => setCategoryFilter(e.target.value)}
										className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
									>
										<option value="">All Categories</option>
										{uniqueCategories.map((category) => (
											<option key={category} value={category}>
												{category}
											</option>
										))}
									</select>
									<Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
								</div>

								{/* Status Filter */}
								<div className="relative">
									<select
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value)}
										className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
									>
										<option value="">All Status</option>
										<option value="under review">Under Review</option>
										<option value="approved">Approved</option>
										<option value="rejected">Rejected</option>
									</select>
									<Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
								</div>

								{/* Clear Filters Button */}
								{hasActiveFilters && (
									<button
										onClick={clearFilters}
										className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
									>
										<X className="h-4 w-4" />
										Clear
									</button>
								)}
							</div>
						</div>

						{/* Results Count */}
						<div className="mt-3 text-sm text-gray-600">
							Showing {table.getRowModel().rows.length} of {filteredData.length}{' '}
							products
							{hasActiveFilters && (
								<span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
									Filtered
								</span>
							)}
						</div>
					</div>

					{/* Table */}
					<div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
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
								{table.getRowModel().rows.length === 0 ? (
									<tr>
										<td
											colSpan={columns.length}
											className="px-6 py-12 text-center text-gray-500"
										>
											<div className="flex flex-col items-center">
												<Search className="h-12 w-12 text-gray-300 mb-4" />
												<p className="text-lg font-medium">No products found</p>
												<p className="text-sm">
													Try adjusting your search or filters
												</p>
											</div>
										</td>
									</tr>
								) : (
									table.getRowModel().rows.map((row, index) => (
										<tr
											key={row.id}
											className={`hover:bg-green-50 transition-colors duration-150 ${
												index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
											}`}
										>
											{row.getVisibleCells().map((cell) => (
												<td
													key={cell.id}
													className="px-4 py-2 text-sm whitespace-nowrap"
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</td>
											))}
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<Pagination table={table} />

			{/* Image Modal */}
			{viewImage && (
				<div className="fixed inset-0 overflow-y-auto z-50">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 transition-opacity"
							aria-hidden="true"
						>
							<div
								className="absolute inset-0 bg-gray-500 opacity-75"
								onClick={() => setViewImage(null)}
							></div>
						</div>

						<span
							className="hidden sm:inline-block sm:align-middle sm:h-screen"
							aria-hidden="true"
						>
							&#8203;
						</span>

						<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
							<div className="bg-green-50 px-4 py-3 flex justify-between items-center">
								<h3 className="text-lg font-medium text-gray-900">
									Product Image
								</h3>
								<button
									onClick={() => setViewImage(null)}
									className="text-gray-400 hover:text-gray-500 focus:outline-none"
								>
									<X className="h-6 w-6" />
								</button>
							</div>
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="flex justify-center">
									<Image
										width={500}
										height={500}
										src={viewImage}
										alt="Product"
										className="max-w-full max-h-96 object-contain rounded-lg"
									/>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									type="button"
									onClick={() => setViewImage(null)}
									className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
								>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
