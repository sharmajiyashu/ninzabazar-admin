'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const FormSchema = z.object({
	username: z.string().min(4, {
		message: 'Username must be at least 4 characters.',
	}),
	password: z.string().min(8, {
		message: 'Password must be at least 8 characters.',
	}),
});

const InputForm = () => {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			username: 'admin@gmail.com',
			password: 'Admin@123',
		},
	});

	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const router = useRouter();
	const { status } = useSession();

	// Redirect to dashboard if already logged in
	useEffect(() => {
		if (status === 'authenticated') {
			router.push('/user-management');
		}
	}, [status, router]);

	async function onSubmit(values: z.infer<typeof FormSchema>) {
		try {
			setIsLoading(true);
			setErrorMessage(null);
			const response = await signIn('credentials', {
				redirect: false,
				username: values.username,
				password: values.password,
			});

			if (!response?.ok) {
				setIsLoading(false);
				const errorMsg = response?.error || 'Incorrect username or password';
				setErrorMessage(errorMsg);
				toast.error(errorMsg, {
					className: 'm-6',
				});
				return;
			}
			toast.success(`Welcome ${values.username}!`, { className: 'm-6' });
			router.push('/user-management');
			setIsLoading(false);
		} catch (error) {
			console.log(error);
			setErrorMessage('An unexpected error occurred. Please try again.');
			setIsLoading(false);
		}
	}

	if (status === 'loading' || status === 'authenticated') {
		return <div className="flex h-screen items-center justify-center">Loading...</div>;
	}

	return (
		<div className="relative flex min-h-screen w-full flex-col md:flex-row bg-[#006d44] overflow-hidden font-sans">
			<style dangerouslySetInnerHTML={{
				__html: `
				@keyframes float-animation {
					0%, 100% { transform: translateY(0px) rotate(0deg); }
					50% { transform: translateY(-15px) rotate(1deg); }
				}
				.animate-float {
					animation: float-animation 6s ease-in-out infinite;
				}
			`}} />

			{/* Left Side: 3D Illustration (Hidden on mobile) */}
			<div className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-12 relative z-10 select-none">
				<div className="animate-float relative w-full max-w-lg aspect-square flex items-center justify-center">
					<Image
						src="/img/authentication/shopping_cart_3d.png"
						alt="Ninja Bazaar Shopping Cart"
						width={550}
						height={550}
						priority
						className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
					/>
				</div>
			</div>

			{/* Right Side: Login Card & Branding */}
			<div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 min-h-screen md:min-h-0">
				<div className="w-full max-w-md flex flex-col items-center">
					{/* Logo / Branding */}
					<h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-wide drop-shadow-sm select-none">
						Ninja Bazaar
					</h1>

					{/* White login card */}
					<div className="w-full bg-white rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-white/10">
						<div className="text-center mb-6">
							<h2 className="text-2xl font-bold text-gray-900 mb-1">
								Admin Dashboard
							</h2>
							<p className="text-sm text-gray-500 font-medium">
								Log in to manage the platform
							</p>
						</div>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="w-full space-y-6"
							>
								<FormField
									control={form.control}
									name="username"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="font-bold text-gray-700">Username</FormLabel>
											<FormControl>
												<Input
													placeholder="admin@gmail.com"
													{...field}
													className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#006d44]"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="font-bold text-gray-700">Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														placeholder="••••••••"
														className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#006d44]"
														type={showPassword ? 'text' : 'password'}
														{...field}
													/>
													<button
														type="button"
														className="absolute right-3 inset-y-0 text-gray-400 hover:text-gray-600 transition-colors"
														onClick={() => setShowPassword((prev) => !prev)}
													>
														{showPassword ? (
															<EyeOff className="w-5 h-5" />
														) : (
															<Eye className="w-5 h-5" />
														)}
													</button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									disabled={isLoading}
									className="w-full h-12 bg-[#006d44] hover:bg-[#005a38] text-white font-bold text-lg rounded-2xl transition-colors disabled:opacity-70 mt-2"
								>
									{isLoading ? 'Authenticating...' : 'Login'}
								</Button>

								{errorMessage && (
									<div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
										{errorMessage}
									</div>
								)}
							</form>
						</Form>

						{/* Links have been completely removed as requested */}
					</div>
				</div>
			</div>
		</div>
	);
};

export default InputForm;
