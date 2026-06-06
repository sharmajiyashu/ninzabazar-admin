import { ActionDropdownProps } from '@/app/types/store-types';
import { MoreHorizontal, Eye, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	action: 'approve' | 'reject';
	storeName: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	action,
	storeName,
}) => {
	const isApprove = action === 'approve';
	const actionText = isApprove ? 'approve' : 'reject';

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div
							className={`flex items-center justify-center h-10 w-10 rounded-full ${
								isApprove ? 'bg-green-100' : 'bg-red-100'
							}`}
						>
							{isApprove ? (
								<Check className="h-5 w-5 text-green-600" />
							) : (
								<X className="h-5 w-5 text-red-600" />
							)}
						</div>
						<div>
							<DialogTitle className="text-lg font-semibold text-gray-900">
								{isApprove ? 'Approve Store' : 'Reject Store'}
							</DialogTitle>
						</div>
					</div>
					<DialogDescription className="text-sm text-gray-600 mt-2">
						Are you sure you want to {actionText}{' '}
						<span className="font-medium text-gray-900">{storeName}</span>?
						{isApprove
							? ' This will allow the store to start selling on the platform.'
							: ' This will prevent the store from selling on the platform.'}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex gap-2 sm:gap-2">
					<Button
						variant="outline"
						onClick={onClose}
						className="flex-1 sm:flex-none"
					>
						Cancel
					</Button>
					<Button
						onClick={onConfirm}
						className={`flex-1 sm:flex-none ${
							isApprove
								? 'bg-green-600 hover:bg-green-700 text-white'
								: 'bg-red-600 hover:bg-red-700 text-white'
						}`}
					>
						{isApprove ? 'Approve' : 'Reject'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const ActionDropdown: React.FC<ActionDropdownProps> = ({
	store,
	onUpdateStatus,
}) => {
	const [open, setOpen] = useState(false);
	const [confirmModal, setConfirmModal] = useState<{
		isOpen: boolean;
		action: 'approve' | 'reject';
	}>({ isOpen: false, action: 'approve' });
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

	const handleStatusChange = (action: 'approve' | 'reject') => {
		setConfirmModal({ isOpen: true, action });
		setOpen(false);
	};

	const confirmStatusChange = () => {
		const newStatus =
			confirmModal.action === 'approve' ? 'approved' : 'rejected';
		const verified = confirmModal.action === 'approve';

		onUpdateStatus(store.id!, newStatus, verified);
		setConfirmModal({ isOpen: false, action: 'approve' });
	};

	const handleViewStore = () => {
		// Only update status if it's currently pending
		if (store.storeStatus === 'pending') {
			onUpdateStatus(store.id!, 'under review', false);
		}
		setOpen(false);
	};

	const getStatusInfo = () => {
		switch (store.storeStatus) {
			case 'approved':
				return {
					message: 'Store is approved',
					icon: '✅',
					color: 'text-green-600',
				};
			case 'rejected':
				return {
					message: 'Store has been rejected',
					icon: '⛔',
					color: 'text-red-600',
				};
			case 'under review':
				return {
					message: 'Under review',
					icon: '🔍',
					color: 'text-blue-600',
				};
			default:
				return null;
		}
	};

	const statusInfo = getStatusInfo();
	const canApprove =
		store.storeStatus === 'pending' ||
		store.storeStatus === 'under review' ||
		store.storeStatus === 'rejected';
	const canReject =
		store.storeStatus === 'pending' ||
		store.storeStatus === 'under review' ||
		store.storeStatus === 'approved';

	return (
		<>
			<div className="relative" ref={dropdownRef}>
				<button
					onClick={() => setOpen(!open)}
					className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
					aria-label={`Actions for ${store.storeName}`}
				>
					<MoreHorizontal size={16} className="text-gray-600" />
				</button>

				{open && (
					<div className="absolute right-0 z-20 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
						<div className="py-1">
							<Link
								href={`/store-registration?id=${store.id}`}
								onClick={handleViewStore}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer text-gray-700 text-sm border-b border-gray-100"
							>
								<Eye size={16} />
								View Store Registration
							</Link>

							{/* Status Info */}
							{statusInfo && (
								<div
									className={`flex items-center gap-2 px-3 py-2 text-sm ${statusInfo.color} bg-gray-50`}
								>
									<span>{statusInfo.icon}</span>
									<span className="font-medium">{statusInfo.message}</span>
								</div>
							)}

							{/* Action Buttons */}
							<div className="border-t border-gray-100 pt-1">
								{canApprove && (
									<button
										onClick={() => handleStatusChange('approve')}
										className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 cursor-pointer text-green-600 text-sm w-full text-left"
									>
										<Check size={16} />
										{store.storeStatus === 'approved'
											? 'Already Approved'
											: 'Approve Store'}
									</button>
								)}

								{canReject && (
									<button
										onClick={() => handleStatusChange('reject')}
										className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 cursor-pointer text-red-600 text-sm w-full text-left"
									>
										<X size={16} />
										{store.storeStatus === 'rejected'
											? 'Already Rejected'
											: 'Reject Store'}
									</button>
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			<ConfirmationModal
				isOpen={confirmModal.isOpen}
				onClose={() => setConfirmModal({ isOpen: false, action: 'approve' })}
				onConfirm={confirmStatusChange}
				action={confirmModal.action}
				storeName={store.storeName}
			/>
		</>
	);
};

export default ActionDropdown;
