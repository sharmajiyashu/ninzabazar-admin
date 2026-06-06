import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
	MoreVertical,
	Loader2,
	Package,
	Truck,
	CheckCircle,
	XCircle,
	Eye,
	Edit3,
} from 'lucide-react';

const statuses = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusConfig = {
	PROCESSING: {
		icon: Package,
		color: 'text-yellow-700',
		bg: 'bg-yellow-50',
		border: 'border-yellow-200',
		label: 'Processing',
	},
	SHIPPED: {
		icon: Truck,
		color: 'text-blue-700',
		bg: 'bg-blue-50',
		border: 'border-blue-200',
		label: 'Shipped',
	},
	DELIVERED: {
		icon: CheckCircle,
		color: 'text-green-700',
		bg: 'bg-green-50',
		border: 'border-green-200',
		label: 'Delivered',
	},
	CANCELLED: {
		icon: XCircle,
		color: 'text-red-700',
		bg: 'bg-red-50',
		border: 'border-red-200',
		label: 'Cancelled',
	},
};

interface Props {
	orderId: string;
	currentStatus: string;
	onViewDetails?: (orderId: string) => void;
}

export const CombinedActionButton: React.FC<Props> = ({
	orderId,
	currentStatus,
	onViewDetails,
}) => {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = React.useState(false);
	const [showStatusSubmenu, setShowStatusSubmenu] = React.useState(false);
	const [selectedStatus, setSelectedStatus] = React.useState(currentStatus);
	const [updating, setUpdating] = React.useState(false);

	const mutation = useMutation({
		mutationFn: async (newStatus: string) => {
			setUpdating(true);
			await axios.put(`/api/update-order-status`, {
				orderId,
				status: newStatus,
			});
			setUpdating(false);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
			setIsOpen(false);
			setShowStatusSubmenu(false);
		},
		onError: () => {
			setUpdating(false);
		},
	});

	const handleStatusChange = (newStatus: string) => {
		setSelectedStatus(newStatus);
	};

	const handleViewDetails = () => {
		setIsOpen(false);
		if (onViewDetails) {
			onViewDetails(orderId);
		}
	};

	return (
		<div className="relative">
			{/* Main Action Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				disabled={updating}
				className={`
					flex items-center justify-center w-8 h-8 rounded-full border
					transition-all duration-200 hover:shadow-sm
					${
						updating
							? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
							: 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
					}
				`}
			>
				{updating ? (
					<Loader2 className="w-4 h-4 animate-spin text-gray-500" />
				) : (
					<MoreVertical className="w-4 h-4 text-gray-600" />
				)}
			</button>

			{/* Main Dropdown Menu */}
			{isOpen && !showStatusSubmenu && (
				<div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
					<div className="py-1">
						{/* View Details Option */}
						<button
							onClick={handleViewDetails}
							className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
						>
							<Eye className="w-4 h-4" />
							<span>View Details</span>
						</button>

						{/* Update Status Option */}
						<button
							onClick={() => setShowStatusSubmenu(true)}
							className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
						>
							<Edit3 className="w-4 h-4" />
							<span>Update Status</span>
							<div className="ml-auto">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</button>
					</div>
				</div>
			)}

			{/* Status Submenu */}
			{isOpen && showStatusSubmenu && (
				<div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
					<div className="py-1">
						{/* Back Button */}
						<button
							onClick={() => setShowStatusSubmenu(false)}
							className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							<span>Back</span>
						</button>

						{/* Status Options */}
						{statuses.map((status) => {
							const config = statusConfig[status as keyof typeof statusConfig];
							const StatusIcon = config?.icon || Package;
							const isCurrent = status === currentStatus;

							return (
								<button
									key={status}
									onClick={() => handleStatusChange(status)}
									className={`
										w-full flex items-center gap-3 px-4 py-2 text-sm
										transition-colors duration-150
										${
											isCurrent
												? `${config?.bg} ${config?.color} font-medium`
												: 'hover:bg-gray-50 text-gray-700'
										}
									`}
								>
									<StatusIcon className="w-4 h-4" />
									<span className="flex-1 text-left">
										{config?.label || status}
									</span>
									{isCurrent && (
										<div className="w-2 h-2 bg-current rounded-full opacity-60" />
									)}
								</button>
							);
						})}

						{selectedStatus !== currentStatus && (
							<div className="px-4 py-2 border-t border-gray-100">
								<button
									onClick={() => mutation.mutate(selectedStatus)}
									className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
								>
									Confirm Update
								</button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Click outside to close */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => {
						setIsOpen(false);
						setShowStatusSubmenu(false);
					}}
				/>
			)}
		</div>
	);
};
