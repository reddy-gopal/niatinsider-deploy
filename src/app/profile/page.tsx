"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  fetchMe,
  updateMeProfile,
  fetchFoundingEditorProfile,
  updateFoundingEditorProfile,
  changePassword,
  checkUsernameAvailability,
  requestChangePhoneOtp,
  confirmChangePhone,
  type MeProfile,
  type FoundingEditorProfile,
} from '@/lib/authApi';
import { useCampuses } from '@/hooks/useCampuses';
import { CampusSelector } from '@/components/onboarding/CampusSelector';
import type { CampusListItem } from '@/types/campusApi';
import { Settings, X } from 'lucide-react';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'password' | 'username' | 'phone'>('password');
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      setSettingsError('Current password is required.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 8) {
      setSettingsError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSettingsError('New password and confirm password do not match.');
      return;
    }
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      const res = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSettingsMessage(res.detail);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      const res = err as { response?: { data?: { detail?: string; current_password?: string; new_password?: string } } };
      setSettingsError(
        res?.response?.data?.current_password ||
          res?.response?.data?.new_password ||
          res?.response?.data?.detail ||
          'Failed to update password.'
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleCheckUsername = async () => {
    if (!newUsername.trim()) {
      setSettingsError('Enter a username to check.');
      return;
    }
    setUsernameChecking(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      const res = await checkUsernameAvailability(newUsername);
      setUsernameAvailable(res.available);
      if (res.available) setSettingsMessage('Username is available.');
      else setSettingsError('Username is not available.');
    } catch {
      setSettingsError('Failed to check username availability.');
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setSettingsError('Username is required.');
      return;
    }
    if (usernameAvailable === false) {
      setSettingsError('Please choose an available username.');
      return;
    }
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      await updateMeProfile({ username: newUsername.trim() });
      const updatedMe = await fetchMe();
      setMe(updatedMe);
      setSettingsMessage('Username has been updated.');
      setNewUsername('');
      setUsernameAvailable(null);
    } catch {
      setSettingsError('Failed to update username.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleRequestPhoneOtp = async () => {
    const digits = newPhoneNumber.replace(/\D/g, '');
    if (digits.length !== 10) {
      setSettingsError('Mobile number must be exactly 10 digits.');
      return;
    }
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      const res = await requestChangePhoneOtp(digits);
      setPhoneOtpSent(true);
      setSettingsMessage(res.detail);
    } catch (err: unknown) {
      const res = err as { response?: { data?: { detail?: string; phone_number?: string } } };
      setSettingsError(res?.response?.data?.phone_number || res?.response?.data?.detail || 'Failed to send OTP.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleConfirmPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = newPhoneNumber.replace(/\D/g, '');
    if (digits.length !== 10) {
      setSettingsError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!phoneOtpCode.trim()) {
      setSettingsError('OTP code is required.');
      return;
    }
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      const res = await confirmChangePhone(digits, phoneOtpCode.trim());
      const updatedMe = await fetchMe();
      setMe(updatedMe);
      setSettingsMessage(res.detail);
      setPhoneOtpSent(false);
      setPhoneOtpCode('');
      setNewPhoneNumber('');
    } catch (err: unknown) {
      const res = err as { response?: { data?: { detail?: string; phone_number?: string; code?: string } } };
      setSettingsError(
        res?.response?.data?.phone_number ||
          res?.response?.data?.code ||
          res?.response?.data?.detail ||
          'Failed to update phone number.'
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  if (!me) return null;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-2xl font-bold text-[#1e293b]">Profile</h1>
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(true);
              setSettingsError(null);
              setSettingsMessage(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(153,27,27,0.25)] px-3 py-2 text-[#991b1b] hover:bg-[#fbf2f3] transition-colors"
            aria-label="Open profile settings"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
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
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[rgba(30,41,59,0.1)] bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(30,41,59,0.1)]">
              <h2 className="font-display text-lg font-semibold text-[#1e293b]">Profile Settings</h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 rounded-md text-[#64748b] hover:text-[#1e293b] hover:bg-[#f8fafc]"
                aria-label="Close settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 pt-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <button type="button" onClick={() => setSettingsTab('password')} className={`px-3 py-1.5 rounded-lg text-sm border ${settingsTab === 'password' ? 'bg-[#fbf2f3] border-[#991b1b] text-[#991b1b]' : 'border-[rgba(30,41,59,0.15)] text-[#475569]'}`}>Change Password</button>
                <button type="button" onClick={() => setSettingsTab('username')} className={`px-3 py-1.5 rounded-lg text-sm border ${settingsTab === 'username' ? 'bg-[#fbf2f3] border-[#991b1b] text-[#991b1b]' : 'border-[rgba(30,41,59,0.15)] text-[#475569]'}`}>Change Username</button>
                <button type="button" onClick={() => setSettingsTab('phone')} className={`px-3 py-1.5 rounded-lg text-sm border ${settingsTab === 'phone' ? 'bg-[#fbf2f3] border-[#991b1b] text-[#991b1b]' : 'border-[rgba(30,41,59,0.15)] text-[#475569]'}`}>Change Phone</button>
              </div>
            </div>

            <div className="px-5 pb-5">
              {settingsTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                  <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                  <button type="submit" disabled={settingsLoading} className="px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#7f1d1d] disabled:opacity-60">
                    {settingsLoading ? 'Saving...' : 'Update password'}
                  </button>
                </form>
              )}

              {settingsTab === 'username' && (
                <form onSubmit={handleChangeUsername} className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" value={newUsername} onChange={(e) => { setNewUsername(e.target.value); setUsernameAvailable(null); }} placeholder="New username" className="flex-1 rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                    <button type="button" onClick={handleCheckUsername} disabled={usernameChecking || !newUsername.trim()} className="px-3 py-2 rounded-lg border border-[#991b1b] text-[#991b1b] text-sm hover:bg-[#fbf2f3] disabled:opacity-60">
                      {usernameChecking ? 'Checking...' : 'Check'}
                    </button>
                  </div>
                  {usernameAvailable === true && <p className="text-sm text-green-600">Username is available.</p>}
                  {usernameAvailable === false && <p className="text-sm text-red-600">Username is not available.</p>}
                  <button type="submit" disabled={settingsLoading || !newUsername.trim()} className="px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#7f1d1d] disabled:opacity-60">
                    {settingsLoading ? 'Saving...' : 'Update username'}
                  </button>
                </form>
              )}

              {settingsTab === 'phone' && (
                <form onSubmit={handleConfirmPhone} className="space-y-3">
                  <div className="flex gap-2">
                    <input type="tel" inputMode="numeric" maxLength={10} value={newPhoneNumber} onChange={(e) => setNewPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="New mobile number" className="flex-1 rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                    <button type="button" onClick={handleRequestPhoneOtp} disabled={settingsLoading || newPhoneNumber.replace(/\D/g, '').length !== 10} className="px-3 py-2 rounded-lg border border-[#991b1b] text-[#991b1b] text-sm hover:bg-[#fbf2f3] disabled:opacity-60">
                      {settingsLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                  {phoneOtpSent && (
                    <input type="text" inputMode="numeric" maxLength={6} value={phoneOtpCode} onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter OTP code" className="w-full rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                  )}
                  <button type="submit" disabled={settingsLoading || !phoneOtpSent || !phoneOtpCode.trim()} className="px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#7f1d1d] disabled:opacity-60">
                    {settingsLoading ? 'Updating...' : 'Confirm phone update'}
                  </button>
                </form>
              )}

              {settingsError && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">{settingsError}</p>}
              {settingsMessage && <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2.5 rounded-xl">{settingsMessage}</p>}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
