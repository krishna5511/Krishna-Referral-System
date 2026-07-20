import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Share2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPasswordSchema } from '../../validation/auth.validation';
import { resetPasswordApi } from '../../services/auth.api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await resetPasswordApi(token, data);
      setDone(true);
      toast.success(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reset password</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Enter your new password</p>
        </div>

        <div className="card shadow-xl">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Password Reset!</h2>
              <p className="text-sm text-slate-500 mb-4">Redirecting to login...</p>
              <Link to="/login" className="btn-primary inline-flex">Go to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  error={errors.password?.message}
                  required
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-9 text-slate-400">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your new password"
                  error={errors.confirmPassword?.message}
                  required
                  {...register('confirmPassword')}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-9 text-slate-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Reset Password
              </Button>
              <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-indigo-600 mt-2">
                Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
