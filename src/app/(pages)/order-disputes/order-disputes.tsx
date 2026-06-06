'use client';

import React, { useState } from 'react';
import { Package, ShoppingCart } from 'lucide-react';
import OrdersTable from './tabs/orders-table';

const OrdersAndDisputes: React.FC = () => {
	const [activeTab, setActiveTab] = useState<'orders' | 'disputes'>('orders');

	const tabs = [
		{ key: 'orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
		// { key: 'disputes', label: 'Disputes', icon: <Gavel size={20} /> },
	];

	return (
		<div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-4 py-3">
				<div className="flex items-center justify-between">
					<h1 className="text-lg font-bold text-gray-900">Order Management</h1>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex space-x-4 border-b border-gray-200 bg-gray-50 px-4 pt-3">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						onClick={() => setActiveTab(tab.key as 'orders' | 'disputes')}
						className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.key
							? 'border-green-600 text-green-600'
							: 'border-transparent text-gray-600 hover:text-green-600'
							}`}
					>
						{tab.icon}
						{tab.label}
					</button>
				))}
			</div>

			{/* Table */}
			<div className="p-4">
				{activeTab === 'orders' && <OrdersTable />}
				{/* {activeTab === 'disputes' && <DisputesTable />} */}
			</div>
		</div>
	);
};

export default OrdersAndDisputes;
