import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Share2 } from 'lucide-react';
import { verifyEmailApi } from '../../services/auth.api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    verifyEmailApi(token)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Verification failed.';
        if (msg.toLowerCase().includes('already verified')) {
          setStatus('success');
          setMessage('Email is already verified.');
        } else {
          setStatus('error');
          setMessage(msg);
        }
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
            <Share2 className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="card shadow-xl text-center py-10">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Verifying your email...</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Please wait a moment.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Email Verified!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
              <Link to="/login" className="btn-primary inline-flex">Go to Login</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Verification Failed</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
              <div className="flex flex-col gap-3 items-center">
                <Link to="/login" className="btn-primary inline-flex">Go to Login</Link>
                <p className="text-xs text-slate-400">You can resend verification from your dashboard</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
