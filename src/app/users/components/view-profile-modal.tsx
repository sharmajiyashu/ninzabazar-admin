'use client';

import React from 'react';
import { User } from '@/app/types/user';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
	X,
	User as UserIcon,
	Mail,
	Phone,
	Calendar,
	MapPin,
	Star,
	Package,
	Building,
	CheckCircle,
} from 'lucide-react';

interface UserProfileModalProps {
	user: User | null;
	isOpen: boolean;
	onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
	user,
	isOpen,
	onClose,
}) => {
	const { data: userData } = useQuery<User>({
		queryKey: ['userData', user?.id],
		enabled: !!user?.id,
		queryFn: async () => {
			const res = await axios.get(`/api/get-user-by-id?id=${user?.id}`);
			console.log(res.data);
			return res.data;
		},
	});

	if (!isOpen || !user) return null;

	if (!userData) {
		return (
			<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl p-8 shadow-2xl flex items-center space-x-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="text-gray-700 font-medium">Loading profile...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
				{/* Header */}
				<div
					className={`${
						userData.role === 'BUYER'
							? 'bg-gradient-to-r from-green-500 to-emerald-500'
							: 'bg-gradient-to-r from-orange-500 to-red-500'
					} text-white p-6 relative`}
				>
					<button
						onClick={onClose}
						className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
					>
						<X size={24} />
					</button>

					<div className="flex items-center space-x-4">
						<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
							<UserIcon size={32} className="text-white" />
						</div>
						<div>
							<h2 className="text-2xl font-bold">
								{userData.firstName} {userData.lastName}
							</h2>
							<div className="flex items-center space-x-2 mt-1">
								<span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
									{userData.role}
								</span>
								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${
										userData.status === 'ACTIVE'
											? 'bg-green-500/20 text-green-100'
											: 'bg-red-500/20 text-red-100'
									}`}
								>
									{userData.status ?? 'ACTIVE'}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
					{/* Basic Info */}
					<div className="grid md:grid-cols-2 gap-6 mb-8">
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
								Contact Information
							</h3>
							<div className="space-y-3">
								<div className="flex items-center space-x-3">
									<Mail className="text-gray-400" size={20} />
									<span className="text-gray-700">{userData.email}</span>
								</div>
								<div className="flex items-center space-x-3">
									<Phone className="text-gray-400" size={20} />
									<span className="text-gray-700">
										{userData.contactNumber}
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<Calendar className="text-gray-400" size={20} />
									<span className="text-gray-700">
										{userData.dateOfBirth ?? 'Not provided'}
									</span>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
								Account Details
							</h3>
							<div className="space-y-3">
								<div className="flex items-center space-x-3">
									<UserIcon className="text-gray-400" size={20} />
									<span className="text-gray-700">
										Member since{' '}
										{new Date(userData.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Buyer Profile */}
					{userData.role === 'BUYER' && userData.BuyerProfile && (
						<div className="bg-green-50 rounded-xl p-6 mb-6">
							<div className="flex items-center space-x-2 mb-4">
								<Package className="text-green-600" size={24} />
								<h3 className="text-xl font-semibold text-green-800">
									Buyer Profile
								</h3>
							</div>

							<div className="mb-4">
								<p className="text-sm text-green-700">
									Profile created:{' '}
									{new Date(
										userData.BuyerProfile.createdAt
									).toLocaleDateString()}
								</p>
							</div>

							{userData.BuyerProfile.Address.length > 0 && (
								<div>
									<h4 className="font-semibold text-green-800 mb-3 flex items-center">
										<MapPin className="mr-2" size={20} />
										Delivery Addresses
									</h4>
									<div className="space-y-3">
										{userData.BuyerProfile.Address.map((addr, i) => (
											<div
												key={addr.id}
												className="bg-white rounded-lg p-4 border border-green-200"
											>
												<div className="flex items-start justify-between">
													<div>
														<div className="flex items-center space-x-2 mb-2">
															<span className="font-medium text-green-800">
																Address #{i + 1}
															</span>
															{addr.isDefault && (
																<span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
																	Default
																</span>
															)}
														</div>
														<p className="text-gray-700 text-sm leading-relaxed">
															{addr.street}
															<br />
															{addr.city}, {addr.state} {addr.postalCode}
															<br />
															{addr.country}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					{/* Seller Profile */}
					{userData.role === 'SELLER' && userData.SellerProfile && (
						<div className="bg-blue-50 rounded-xl p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center space-x-2">
									<Building className="text-blue-600" size={24} />
									<h3 className="text-xl font-semibold text-blue-800">
										Seller Profile
									</h3>
								</div>
								{userData.SellerProfile.isVerified && (
									<div className="flex items-center space-x-1 text-green-600">
										<CheckCircle size={20} />
										<span className="text-sm font-medium">Verified</span>
									</div>
								)}
							</div>

							<div className="grid md:grid-cols-2 gap-6">
								{/* Business Info */}
								<div className="space-y-4">
									<h4 className="font-semibold text-blue-800 border-b border-blue-200 pb-2">
										Business Information
									</h4>
									<div className="space-y-3">
										{userData.SellerProfile.shopName && (
											<div>
												<label className="text-sm font-medium text-blue-700">
													Store Name
												</label>
												<p className="text-gray-700">
													{userData.SellerProfile.shopName}
												</p>
											</div>
										)}
										{userData.SellerProfile.companyName && (
											<div>
												<label className="text-sm font-medium text-blue-700">
													Company Name
												</label>
												<p className="text-gray-700">
													{userData.SellerProfile.companyName}
												</p>
											</div>
										)}
										{userData.SellerProfile.businessRegisteredName && (
											<div>
												<label className="text-sm font-medium text-blue-700">
													Registered Name
												</label>
												<p className="text-gray-700">
													{userData.SellerProfile.businessRegisteredName}
												</p>
											</div>
										)}
										{userData.SellerProfile.description && (
											<div>
												<label className="text-sm font-medium text-blue-700">
													Description
												</label>
												<p className="text-gray-700 text-sm leading-relaxed">
													{userData.SellerProfile.description}
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Contact & Rating */}
								<div className="space-y-4">
									<h4 className="font-semibold text-blue-800 border-b border-blue-200 pb-2">
										Contact & Performance
									</h4>
									<div className="space-y-3">
										{userData.SellerProfile.businessEmail && (
											<div className="flex items-center space-x-3">
												<Mail className="text-blue-400" size={18} />
												<span className="text-gray-700 text-sm">
													{userData.SellerProfile.businessEmail}
												</span>
											</div>
										)}
										{userData.SellerProfile.businessPhoneNumber && (
											<div className="flex items-center space-x-3">
												<Phone className="text-blue-400" size={18} />
												<span className="text-gray-700 text-sm">
													{userData.SellerProfile.businessPhoneNumber}
												</span>
											</div>
										)}
										{userData.SellerProfile.StoreRatingSummary && (
											<div className="flex items-center space-x-3">
												<Star className="text-yellow-400" size={18} />
												<span className="text-gray-700 text-sm">
													{userData.SellerProfile.StoreRatingSummary.average.toFixed(
														1
													)}
													(
													{userData.SellerProfile.StoreRatingSummary.totalCount}{' '}
													reviews)
												</span>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Products */}
							{userData.SellerProfile.Product?.length > 0 && (
								<div className="mt-6">
									<h4 className="font-semibold text-blue-800 mb-3">
										Sample Products
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
										{userData.SellerProfile.Product.slice(0, 3).map(
											(product) => (
												<div
													key={product.id}
													className="bg-white rounded-lg p-3 border border-blue-200"
												>
													<p className="font-medium text-gray-800 text-sm">
														{product.name}
													</p>
													<p className="text-blue-600 font-semibold">
														₱
														{product.isSale
															? product.salePrice
															: product.basePrice}
													</p>
												</div>
											)
										)}
									</div>
								</div>
							)}

							{/* Addresses */}
							<div className="mt-6 grid md:grid-cols-2 gap-6">
								{userData.SellerProfile.Address && (
									<div>
										<h4 className="font-semibold text-blue-800 mb-3 flex items-center">
											<MapPin className="mr-2" size={18} />
											Business Address
										</h4>
										<div className="bg-white rounded-lg p-3 border border-blue-200">
											<p className="text-gray-700 text-sm leading-relaxed">
												{userData.SellerProfile.Address.street}
												<br />
												{userData.SellerProfile.Address.city},{' '}
												{userData.SellerProfile.Address.state}{' '}
												{userData.SellerProfile.Address.postalCode}
												<br />
												{userData.SellerProfile.Address.country}
											</p>
										</div>
									</div>
								)}

								{userData.SellerProfile.PickupAddress && (
									<div>
										<h4 className="font-semibold text-blue-800 mb-3 flex items-center">
											<Package className="mr-2" size={18} />
											Pickup Address
										</h4>
										<div className="bg-white rounded-lg p-3 border border-blue-200">
											<p className="text-gray-700 text-sm leading-relaxed">
												{userData.SellerProfile.PickupAddress.street}
												<br />
												{userData.SellerProfile.PickupAddress.city},{' '}
												{userData.SellerProfile.PickupAddress.state}{' '}
												{userData.SellerProfile.PickupAddress.postalCode}
												<br />
												{userData.SellerProfile.PickupAddress.country}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default UserProfileModal;
