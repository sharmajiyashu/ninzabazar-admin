'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Store } from '@/app/types/store-types'; // Adjust the import path as necessary
import { API_ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { Download, Building, User, FileText, Shield } from 'lucide-react';

const getFileExtension = (filename: string): string => {
	if (!filename) return '';
	const match = filename.match(/\.\w+$/);
	return match ? match[0] : '';
};

const StoreRegistrationPage = () => {
	const searchParams = useSearchParams();
	const storeId = searchParams.get('id');
	const [storeData, setStoreData] = useState<Store | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStoreDetails = async () => {
			if (!storeId) {
				setError('No store ID provided');
				setLoading(false);
				return;
			}

			try {
				const response = await fetch(`${API_ROUTES.stores}?id=${storeId}`);
				if (!response.ok) {
					throw new Error('Failed to fetch store details');
				}

				const data = await response.json();
				setStoreData(data);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching store details:', err);
				setError('Failed to load store registration details');
				setLoading(false);
			}
		};

		fetchStoreDetails();
	}, [storeId]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex justify-center items-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading store details...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="p-6">
					<div className="max-w-md mx-auto">
						<div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-red-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<p className="font-medium">{error}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="px-6 py-4">
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-4">
							<div className="bg-green-100 p-3 rounded-lg">
								<Building className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									Store Registration Details
								</h1>
								<p className="text-sm text-gray-500">
									Review store registration information
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="p-6">
				{storeData && (
					<div className="max-w-6xl mx-auto">
						<div className="bg-white rounded-lg shadow-sm border overflow-hidden">
							{/* Store Information Section */}
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center space-x-3 mb-6">
									<div className="bg-blue-100 p-2 rounded-lg">
										<Building className="h-5 w-5 text-blue-600" />
									</div>
									<h2 className="text-xl font-semibold text-gray-900">
										Store Information
									</h2>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div>
											<p className="text-sm font-medium text-gray-500 mb-1">
												Store Name
											</p>
											<p className="text-gray-900 font-medium">
												{storeData.storeName}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500 mb-1">
												Business Type
											</p>
											<p className="text-gray-900">{storeData.businessType}</p>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500 mb-1">
												Business Email
											</p>
											<p className="text-gray-900">{storeData.businessEmail}</p>
										</div>
									</div>
									<div className="space-y-4">
										<div>
											<p className="text-sm font-medium text-gray-500 mb-1">
												Business Address
											</p>
											<p className="text-gray-900">
												{storeData.businessAddress}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500 mb-1">
												Business Phone/Telephone
											</p>
											<p className="text-gray-900">
												{storeData.businessPhoneNumber}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Owner Information Section */}
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center space-x-3 mb-6">
									<div className="bg-purple-100 p-2 rounded-lg">
										<User className="h-5 w-5 text-purple-600" />
									</div>
									<h2 className="text-xl font-semibold text-gray-900">
										Owner Information
									</h2>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Owner
										</p>
										<p className="text-gray-900 font-medium">
											{storeData.owner}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Email
										</p>
										<p className="text-gray-900">{storeData.email}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-500 mb-1">
											Phone
										</p>
										<p className="text-gray-900">
											{storeData.contactPhone}
										</p>
									</div>
								</div>
							</div>

							{/* Policies Section */}
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center space-x-3 mb-6">
									<div className="bg-orange-100 p-2 rounded-lg">
										<Shield className="h-5 w-5 text-orange-600" />
									</div>
									<h2 className="text-xl font-semibold text-gray-900">
										Policies
									</h2>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm font-medium text-gray-500 mb-2">
											Return Policy
										</p>
										<p className="text-gray-900">{storeData.returnPolicy}</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm font-medium text-gray-500 mb-2">
											Shipping Policy
										</p>
										<p className="text-gray-900">{storeData.shippingPolicy}</p>
									</div>
								</div>
							</div>

							{/* Business Documents Section */}
							<div className="p-6">
								<div className="flex items-center space-x-3 mb-6">
									<div className="bg-green-100 p-2 rounded-lg">
										<FileText className="h-5 w-5 text-green-600" />
									</div>
									<h2 className="text-xl font-semibold text-gray-900">
										Business Documents
									</h2>
								</div>

								<div className="space-y-4">
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm font-medium text-gray-500 mb-2">
											Document Type
										</p>
										<p className="text-gray-900 font-medium">
											{storeData.businessType || 'Not specified'}
										</p>
									</div>
									<div>
										{storeData.businessDocumentFile ? (
											<Link
												href={`${API_ROUTES.storeDocument}?id=${storeData.id}`}
												download={`business-document-${
													storeData.id
												}${getFileExtension(storeData.businessDocumentFile)}`}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
											>
												<Download className="h-5 w-5 mr-2" />
												Download Business Document
											</Link>
										) : (
											<div className="inline-flex items-center px-6 py-3 bg-red-50 border border-red-200 rounded-lg">
												<svg
													className="h-5 w-5 text-red-400 mr-2"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.994-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
													/>
												</svg>
												<p className="text-sm text-red-600 font-medium">
													No document available
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default StoreRegistrationPage;
