import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Trash2, Save, Lock, Eye, EyeOff, User, Phone, CreditCard, Building2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProfileApi, updateProfileApi, changePasswordApi, deleteProfileImageApi } from '../../services/user.api';
import { updateUser } from '../../redux/slices/authSlice';
import { updateProfileSchema, changePasswordSchema } from '../../validation/profile.validation';
import { formatDate, getInitials } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { ProfileLoader } from '../../components/common/Loaders';
import Modal from '../../components/common/Modal';

export default function Profile() {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector(s => s.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [delImageLoading, setDelImageLoading] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showPwds, setShowPwds] = useState({ current: false, new: false, confirm: false });
  const fileInputRef = useRef();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(updateProfileSchema),
  });

  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, formState: { errors: pwdErrors } } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfileApi();
      const p = res.data.user;
      setProfile(p);
      reset({
        name: p.name || '',
        userName: p.userName || '',
        mobileNumber: p.mobileNumber || '',
        upiId: p.upiId || '',
        accountHolderName: p.bankDetails?.accountHolderName || '',
        accountNumber: p.bankDetails?.accountNumber || '',
        ifscCode: p.bankDetails?.ifscCode || '',
        bankName: p.bankDetails?.bankName || '',
      });
    } catch (err) {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, JPG, WEBP formats supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB.');
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (selectedFile) formData.append('profileImage', selectedFile);
      const res = await updateProfileApi(formData);
      const updated = res.data.user;
      setProfile(updated);
      dispatch(updateUser(updated));
      setImagePreview(null);
      setSelectedFile(null);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    setDelImageLoading(true);
    try {
      await deleteProfileImageApi();
      setProfile(p => ({ ...p, profileImage: { url: '', fileId: '' } }));
      dispatch(updateUser({ profileImage: { url: '', fileId: '' } }));
      setImagePreview(null);
      toast.success('Profile image removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete image.');
    } finally {
      setDelImageLoading(false);
    }
  };

  const onChangePwd = async (data) => {
    setPwdSaving(true);
    try {
      const res = await changePasswordApi(data);
      toast.success(res.data.message);
      resetPwd();
      setPwdModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) return <ProfileLoader />;

  const avatarUrl = imagePreview || profile?.profileImage?.url;

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      {/* Header Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{getInitials(profile?.name)}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white shadow-md transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile?.name}</h2>
              <Badge status={profile?.role} />
              <Badge status={profile?.ambassadorLevel} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{profile?.userName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="text-center">
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{profile?.rewardPoints}</p>
                <p className="text-xs text-slate-500">Points</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{profile?.totalReferrals}</p>
                <p className="text-xs text-slate-500">Referrals</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{profile?.referralCode}</p>
                <p className="text-xs text-slate-500">Ref Code</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {profile?.profileImage?.url && (
              <Button variant="danger" size="sm" loading={delImageLoading} onClick={handleDeleteImage}>
                <Trash2 className="w-4 h-4" /> Remove Photo
              </Button>
            )}
            {profile?.provider !== 'GOOGLE' && (
              <Button variant="secondary" size="sm" onClick={() => setPwdModal(true)}>
                <Lock className="w-4 h-4" /> Change Password
              </Button>
            )}
          </div>
        </div>

        {!profile?.isProfileCompleted && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Complete your profile to unlock all features including withdrawals.
          </div>
        )}
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" /> Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
          <Input label="Username" placeholder="johndoe" error={errors.userName?.message} {...register('userName')} />
          <Input label="Mobile Number" placeholder="+91xxxxxxxxxx" error={errors.mobileNumber?.message} {...register('mobileNumber')} />
          <Input label="UPI ID" placeholder="yourname@upi" error={errors.upiId?.message} {...register('upiId')} />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-indigo-500" /> Bank Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Account Holder Name" placeholder="John Doe" error={errors.accountHolderName?.message} {...register('accountHolderName')} />
            <Input label="Account Number" placeholder="1234567890" error={errors.accountNumber?.message} {...register('accountNumber')} />
            <Input label="IFSC Code" placeholder="SBIN0001234" error={errors.ifscCode?.message} {...register('ifscCode')} />
            <Input label="Bank Name" placeholder="State Bank of India" error={errors.bankName?.message} {...register('bankName')} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </form>

      {/* Info card */}
      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Member Since', value: formatDate(profile?.createdAt) },
            { label: 'Last Login', value: formatDate(profile?.lastLogin) },
            { label: 'Provider', value: profile?.provider },
            { label: 'Email Verified', value: profile?.isVerified ? 'Yes ✓' : 'No ✗' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-slate-500 dark:text-slate-400">{label}</p>
              <p className="font-medium text-slate-900 dark:text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={pwdModal} onClose={() => { setPwdModal(false); resetPwd(); }} title="Change Password" size="sm">
        <form onSubmit={handlePwdSubmit(onChangePwd)} className="space-y-4">
          {['current', 'new', 'confirm'].map((field) => (
            <div key={field} className="relative">
              <Input
                label={{ current: 'Current Password', new: 'New Password', confirm: 'Confirm New Password' }[field]}
                type={showPwds[field] ? 'text' : 'password'}
                placeholder="••••••••"
                error={pwdErrors[{ current: 'currentPassword', new: 'newPassword', confirm: 'confirmPassword' }[field]]?.message}
                {...registerPwd({ current: 'currentPassword', new: 'newPassword', confirm: 'confirmPassword' }[field])}
              />
              <button type="button" onClick={() => setShowPwds(p => ({ ...p, [field]: !p[field] }))} className="absolute right-3 top-9 text-slate-400">
                {showPwds[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setPwdModal(false); resetPwd(); }}>Cancel</Button>
            <Button type="submit" loading={pwdSaving} className="flex-1">Update Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
