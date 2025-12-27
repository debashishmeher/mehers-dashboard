import { useState, useRef, useEffect, useCallback } from 'react';
import { useUser } from '../../Context/ContextApt';
import Cookies from 'js-cookie';

export default function VerifyEmailModal({ onClose }) {
  const { userData, setUserData } = useUser();
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState({ error: '', success: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpInputRef = useRef(null);

  // Verify OTP
  const verifyEmail = useCallback(async () => {
    if (otp.length !== 6) {
      setStatus({ error: 'Please enter a valid 6-digit OTP', success: '' });
      return;
    }

    setIsSubmitting(true);
    setStatus(prev => ({ ...prev, error: '' }));

    try {
      const token = Cookies.get('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed');
      setUserData(
        prev => ({
          ...prev,
          user: {
            ...prev.user,
            email_verified: true,
          },
        })
      )
      setStatus({ error: '', success: 'Email verified successfully!' });
      setTimeout(onClose, 1500);
    } catch (err) {
      setStatus(prev => ({ ...prev, error: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, onClose]);

  // Auto-focus OTP input on mount
  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] grid place-items-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Verify Your Email</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl disabled:opacity-50"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the 6-digit verification code sent to <span className="font-medium">{userData?.user?.email}</span>
          </p>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Verification Code</label>
            <input
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={otp}
              onChange={(e) => /^\d{0,6}$/.test(e.target.value) && setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-lg tracking-widest"
              placeholder="------"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={verifyEmail}
              disabled={isSubmitting || otp.length !== 6}
              className={`px-4 py-2 rounded-lg font-medium text-sm text-white ${
                isSubmitting || otp.length !== 6 ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          {status.error && (
            <p className="p-2 bg-red-50 text-red-600 text-sm rounded-md">
              {status.error}
            </p>
          )}
          {status.success && (
            <p className="p-2 bg-green-50 text-green-600 text-sm rounded-md">
              {status.success}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}