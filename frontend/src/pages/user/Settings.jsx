import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Trash2, LogOut, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { logout } from '../../redux/slices/authSlice';
import { logoutApi } from '../../services/auth.api';
import { deleteAccountApi } from '../../services/user.api';
import { sendVerificationEmailApi as sendVerifApi } from '../../services/auth.api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(s => s.theme);
  const { user } = useSelector(s => s.auth);
  const [delModal, setDelModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingVerif, setSendingVerif] = useState(false);

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccountApi();
      dispatch(logout());
      toast.success('Account deleted.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
      setDelModal(false);
    }
  };

  const handleResendVerification = async () => {
    setSendingVerif(true);
    try {
      const res = await sendVerifApi();
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setSendingVerif(false);
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>

      {/* Appearance */}
      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Appearance</h3>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Theme</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{theme === 'dark' ? 'Dark mode is on' : 'Light mode is on'}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Account</h3>
        <div className="space-y-3">
          {/* Verification */}
          {!user?.isVerified && user?.provider !== 'GOOGLE' && (
            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Email not verified</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Verify to access all features</p>
                </div>
              </div>
              <Button variant="warning" size="sm" loading={sendingVerif} onClick={handleResendVerification}>
                Resend
              </Button>
            </div>
          )}

          {/* Logout */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Sign out</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sign out of your account</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 dark:border-red-900">
        <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Delete Account</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">This action is permanent and cannot be undone</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDelModal(true)}>
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={delModal} onClose={() => setDelModal(false)} title="Delete Account" size="sm">
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Are you sure you want to permanently delete your account? All your referrals, reward points, and data will be lost.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDelModal(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDeleteAccount}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
