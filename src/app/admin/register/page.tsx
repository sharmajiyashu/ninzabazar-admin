'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import circlebgwhite from '../../../../public/circlebg-white.png';
import circlebg from '../../../../public/circlebg.png';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const FormSchema = z.object({
	username: z.string().min(4, {
		message: 'Username must be at least 4 characters.',
	}),
	password: z.string().min(8, {
		message: 'Password must be at least 8 characters.',
	}),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword'],
});

const RegisterForm = () => {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			username: '',
			password: '',
			confirmPassword: '',
		},
	});

	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function onSubmit(values: z.infer<typeof FormSchema>) {
		try {
			setIsLoading(true);
			
			const response = await fetch('/api/admin/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: values.username,
					password: values.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setIsLoading(false);
				toast.error(data.error || 'Failed to register admin', {
					className: 'm-6',
				});
				return;
			}

			toast.success('Admin registered successfully!', { className: 'm-6' });
			router.push(ROUTES.login);
			setIsLoading(false);
		} catch (error) {
			console.log(error);
			setIsLoading(false);
			toast.error('An error occurred. Please try again.', {
				className: 'm-6',
			});
		}
	}

	return (
		<>
			<div className="flex flex-row">
				{/* Left Side - Registration Form */}
				<div className="w-[50%] overflow-hidden overflow-y-hidden">
					<div className="flex flex-col w-full items-center justify-center h-full">
						<div className="flex flex-col items-center mb-10">
							<h1 className="text-green font-extrabold text-2xl">
								Register Admin
							</h1>
							<p className="text-disabledgrey">
								Create a new admin account
							</p>
						</div>
						<div className="flex flex-col w-96 gap-5">
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="w-96 space-y-6"
								>
									<FormField
										control={form.control}
										name="username"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-bold">Username</FormLabel>
												<FormControl>
													<Input
														placeholder="Username"
														{...field}
														className="h-12"
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
												<FormLabel className="font-bold">Password</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															placeholder="Password"
															className="h-12"
															type={showPassword ? 'text' : 'password'}
															{...field}
														/>
														<button
															type="button"
															className="absolute right-2 inset-y-0  text-disabledgrey hover:text-gray-800"
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
									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="font-bold">Confirm Password</FormLabel>
												<FormControl>
													<Input
														placeholder="Confirm Password"
														className="h-12"
														type={showPassword ? 'text' : 'password'}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										type="submit"
										className="w-full h-12 bg-green hover:bg-green-800 font-semibold  rounded-2xl"
									>
										{isLoading ? 'Loading...' : 'Register'}
									</Button>
									<div className="flex justify-center">
										<Link href={ROUTES.login} className="underline text-disabledgrey hover:text-gray-800">
											Back to Login
										</Link>
									</div>
								</form>
							</Form>
						</div>
					</div>
					<div className="relative bottom-60 -left-50 bg-no-repeat bg-cover md:bg-cover overflow-hidden">
						<Image src={circlebg} alt="bg" height={500} width={500} />
					</div>
				</div>

				{/* Right Side - Logo */}
				<div className="w-[50%] bg-green overflow-hidden">
					<div className="flex items-center justify-center h-full">
						<h1 className="text-9xl text-white font-extrabold">NB</h1>
					</div>
					<div className="relative -top-280 -right-130 bg-no-repeat bg-cover md:bg-cover overflow-hidden">
						<Image src={circlebgwhite} alt="bg" height={500} width={500} />
					</div>
				</div>
			</div>
		</>
	);
};

export default RegisterForm;
