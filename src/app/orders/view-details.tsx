'use client';

import React from 'react';
import {
	X,
	Package,
	User as UserIcon,
	Calendar,
	ShoppingBag,
	Store,
	MapPin,
	Star,
	Shield,
	CheckCircle,
	Clock,
	AlertCircle,
	IndianRupee,
} from 'lucide-react';
import CurrencyFormatter from '@/components/CurrencyFormatter';
import { Order } from '@/app/types/type';

// Updated interface to match your actual data structure

interface OrderDetailsModalProps {
	order: Order | null;
	isOpen: boolean;
	onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
	order,
	isOpen,
	onClose,
}) => {
	if (!isOpen || !order) return null;

	const getStatusColor = (status: string | undefined) => {
		switch (status?.toLowerCase()) {
			case 'pending':
				return 'bg-yellow-500/20 text-yellow-700';
			case 'processing':
				return 'bg-blue-500/20 text-blue-700';
			case 'shipped':
				return 'bg-emerald-500/50 text-emerald-';
			case 'delivered':
				return 'bg-green-500/20 text-green-700';
			case 'cancelled':
				return 'bg-red-500/20 text-red-700';
			case 'held':
				return 'bg-orange-500/20 text-orange-700';
			default:
				return 'bg-gray-500/20 text-gray-700';
		}
	};

	const getStatusIcon = (status: string | undefined) => {
		switch (status?.toLowerCase()) {
			case 'pending':
				return <Clock size={16} />;
			case 'processing':
				return <Package size={16} />;
			case 'shipped':
				return <ShoppingBag size={16} />;
			case 'delivered':
				return <CheckCircle size={16} />;
			case 'cancelled':
				return <AlertCircle size={16} />;
			case 'held':
				return <Shield size={16} />;
			default:
				return <Package size={16} />;
		}
	};

	const getEscrowStatusColor = (status: string | undefined) => {
		switch (status?.toLowerCase()) {
			case 'pending':
				return 'bg-yellow-500/20 text-yellow-700';
			case 'completed':
				return 'bg-green-500/20 text-green-700';
			case 'failed':
				return 'bg-red-500/20 text-red-700';
			case 'refunded':
				return 'bg-blue-500/20 text-blue-700';
			case 'held':
				return 'bg-orange-500/20 text-orange-700';
			default:
				return 'bg-gray-500/20 text-gray-700';
		}
	};

	console.log('order data', order);
	console.log('order.OrderItem', order.OrderItem);
	console.log('first order item', order.OrderItem?.[0]);
	console.log('first product', order.OrderItem?.[0]?.Product);

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
				{/* Header */}
				<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
					<button
						onClick={onClose}
						className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
					>
						<X size={16} />
					</button>

					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
								<Package size={32} className="text-white" />
							</div>
							<div>
								<h2 className="text-2xl font-bold">
									Order #{order?.id?.slice(-8)}
								</h2>
								<div className="flex items-center space-x-2 mt-1">
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(
											order.status
										)}`}
									>
										{getStatusIcon(order.status)}
										<span className="capitalize">{order.status}</span>
									</span>
								</div>
							</div>
						</div>
						<div className="text-right mr-10">
							<div className="text-sm opacity-90">Total Amount</div>
							<div className="text-2xl font-bold">
								<CurrencyFormatter amount={Number(order.totalAmount)} />
							</div>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
					{/* Order & Customer Info */}
					<div className="grid md:grid-cols-2 gap-6 mb-8">
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
								Order Information
							</h3>
							<div className="space-y-3">
								<div className="flex items-center space-x-3">
									<Calendar className="text-gray-400" size={20} />
									<div>
										<span className="text-sm text-gray-500">Order Date</span>
										<p className="text-gray-700">
											{order.createdAt
												? new Date(order.createdAt).toLocaleString('en-US', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
												  })
												: 'No Date'}
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-3">
									<IndianRupee className="text-gray-400" size={20} />
									<div>
										<span className="text-sm text-gray-500">Order Total</span>
										<p className="text-gray-700 font-semibold">
											<CurrencyFormatter amount={Number(order.totalAmount)} />
										</p>
									</div>
								</div>
								{order.trackingLink && (
									<div className="flex items-center space-x-3">
										<ShoppingBag className="text-gray-400" size={20} />
										<div>
											<span className="text-sm text-gray-500">Tracking</span>
											<p className="text-gray-700">{order.trackingLink}</p>
										</div>
									</div>
								)}
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
								Customer Information
							</h3>
							<div className="space-y-3">
								<div className="flex items-center space-x-3">
									<UserIcon className="text-gray-400" size={20} />
									<div>
										<span className="text-sm text-gray-500">Customer</span>
										<p className="text-gray-700 font-medium">
											{order.BuyerProfile?.User?.firstName}{' '}
											{order.BuyerProfile?.User?.lastName}
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-3">
									<span className="text-gray-400 text-sm">Email:</span>
									<span className="text-gray-700">
										{order.BuyerProfile?.User?.email}
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<span className="text-gray-400 text-sm">Phone:</span>
									<span className="text-gray-700">
										{order.BuyerProfile?.User?.contactNumber}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Escrow Payment Info */}
					{order.EscrowPayment && (
						<div className="bg-purple-50 rounded-xl p-6 mb-6">
							<div className="flex items-center space-x-2 mb-4">
								<Shield className="text-purple-600" size={24} />
								<h3 className="text-xl font-semibold text-purple-800">
									Escrow Payment
								</h3>
							</div>
							<div className="grid md:grid-cols-3 gap-4">
								<div>
									<span className="text-sm text-purple-700">
										Payment Status
									</span>
									<div
										className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center mt-1 ${getEscrowStatusColor(
											order.EscrowPayment.status
										)}`}
									>
										<span className="capitalize">
											{order.EscrowPayment.status}
										</span>
									</div>
								</div>
								<div>
									<span className="text-sm text-purple-700">Payment ID</span>
									<p className="text-gray-700">
										{order.EscrowPayment.razorpayPaymentId || 'N/A'}
									</p>
								</div>
								<div>
									<span className="text-sm text-purple-700">Amount</span>
									<p className="text-gray-700 font-semibold">
										<CurrencyFormatter
											amount={Number(order.EscrowPayment.amount)}
										/>
									</p>
								</div>
							</div>
							{order.EscrowPayment.releaseDate && (
								<div className="mt-4 pt-4 border-t border-purple-200">
									<span className="text-sm text-purple-700">Release Date</span>
									<p className="text-gray-700">
										{new Date(order.EscrowPayment.releaseDate).toLocaleString()}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Order Items */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
							Order Items ({order?.OrderItem?.length || 0})
						</h3>
						<div className="space-y-4">
							{order?.OrderItem && order.OrderItem.length > 0 ? (
								order.OrderItem.map((item) => (
									<div key={item.id} className="bg-gray-50 rounded-xl p-6">
										<div className="flex items-start space-x-4">
											{/* Product Image */}
											<div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
												{item.Product?.ProductImage?.find(
													(img) => img.isDefault
												) ? (
													/* eslint-disable-next-line @next/next/no-img-element */
													<img
														src={
															item.Product.ProductImage.find(
																(img) => img.isDefault
															)?.urlpath
														}
														alt={item.Product.name}
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<Package className="text-gray-400" size={24} />
													</div>
												)}
											</div>

											{/* Product Details */}
											<div className="flex-grow">
												<div className="flex items-start justify-between">
													<div>
														<h4 className="font-semibold text-gray-800 mb-1">
															{item.Product?.name ||
																'Product Name Not Available'}
														</h4>
														<p className="text-sm text-gray-600 mb-2 line-clamp-2">
															{item.Product?.description ||
																'No description available'}
														</p>
														<div className="flex items-center space-x-4 text-sm text-gray-500">
															<span>Quantity: {item.quantity}</span>
															<span>
																Price:{' '}
																<CurrencyFormatter
																	amount={Number(item.priceAtPurchase)}
																/>
															</span>
															{item.shippingMethodPrice &&
																item.shippingMethodPrice > 0 && (
																	<span>
																		Shipping:{' '}
																		<CurrencyFormatter
																			amount={item.shippingMethodPrice}
																		/>
																	</span>
																)}
														</div>
													</div>
													<div className="text-right">
														<div className="text-lg font-bold text-gray-800">
															<CurrencyFormatter
																amount={
																	parseFloat(item.priceAtPurchase) *
																		item.quantity +
																	(item.shippingMethodPrice || 0)
																}
															/>
														</div>
													</div>
												</div>

												{/* Seller Info */}
												{item.Product?.SellerProfile && (
													<div className="mt-4 pt-4 border-t border-gray-200">
														<div className="flex items-center justify-between">
															<div className="flex items-center space-x-3">
																<Store className="text-gray-400" size={16} />
																<div>
																	<p className="font-medium text-gray-700">
																		{item.Product.SellerProfile.shopName ||
																			item.Product.SellerProfile.companyName}
																	</p>
																	{item.Product.SellerProfile.isVerified && (
																		<div className="flex items-center space-x-1 text-green-600 text-sm">
																			<CheckCircle size={14} />
																			<span>Verified Seller</span>
																		</div>
																	)}
																</div>
															</div>
															{item.Product.SellerProfile
																.StoreRatingSummary && (
																<div className="flex items-center space-x-1 text-sm text-gray-600">
																	<Star className="text-yellow-400" size={14} />
																	<span>
																		{item.Product.SellerProfile.StoreRatingSummary.average.toFixed(
																			1
																		)}
																	</span>
																	<span>
																		(
																		{
																			item.Product.SellerProfile
																				.StoreRatingSummary.totalCount
																		}
																		)
																	</span>
																</div>
															)}
														</div>

														{/* Seller Address */}
														{item.Product.SellerProfile.Address && (
															<div className="mt-2 flex items-start space-x-2">
																<MapPin
																	className="text-gray-400 mt-1"
																	size={14}
																/>
																<p className="text-sm text-gray-600">
																	{item.Product.SellerProfile.Address.city},{' '}
																	{item.Product.SellerProfile.Address.state}
																</p>
															</div>
														)}
													</div>
												)}
											</div>
										</div>
									</div>
								))
							) : (
								<div className="text-center py-8 text-gray-500">
									<Package className="mx-auto mb-4 text-gray-400" size={48} />
									<p>No order items found</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetailsModal;
