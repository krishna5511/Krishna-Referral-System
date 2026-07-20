import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, Share2, User, Mail, Phone, Lock, Gift } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { signupSchema } from '../../validation/auth.validation';
import { signupApi, googleAuthApi } from '../../services/auth.api';
import { loginSuccess } from '../../redux/slices/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { referredBy: searchParams.get('ref') || '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (!payload.referredBy) delete payload.referredBy;
      const res = await signupApi(payload);
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      toast.success('Account created! Please verify your email.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const res = await googleAuthApi({
        credential: credentialResponse.credential,
        referredBy: searchParams.get('ref') || undefined,
      });
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      toast.success(res.data.message || 'Welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google signup failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Join our referral community</p>
        </div>

        <div className="card shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                required
                {...register('name')}
              />
              <Input
                label="Username"
                placeholder="johndoe"
                error={errors.userName?.message}
                required
                {...register('userName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Mobile Number"
              placeholder="+91xxxxxxxxxx"
              error={errors.mobileNumber?.message}
              required
              {...register('mobileNumber')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                error={errors.password?.message}
                required
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              label="Referral Code (optional)"
              placeholder="e.g. ABC123"
              error={errors.referredBy?.message}
              {...register('referredBy')}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="flex justify-center">
            {googleLoading ? (
              <div className="h-10 flex items-center gap-2 text-sm text-slate-500">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google signup failed.')}
                shape="rectangular"
                theme="outline"
                size="large"
                text="signup_with"
              />
            )}
          </div>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
