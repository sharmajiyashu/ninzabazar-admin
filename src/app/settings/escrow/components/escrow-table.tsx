'use client';

import React, { useMemo, useState } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	ColumnDef,
} from '@tanstack/react-table';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
	Search,
	Shield,
	AlertTriangle,
	MoreHorizontal,
	Eye,
	RefreshCw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { OrderItem } from '@/app/types/type';

type Escrow = {
	id: string;
	status: string;
	amount: number;
	razorpayPaymentId?: string;
	createdAt: string;
	releaseDate?: string;
	orderId: string;
	Order: {
		BuyerProfile: {
			User: {
				id: string;
				firstName: string;
				lastName: string;
				email: string;
				contactNumber: string;
			};
		};

		paymentMethod: string;
		OrderItem: OrderItem[];
	};
	Seller: {
		User: {
			id: string;
			firstName: string;
			lastName: string;
			email: string;
			contactNumber: string;
		};
	};
};

const EscrowTable = () => {
	const [pageIndex, setPageIndex] = useState(0); // eslint-disable-line
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [paymentMethodFilter, setPaymentMethodFilter] = useState(''); // eslint-disable-line
	const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState<Escrow | null>(
		null
	);
	const [isReleasing, setIsReleasing] = useState(false);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [selectedEscrowDetails, setSelectedEscrowDetails] =
		useState<Escrow | null>(null);

	const { data: escrowData, refetch: refetchEscrow } = useQuery({
		queryKey: ['escrow'],
		queryFn: async () => {
			const res = await axios.get(`/api/escrow/get`);
			return res.data;
		},
	});

	// Filter data based on search and filters
	const filteredData = useMemo(() => {
		if (!escrowData) return [];

		return escrowData.filter((escrow: Escrow) => {
			const buyerName = (
				(escrow.Order.BuyerProfile?.User?.firstName?.toLowerCase() ?? '') +
				' ' +
				(escrow.Order.BuyerProfile?.User?.lastName?.toLowerCase() ?? '')
			).trim();

			const sellerName = (
				(escrow.Seller?.User?.firstName?.toLowerCase() ?? '') +
				' ' +
				(escrow.Seller?.User?.lastName?.toLowerCase() ?? '')
			).trim();

			const transactionId = escrow.id.toLowerCase();
			const searchLower = searchTerm.toLowerCase();

			const matchesSearch =
				transactionId.includes(searchLower) ||
				buyerName.includes(searchLower) ||
				sellerName.includes(searchLower);

			const matchesStatus =
				!statusFilter ||
				escrow.status.toLowerCase() === statusFilter.toLowerCase();

			const matchesPayment =
				!paymentMethodFilter ||
				escrow.Order.paymentMethod?.toLowerCase() ===
					paymentMethodFilter.toLowerCase();

			return matchesSearch && matchesStatus && matchesPayment;
		});
	}, [escrowData, searchTerm, statusFilter, paymentMethodFilter]);

	console.log(filteredData);
	const handleViewDetails = (transaction: Escrow) => {
		setSelectedEscrowDetails(transaction);
		setIsDetailsModalOpen(true);
	};

	const handleReleaseEscrowClick = (transaction: Escrow) => {
		setSelectedTransaction(transaction);
		setIsReleaseModalOpen(true);
	};

	const handleConfirmRelease = async () => {
		if (!selectedTransaction) return;

		setIsReleasing(true);
		try {
			await axios.put(
				`/api/escrow/release?transactionId=${selectedTransaction.id}`
			);
			refetchEscrow();
			toast.success('Escrow released successfully.');
			setIsReleaseModalOpen(false);
			setSelectedTransaction(null);
		} catch (error) {
			console.log(error);
			toast.error('Failed to release escrow.');
		} finally {
			setIsReleasing(false);
		}
	};

	const handleCancelRelease = () => {
		setIsReleaseModalOpen(false);
		setSelectedTransaction(null);
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'released':
				return 'bg-green-100 text-green-700 border-green-200';
			case 'held':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			case 'dispute opened':
				return 'bg-red-100 text-red-700 border-red-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	const columns: ColumnDef<Escrow>[] = useMemo(
		() => [
			{
				header: 'Transaction',
				accessorKey: 'id',
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="font-semibold">{row.original.id}</span>
						<span className="text-sm text-gray-500">
							${Number(row.original.amount).toFixed(2)}
						</span>
					</div>
				),
			},
			{
				header: 'Buyer',
				accessorKey: 'Order.BuyerProfile.User.name',
				cell: ({ row }) => {
					const buyer = row.original.Order.BuyerProfile?.User;
					return (
						<div>
							<div className="font-semibold text-gray-900">
								{buyer?.firstName + ' ' + buyer?.lastName || 'N/A'}
							</div>
							<div className="text-sm text-gray-500">{buyer?.email || '—'}</div>
						</div>
					);
				},
			},
			{
				header: 'Seller',
				accessorKey: 'Order.SellerProfile.User.name',
				cell: ({ row }) => {
					const seller = row.original.Seller?.User;
					return (
						<div>
							<div className="font-semibold text-gray-900">
								{seller?.firstName + ' ' + seller?.lastName || 'N/A'}
							</div>
							<div className="text-sm text-gray-500">
								{seller?.email || '—'}
							</div>
						</div>
					);
				},
			},
			{
				header: 'Status',
				accessorKey: 'status',
				cell: ({ getValue }) => {
					const status = getValue() as string;
					return (
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
								status
							)}`}
						>
							{status}
						</span>
					);
				},
			},
			{
				header: 'Date Created',
				accessorKey: 'createdAt',
				cell: ({ getValue }) => {
					const date = new Date(getValue() as string);
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
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => {
					const transaction = row.original;
					return (
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
								aria-label={`Actions for ${transaction.id}`}
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
										onSelect={() => handleViewDetails(transaction)}
									>
										<Eye size={16} />
										View Details
									</DropdownMenu.Item>

									{transaction.status === 'HELD' && (
										<DropdownMenu.Item
											className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 cursor-pointer text-green-600 text-sm"
											onSelect={() => handleReleaseEscrowClick(transaction)}
										>
											<RefreshCw size={16} />
											Release Escrow
										</DropdownMenu.Item>
									)}
								</DropdownMenu.Content>
							</DropdownMenu.Portal>
						</DropdownMenu.Root>
					);
				},
			},
		],
		[]
	);

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<>
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
				{/* Header */}
				<div className="bg-white border-b border-gray-200 px-4 py-3">
					<div className="flex items-center justify-between">
						<h1 className="text-lg font-bold text-gray-900">Escrow Management</h1>
						<div className="text-sm text-gray-500">
							{filteredData.length} transactions found
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
									placeholder="Search by transaction ID, buyer, or seller..."
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
								<option value="Held">Escrow Held</option>
								<option value="Released">Released</option>
								{/* <option value="Dispute opened">Dispute Opened</option> */}
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
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
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
						<Shield className="mx-auto mb-4 text-gray-400" size={48} />
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							No transactions found
						</h3>
						<p className="text-gray-500">
							Try adjusting your search or filter criteria.
						</p>
					</div>
				)}
			</div>

			{/* Release Escrow Confirmation Modal */}
			<Dialog open={isReleaseModalOpen} onOpenChange={setIsReleaseModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Confirm Escrow Release</DialogTitle>
						<DialogDescription>
							Are you sure you want to release this escrow? This action cannot
							be undone.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
								<AlertTriangle size={20} className="text-yellow-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">
									Release Escrow Payment
								</h3>
								<p className="text-sm text-gray-500">
									Funds will be transferred to the seller
								</p>
							</div>
						</div>

						{selectedTransaction && (
							<div className="bg-gray-50 rounded-lg p-4 space-y-2">
								<div className="flex justify-between">
									<span className="text-sm font-medium text-gray-700">
										Transaction ID:
									</span>
									<span className="text-sm text-gray-900">
										{selectedTransaction.id}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm font-medium text-gray-700">
										Amount:
									</span>
									<span className="text-sm text-gray-900">
										${Number(selectedTransaction.amount).toFixed(2)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm font-medium text-gray-700">
										Buyer:
									</span>
									<span className="text-sm text-gray-900">
										{selectedTransaction.Order.BuyerProfile?.User?.firstName}{' '}
										{selectedTransaction.Order.BuyerProfile?.User?.lastName}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm font-medium text-gray-700">
										Seller:
									</span>
									<span className="text-sm text-gray-900">
										{selectedTransaction.Seller?.User?.firstName}{' '}
										{selectedTransaction.Seller?.User?.lastName}
									</span>
								</div>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={handleCancelRelease}
							disabled={isReleasing}
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirmRelease}
							disabled={isReleasing}
							className="bg-green-600 hover:bg-green-700"
						>
							{isReleasing ? (
								<>
									<RefreshCw size={16} className="animate-spin mr-2" />
									Releasing...
								</>
							) : (
								'Release Escrow'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* View Details Dialog */}
			<Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Escrow Transaction Details</DialogTitle>
						<DialogDescription>
							View escrow payment and order summary information.
						</DialogDescription>
					</DialogHeader>

					{selectedEscrowDetails && (
						<div className="space-y-6 text-sm text-gray-700 mt-4">
							{/* Escrow Info */}
							<div className="space-y-2">
								<h3 className="text-lg font-semibold text-gray-900">
									Escrow Info
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<p>
										<strong>Transaction ID:</strong> {selectedEscrowDetails.id}
									</p>
									<p>
										<strong>Status:</strong> {selectedEscrowDetails.status}
									</p>
									<p>
										<strong>Amount:</strong> $
										{Number(selectedEscrowDetails.amount).toFixed(2)}
									</p>
									<p>
										<strong>Payment Method:</strong>{' '}
										{selectedEscrowDetails.Order.paymentMethod}
									</p>
									{selectedEscrowDetails.razorpayPaymentId && (
										<p>
											<strong>Razorpay Payment ID:</strong>{' '}
											{selectedEscrowDetails.razorpayPaymentId}
										</p>
									)}
									<p>
										<strong>Created At:</strong>{' '}
										{new Date(
											selectedEscrowDetails.createdAt
										).toLocaleDateString()}
									</p>
									{selectedEscrowDetails.releaseDate && (
										<p>
											<strong>Release Date:</strong>{' '}
											{new Date(
												selectedEscrowDetails.releaseDate
											).toLocaleDateString()}
										</p>
									)}
								</div>
							</div>

							{/* Buyer & Seller */}
							<div className="grid grid-cols-2 gap-8">
								<div>
									<h4 className="font-semibold text-gray-900">Buyer</h4>
									<p>
										{selectedEscrowDetails.Order.BuyerProfile.User.firstName}{' '}
										{selectedEscrowDetails.Order.BuyerProfile.User.lastName}
									</p>
									<p>{selectedEscrowDetails.Order.BuyerProfile.User.email}</p>
									<p>
										{
											selectedEscrowDetails.Order.BuyerProfile.User
												.contactNumber
										}
									</p>
								</div>
								<div>
									<h4 className="font-semibold text-gray-900">Seller</h4>
									<p>
										{selectedEscrowDetails.Seller.User.firstName}{' '}
										{selectedEscrowDetails.Seller.User.lastName}
									</p>
									<p>{selectedEscrowDetails.Seller.User.email}</p>
									<p>{selectedEscrowDetails.Seller.User.contactNumber}</p>
								</div>
							</div>

							{/* Order Items */}
							<div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Ordered Items
								</h3>
								<div className="border rounded-lg overflow-hidden divide-y">
									{selectedEscrowDetails.Order.OrderItem.map((item) => (
										<div
											key={item.id}
											className="p-4 grid grid-cols-12 gap-4 items-center"
										>
											{/* Product image */}
											<div className="col-span-2">
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													src={
														item.Product?.ProductImage?.find(
															(img) => img.isDefault
														)?.urlpath ?? '/placeholder.svg'
													}
													alt={item.Product?.name ?? 'Product'}
													className="w-full rounded-md border"
												/>
											</div>

											{/* Info */}
											<div className="col-span-10">
												<div className="flex justify-between items-start">
													<div>
														<p className="font-semibold">
															{item.Product?.name}
														</p>
														<p className="text-gray-500 text-sm">
															Qty: {item.quantity}
														</p>
														{item.variant && (
															<p className="text-gray-500 text-sm">
																Variant: {item.variant.title} -{' '}
																{item.variant.option}
															</p>
														)}
													</div>
													<div className="text-right font-medium">
														${Number(item.priceAtPurchase).toFixed(2)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					<DialogFooter className="mt-6">
						<Button
							variant="outline"
							onClick={() => setIsDetailsModalOpen(false)}
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default EscrowTable;
