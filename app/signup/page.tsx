// app/signup/page.tsx
// Sign Up Page - app/page-path: /signup
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpSchema } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogle = () => {
    console.log('Google Sign Up');
  };

  const handleApple = () => {
    console.log('Apple Sign Up');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const result = SignUpSchema.safeParse({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeToTerms,
      });

      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.errors.forEach((error) => {
          const field = error.path[0] as string;
          newErrors[field] = error.message;
        });
        setErrors(newErrors);
        toast.error('Please fix form errors and try again.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Sign up failed');
        setIsLoading(false);
        return;
      }
      toast.success('Account created! Please sign in.');
      router.push('/signin');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[50%] items-center justify-center px-10">
        <div className="w-[692px] h-[898px] rounded-4xl overflow-hidden shadow-xl border border-[#E6E7EB] bg-white">
          <Image
            src="/illustrator.png"
            alt="Illustrator"
            width={692}
            height={898}
            className="object-cover h-full w-full"
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full flex items-center justify-center py-8 px-4 sm:px-8 lg:w-[50%]">
        <div className="w-full max-w-[602px] sm:rounded-2xl sm:shadow-md sm:border sm:border-[#E6E7EB] bg-white p-4 sm:p-8">
          {/* LOGO */}
          <div className="flex justify-center lg:justify-start mb-4 lg:mb-0 -ml-0 lg:-ml-9">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={120}
              className="mx-auto lg:mx-0"
            />
          </div>

          {/* HEADINGS */}
          <div className="mb-7">
            <h1 className="text-[28px] font-bold text-black mb-2">
              Create an account
            </h1>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              Let’s get you started with premium logistics access
            </p>
          </div>

          {/* Global errors are shown via toast */}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* FULL NAME */}
            <div>
              <label className="block text-[13px] font-medium text-gray-950 mb-2">
                Full Name
              </label>

              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>

                <input
                  className={`w-full pl-11 pr-4 h-[44px] text-[14px] border rounded-[10px] transition-all
                    ${errors.fullName ? "border-red-300 bg-red-50" : "border-gray-300"}
                    focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="Olivia Smith"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-[13px] font-medium text-gray-950 mb-2">
                Email
              </label>

              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>

                <input
                  className={`w-full pl-11 pr-4 h-[44px] text-[14px] border rounded-[10px] transition-all
                    ${errors.email ? "border-red-300 bg-red-50" : "border-gray-300"}
                    focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="olivia@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[13px] font-medium text-gray-950 mb-2">
                Password
              </label>

              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>

                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-11 pr-12 h-[44px] text-[14px] border rounded-[10px] transition-all
                    ${errors.password ? "border-red-300 bg-red-50" : "border-gray-300"}
                    focus:ring-2 focus:ring-orange-500`}
                  placeholder="***********"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-[13px] font-medium text-gray-950 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full pl-11 pr-12 h-[44px] text-[14px] border rounded-[10px] transition-all
                    ${errors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300"}
                    focus:ring-2 focus:ring-orange-500`}
                  placeholder="***********"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* TERMS */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="sr-only"
              />

              <div
                className={`w-4 h-4 border-2 rounded-full flex items-center justify-center
                  ${agreeToTerms ? "bg-orange-500 border-orange-500" : "border-gray-300"} `}
              >
                {agreeToTerms && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                      d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <span className="ml-2 text-[13px] text-gray-700">
                I agree to the Terms & Privacy Policy
              </span>
            </label>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full h-[50px] bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-[10px] shadow-sm hover:shadow-md transition-all"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

       

          {/* SOCIAL LOGINS */}
        

          {/* SIGN IN LINK */}
          <p className="mt-8 text-center text-[14px] text-gray-600">
            Already have an account?{" "}
            <Link href="/signin" className="text-orange-500 font-semibold hover:text-orange-600">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
