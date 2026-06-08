'use client';

import React, { memo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { ROUTES } from '@/constants/routes';
import { loginWithCredentials } from '@/lib/auth-client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Eye, EyeOff } from 'lucide-react';

const FormSchema = z.object({
  username: z.string().min(4, {
    message: 'Username must be at least 4 characters.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginWithCredentials(values.username, values.password);

      if (!result.ok) {
        setErrorMessage(result.error);
        toast.error(result.error, { className: 'm-6' });
        setIsLoading(false);
        return;
      }

      window.location.href = ROUTES.dashboard;
    } catch (error) {
      console.error(error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col md:flex-row bg-[#006d44] overflow-hidden font-sans">
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-12 relative z-10 select-none">
        <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
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

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 min-h-screen md:min-h-0">
        <div className="w-full max-w-md flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-wide drop-shadow-sm select-none">
            Ninja Bazaar
          </h1>

          <div className="w-full bg-white rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col border border-white/10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Admin Dashboard
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Log in to manage the platform
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-gray-700">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@example.com"
                          autoComplete="username"
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
                            autoComplete="current-password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 inset-y-0 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  className="w-full h-12 bg-[#006d44] hover:bg-[#005a38] text-white font-bold text-lg rounded-2xl disabled:opacity-70 mt-2"
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(LoginForm);
