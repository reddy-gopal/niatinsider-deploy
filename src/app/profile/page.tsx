"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const EMPTY_PROFILE: FoundingEditorProfile = {
  linkedin_profile: '',
  campus_id: null,
  campus_name: '',
  year_joined: null,
};

export default function Profile() {
  const router = useRouter();
  const { campuses } = useCampuses();
  const [me, setMe] = useState<MeProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<FoundingEditorProfile>(EMPTY_PROFILE);
  const [saved, setSaved] = useState(false);

  const isFoundingEditor = me?.role === 'founding_editor';

  useEffect(() => {
    fetchMe().then((user) => {
      if (!user) {
        router.replace('/');
        return;
      }
      setMe(user);
      if (user.role === 'founding_editor') {
        fetchFoundingEditorProfile().then((p) => {
          setEditForm(p ?? EMPTY_PROFILE);
          setProfileLoading(false);
        });
      } else {
        setProfileLoading(false);
      }
    });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFoundingEditor || saving) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        ...editForm,
        campus_name:
          editForm.campus_id != null
            ? (campuses.find((c: CampusListItem) => String(c.id) === String(editForm.campus_id))?.name ?? '')
            : '',
      };
      const updated = await updateFoundingEditorProfile(payload);
      setEditForm(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (!me) return null;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-playfair text-2xl font-bold text-[#1e293b] mb-2">Profile</h1>
        <p className="text-[#64748b] mb-8">Your account and profile details.</p>

        <section className="mb-8 p-6 rounded-xl border border-[rgba(30,41,59,0.1)]">
          <h2 className="font-display text-lg font-semibold text-[#1e293b] mb-4">Account</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-[#64748b]">Username</dt>
              <dd className="font-medium text-[#1e293b]">{me.username}</dd>
            </div>
            {me.email && (
              <div>
                <dt className="text-[#64748b]">Email</dt>
                <dd className="font-medium text-[#1e293b]">{me.email}</dd>
              </div>
            )}
            <div>
              <dt className="text-[#64748b]">Role</dt>
              <dd className="font-medium text-[#1e293b]">{me.role.replace('_', ' ')}</dd>
            </div>
          </dl>
        </section>

        {isFoundingEditor && (
          <section className="p-6 rounded-xl border border-[rgba(30,41,59,0.1)]">
            <h2 className="font-display text-lg font-semibold text-[#1e293b] mb-4">Profile details</h2>
            {profileLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]" role="status" aria-label="Loading" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label id="profile_campus_label" className="block text-sm font-medium text-[#1e293b] mb-1">
                    Campus
                  </label>
                  <CampusSelector
                    value={editForm.campus_id != null ? String(editForm.campus_id) : null}
                    onChange={(id) => setEditForm((f) => ({ ...f, campus_id: id }))}
                  />
                </div>
                <div>
                  <label htmlFor="linkedin_profile" className="block text-sm font-medium text-[#1e293b] mb-1">
                    LinkedIn profile
                  </label>
                  <input
                    id="linkedin_profile"
                    type="url"
                    value={editForm.linkedin_profile}
                    onChange={(e) => setEditForm((f) => ({ ...f, linkedin_profile: e.target.value }))}
                    className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label htmlFor="year_joined" className="block text-sm font-medium text-[#1e293b] mb-1">
                    Year of joining
                  </label>
                  <select
                    id="year_joined"
                    value={editForm.year_joined ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, year_joined: e.target.value ? parseInt(e.target.value, 10) : null }))}
                    className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                  >
                    <option value="">Select year</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#7f1d1d] disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  {saved && <span className="text-sm text-green-600">Saved.</span>}
                </div>
              </form>
            )}
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
