'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	ColumnDef,
} from '@tanstack/react-table';
import { PackageCheck, Loader2, AlertTriangle } from 'lucide-react';
import { Order } from '@/app/types/type';
import { CombinedActionButton } from '../action-button';
import OrderDetailsModal from '../view-details';

interface MappedOrder {
	id: string;
	buyerName: string;
	orderNumber: string;
	status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
	createdAt: string;
	totalAmount: number;
	itemCount: number;
	paymentStatus: string;
	sellerName: string;
	items: {
		name: string;
		quantity: number;
		price: number;
	}[];
}

const OrdersTable: React.FC = () => {
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const {
		data = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['orders'],
		queryFn: async () => {
			const res = await axios.get('/api/get-all-orders');
			const mapOrdersToTableFormat = (orders: Order[]): MappedOrder[] => {
				return orders.map((order) => {
					const orderItems = order.OrderItem || [];

					// First seller (assumption: all order items are from one seller)
					const firstSellerName =
						orderItems[0]?.SellerProfile?.user?.firstName +
							' ' +
							orderItems[0]?.SellerProfile?.user?.lastName || 'N/A';

					return {
						id: order.id,
						orderNumber: order.id,
						status: order.status.toUpperCase() as MappedOrder['status'],
						createdAt: order.createdAt,
						totalAmount: parseFloat(order.totalAmount),
						itemCount: orderItems.length,
						paymentStatus:
							order.EscrowPayment?.status?.toUpperCase() || 'PENDING',
						buyerName: `${order.BuyerProfile.User.firstName} ${order.BuyerProfile.User.lastName}`,
						sellerName: firstSellerName,
						items: orderItems.map((item) => ({
							name: item.Product?.name || 'Unnamed Product',
							quantity: item.quantity,
							price: parseFloat(item.priceAtPurchase),
						})),
					};
				});
			};
			const mapped = mapOrdersToTableFormat(res.data.orders);
			console.log('Mapped Orders:', mapped);
			return mapped;
		},
	});

	// Fetch detailed order data when modal opens
	const { data: orderDetails, refetch: refetchOrderDetails } = useQuery({
		queryKey: ['order-details', selectedOrderId],
		queryFn: async () => {
			if (!selectedOrderId) return null;
			const res = await axios.get(
				`/api/get-order-details?orderId=${selectedOrderId}`
			);
			return res.data;
		},
		enabled: !!selectedOrderId && isModalOpen,
	});

	const handleViewDetails = React.useCallback((orderId: string) => {
		setSelectedOrderId(orderId);
		setIsModalOpen(true);
		refetchOrderDetails();
	}, [refetchOrderDetails]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleCloseModal();
			}
		};

		if (isModalOpen) {
			window.addEventListener('keydown', handleKeyDown);
		}

		// Cleanup to avoid memory leaks
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isModalOpen]);

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedOrderId(null);
	};

	const columns = React.useMemo<ColumnDef<MappedOrder>[]>(
		() => [
			{
				header: 'Order #',
				accessorKey: 'orderNumber',
				cell: (info) => {
					const value = info.getValue() as string;
					return `#${value}`;
				},
			},
			{
				header: 'Buyer',
				accessorKey: 'buyerName',
			},
			{
				header: 'Items',
				accessorKey: 'itemCount',
				cell: (info) => {
					const count = info.getValue() as number;
					return `${count}`;
				},
			},
			{
				header: 'Amount',
				accessorKey: 'totalAmount',
				cell: (info) => `₱${(info.getValue() as number).toFixed(2)}`,
			},
			{
				header: 'Status',
				accessorKey: 'status',
				cell: (info) => {
					const status = info.getValue() as string;
					const colors: Record<string, string> = {
						PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
						SHIPPED: 'bg-blue-100 text-blue-800 border-blue-300',
						DELIVERED: 'bg-green-100 text-green-800 border-green-300',
						CANCELLED: 'bg-red-100 text-red-800 border-red-300',
					};
					return (
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium border ${
								colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
							}`}
						>
							{status}
						</span>
					);
				},
			},
			{
				header: 'Payment',
				accessorKey: 'paymentStatus',
				cell: (info) => {
					const status = info.getValue() as string;
					const colors: Record<string, string> = {
						PENDING: 'bg-yellow-100 text-yellow-800',
						HELD: 'bg-orange-100 text-orange-800',
						RELEASED: 'bg-green-100 text-green-800',
						REFUNDED: 'bg-red-100 text-red-800',
					};
					return (
						<span
							className={`px-2 py-1 rounded text-xs font-medium ${
								colors[status.toUpperCase()] || 'bg-gray-100 text-gray-800'
							}`}
						>
							{status}
						</span>
					);
				},
			},
			{
				header: 'Date',
				accessorKey: 'createdAt',
				cell: (info) => {
					const date = new Date(info.getValue() as string);
					return date.toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					});
				},
			},
			{
				header: 'Action',
				accessorKey: 'action',
				cell: ({ row }) => {
					const order = row.original as MappedOrder;
					return (
						<CombinedActionButton
							orderId={order.id}
							currentStatus={order.status}
							onViewDetails={handleViewDetails}
						/>
					);
				},
			},
		],
		[handleViewDetails]
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (isLoading)
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="animate-spin mr-2 text-green-600" /> Loading
				orders...
			</div>
		);

	if (isError)
		return (
			<div className="text-red-600 flex items-center justify-center py-8">
				<AlertTriangle className="mr-2" /> Failed to load orders
			</div>
		);

	if (data.length === 0) {
		return (
			<div className="text-gray-500 flex items-center justify-center py-8">
				<PackageCheck className="mr-2" /> No orders found
			</div>
		);
	}

	return (
		<>
			<div className="overflow-x-auto">
				<table className="w-full max-w-5xl">
					<thead className="bg-green-50">
						{table.getHeaderGroups().map((group) => (
							<tr key={group.id}>
								{group.headers.map((header) => (
									<th
										key={header.id}
										className="px-4 py-3 text-left text-sm font-medium text-green-800"
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="divide-y divide-gray-200">
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id} className="hover:bg-green-50">
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="px-4 py-2 text-sm">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Order Details Modal */}
			<OrderDetailsModal
				order={orderDetails}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
			/>
		</>
	);
};

export default OrdersTable;
