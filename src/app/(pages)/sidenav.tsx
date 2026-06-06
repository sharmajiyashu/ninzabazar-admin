'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Users,
	Package,
	Store,
	ShoppingCart,
	Shield,
	// HelpCircle,
	User,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

const SideNav = () => {
	const pathname = usePathname();

	const navItems = [
		{
			name: 'User Management',
			href: '/user-management',
			icon: Users,
		},
		{
			name: 'Product Approval',
			href: '/product-approval',
			icon: Package,
		},
		{
			name: 'Store Approval',
			href: '/store-approval',
			icon: Store,
		},
		{
			name: 'Order Management',
			href: '/order-disputes',
			icon: ShoppingCart,
		},
		{
			name: 'Escrow Management',
			href: '/escrow-management',
			icon: Shield,
		},
		// {
		// 	name: 'Help Center',
		// 	href: '/',
		// 	icon: HelpCircle,
		// },
	];

	const { data: session } = useSession();

	return (
		<div className="bg-gradient-to-b from-green to-green-800 h-full flex flex-col w-64 shadow-lg">
			{/* Profile Section */}
			<div className="px-6 py-8 border-b border-white">
				<div className="flex items-center space-x-3">
					<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
						<User className="w-6 h-6 text-green-700" />
					</div>
					<div>
						<p className="text-white font-semibold">{session?.user.name}</p>
						<p className="text-green-200 text-sm">Administrator</p>
					</div>
				</div>
			</div>

			{/* Navigation Items */}
			<nav className="flex-1 px-4 py-6">
				<ul className="space-y-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive =
							(pathname === '/' && item.href === '/user-management') ||
							pathname === item.href;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
										isActive
											? 'bg-white text-green-700 shadow-md font-medium'
											: 'text-green-100 hover:bg-green-600 hover:text-white'
									}`}
								>
									<Icon
										size={20}
										className={`${
											isActive
												? 'text-green-700'
												: 'text-green-200 group-hover:text-white'
										}`}
									/>
									<span className="text-sm font-medium">{item.name}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Footer */}
			<div className="px-6 py-4 border-t border-green-600">
				<div className="text-center">
					<p className="text-green-200 text-xs">© 2025 Ninja Bazaar</p>
				</div>
			</div>
		</div>
	);
};

export default SideNav;
