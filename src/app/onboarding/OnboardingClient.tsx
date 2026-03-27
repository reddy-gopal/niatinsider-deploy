"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  fetchMe,
  fetchFoundingEditorProfile,
  updateFoundingEditorProfile,
  type MeProfile,
  type FoundingEditorProfile,
} from '@/lib/authApi';
import { useCampuses } from '@/hooks/useCampuses';
import { CampusSelector } from '@/components/onboarding/CampusSelector';
import type { CampusListItem } from '@/types/campusApi';

const START_YEAR = 2024;
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) => START_YEAR + i);

const EMPTY: FoundingEditorProfile = {
  linkedin_profile: '',
  campus_id: null,
  campus_name: '',
  year_joined: null,
};

export default function OnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/';
  const { campuses } = useCampuses();
  const [me, setMe] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FoundingEditorProfile>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe().then((user) => {
      if (!user) {
        router.replace('/');
        return;
      }
      setMe(user);
      if (user.role !== 'founding_editor') {
        router.replace('/');
        return;
      }
      fetchFoundingEditorProfile().then((p) => {
        if (p) setForm({ ...EMPTY, ...p });
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.campus_id == null) {
      setError('Please select your campus.');
      return;
    }
    if (!form.linkedin_profile?.trim()) {
      setError('LinkedIn profile URL is required.');
      return;
    }
    if (form.year_joined == null) {
      setError('Please select year of joining.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        campus_name:
          form.campus_id != null
            ? (campuses.find((c: CampusListItem) => String(c.id) === String(form.campus_id))?.name ?? '')
            : '',
      };
      await updateFoundingEditorProfile(payload);
      document.cookie = 'niat_onboarded=true; path=/; max-age=31536000';
      document.cookie = 'niat_needs_onboarding=; path=/; max-age=0';
      window.dispatchEvent(new Event('niat:auth'));
      router.replace(from);
    } catch (err) {
      const res = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(res.response?.data?.detail ?? res.message ?? 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!me || me.role !== 'founding_editor') return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]" role="status" aria-label="Loading" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-[rgba(30,41,59,0.1)] p-8 shadow-sm" style={{ backgroundColor: '#fff8eb' }}>
          <h1 className="font-playfair text-2xl font-bold text-[#1e293b] mb-1">Complete your profile</h1>
          <p className="text-[#64748b] text-sm mb-6">
            Select your campus, add your LinkedIn profile, and year of joining.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                {error}
              </div>
            )}
            <div>
              <label id="onb_campus_label" className="block text-sm font-medium text-[#1e293b] mb-1">
                Select your College <span className="text-red-600">*</span>
              </label>
              <CampusSelector
                value={form.campus_id != null ? String(form.campus_id) : null}
                onChange={(id) => setForm((f) => ({ ...f, campus_id: id }))}
              />
              <p className="text-xs text-[#64748b] mt-1.5">This will be used as the default when you write articles.</p>
            </div>
            <div>
              <label htmlFor="onb_linkedin" className="block text-sm font-medium text-[#1e293b] mb-1">
                LinkedIn profile <span className="text-red-600">*</span>
              </label>
              <input
                id="onb_linkedin"
                type="url"
                required
                value={form.linkedin_profile}
                onChange={(e) => setForm((f) => ({ ...f, linkedin_profile: e.target.value }))}
                className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label htmlFor="onb_year_joined" className="block text-sm font-medium text-[#1e293b] mb-1">
                Year of joining <span className="text-red-600">*</span>
              </label>
              <select
                id="onb_year_joined"
                required
                value={form.year_joined ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, year_joined: e.target.value ? parseInt(e.target.value, 10) : null }))}
                className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
              >
                <option value="">Select year</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[#991b1b] text-white font-medium hover:bg-[#7f1d1d] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Complete profile'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
