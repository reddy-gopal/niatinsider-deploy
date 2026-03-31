"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
} from "@/lib/authApi";

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { detail?: string } } }).response;
    if (res?.data?.detail && typeof res.data.detail === "string") return res.data.detail;
  }
  return "Something went wrong. Please try again.";
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const phoneDigits = phoneNumber.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 10;

  const handleRequestOtp = async () => {
    if (!isPhoneValid) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await requestForgotPasswordOtp(phoneDigits);
      setOtpSent(true);
      setMessage(res.detail);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!code.trim()) {
      setError("Enter OTP code.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await verifyForgotPasswordOtp(phoneDigits, code.trim());
      setOtpVerified(true);
      setMessage("Phone verified. Continue to reset password.");
      setStep(2);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      setError("Verify OTP before resetting password.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await resetPasswordWithOtp({
        phone_number: phoneDigits,
        code: code.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(res.detail);
      setTimeout(() => router.replace("/login"), 900);
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
        <div className="rounded-2xl border border-[rgba(30,41,59,0.1)] p-5 sm:p-8 shadow-sm" style={{ backgroundColor: "#fff8eb" }}>
          <h1 className="font-playfair text-2xl font-bold text-[#1e293b] mb-2">Forgot password</h1>
          <p className="text-sm text-[#64748b] mb-6">Verify your mobile number, then set a new password.</p>

          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-[#991b1b]" : "bg-[#e2e8f0]"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-[#991b1b]" : "bg-[#e2e8f0]"}`} />
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="forgot-phone" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                  Mobile number
                </label>
                <input
                  id="forgot-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setError(null);
                  }}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                />
              </div>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={!isPhoneValid || loading}
                className="w-full rounded-xl bg-[#991b1b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              {otpSent && (
                <div>
                  <label htmlFor="forgot-otp" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                    OTP code
                  </label>
                  <input
                    id="forgot-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError(null);
                    }}
                    placeholder="Enter 6-digit OTP"
                    className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={!code.trim() || loading}
                    className="mt-3 w-full rounded-xl border border-[#991b1b] text-[#991b1b] px-4 py-2.5 text-sm font-medium hover:bg-[#fbf2f3] disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="forgot-new-password" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                  New password
                </label>
                <input
                  id="forgot-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                />
              </div>
              <div>
                <label htmlFor="forgot-confirm-password" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                  Confirm password
                </label>
                <input
                  id="forgot-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#991b1b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}

          {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">{error}</p>}
          {message && <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2.5 rounded-xl">{message}</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
