'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { User, ChevronDown } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';

const NavigationBar = () => {
	const [isMenuOpen, setMenuOpen] = useState(false);
	const { data: session } = useSession();

	return (
		<header className="flex items-center justify-between px-6 py-6 border-b border-gray-200 shadow md:px-16 lg:px-10">
			<Link href={'/'}>
				<h1 className="text-xl font-bold text-green md:text-3xl">
					Ninja Bazaar
				</h1>
			</Link>

			<div className="flex md:gap-6">
				{!session ? (
					<Link
						href="/login"
						className="flex items-center gap-2 transition-colors hover:text-green"
					>
						<User size={20} />
						<span>Login</span>
					</Link>
				) : (
					<DropdownMenu open={isMenuOpen} onOpenChange={setMenuOpen}>
						<DropdownMenuTrigger asChild>
							<div className="relative flex items-center gap-2 cursor-pointer">
								<span className="text-gray-600 text-sm">
									{session.user?.name}
								</span>

								<ChevronDown className="w-4 h-4 text-gray-600" />
							</div>
						</DropdownMenuTrigger>

						<DropdownMenuContent className="absolute z-40 w-40 py-2 bg-white border border-gray-200 rounded-lg shadow-lg top-2 -right-8">
							<DropdownMenuLabel className="px-4 py-2 font-semibold text-gray-700">
								Welcome {session.user?.name}!
							</DropdownMenuLabel>
							<DropdownMenuSeparator />

							<DropdownMenuItem
								onClick={() => signOut()}
								className="px-4 py-2 text-red-600 rounded-md cursor-pointer"
							>
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</header>
	);
};

export default NavigationBar;
//
