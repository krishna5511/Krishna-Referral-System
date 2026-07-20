import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPasswordSchema } from '../../validation/auth.validation';
import { forgotPasswordApi } from '../../services/auth.api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await forgotPasswordApi(data);
      setSent(true);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Forgot password?</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">We&apos;ll send you a reset link</p>
        </div>

        <div className="card shadow-xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                A password reset link has been sent to your email. Please check your inbox.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your registered email"
                error={errors.email?.message}
                required
                {...register('email')}
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Reset Link
              </Button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mt-2">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
