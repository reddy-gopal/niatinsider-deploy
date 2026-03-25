"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { loginByPhonePassword, setTokens } from '@/lib/authApi';

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { detail?: string } } }).response;
    if (res?.data?.detail && typeof res.data.detail === 'string') return res.data.detail;
  }
  return 'Something went wrong. Please try again.';
}

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextUrl = searchParams.get('from') ?? '/';

  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length === 10;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    const p = phoneDigits;
    setError(null);
    setLoading(true);
    try {
      const { access, refresh } = await loginByPhonePassword(p, password);
      setTokens(access, refresh);
      window.dispatchEvent(new Event('niat:auth'));
      router.replace(nextUrl.startsWith('/') ? nextUrl : '/');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <main className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full min-w-0">
        <div
          className="rounded-2xl border border-[rgba(30,41,59,0.1)] p-5 sm:p-8 shadow-sm"
          style={{ backgroundColor: '#fff8eb' }}
        >
          <h1 className="font-playfair text-2xl font-bold text-[#1e293b] mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-[#64748b] mb-6">
            Sign in with your mobile number and password.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-phone" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                Mobile number
              </label>
              <input
                id="login-phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                  setError(null);
                }}
                placeholder="e.g. 9876543210"
                autoComplete="tel"
                className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
              />
              {phone.length > 0 && !isPhoneValid && (
                <p className="mt-1 text-xs text-red-600" role="alert">Mobile number must be exactly 10 digits.</p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 pr-10 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#1e293b] focus:outline-none rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!isPhoneValid || !password || loading}
              className="w-full rounded-xl bg-[#991b1b] px-8 py-3 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin rounded-full border-2 border-white/40 border-t-white size-4 shrink-0" role="status" aria-label="Signing in" />
                  Signing in…
                </span>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748b]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-[#991b1b] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
