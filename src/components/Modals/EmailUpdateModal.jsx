import { useState, useRef, useEffect } from 'react';
import { useUser } from '../../Context/ContextApt';
import Cookies from 'js-cookie';

export default function EmailUpdateModal({ onClose }) {
  const { userData, setUserData } = useUser();
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = email input, 2 = OTP verification
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!newEmail) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = Cookies.get('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/veryfyemail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep(2);
      setCountdown(30); // 2 minutes countdown
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const authToken = Cookies.get("authToken");
    console.log(authToken);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/verify-email-otp`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ email: newEmail, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      // Update user data in context
      setUserData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          email: newEmail,
        },
      }));

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      const token = Cookies.get('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/resend-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setCountdown(120);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {step === 1 ? 'Update Email' : 'Verify OTP'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Current Email</label>
              <div className="p-2 bg-gray-50 rounded text-sm">{userData?.user?.email}</div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter new email"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOtp}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  isSubmitting
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a 6-digit OTP to <span className="font-medium">{newEmail}</span>
            </p>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Enter OTP</label>
              <input
                ref={otpInputRef}
                type="text"
                value={otp}
                onChange={(e) => {
                  if (/^\d{0,6}$/.test(e.target.value)) {
                    setOtp(e.target.value);
                  }
                }}
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-lg tracking-widest"
                placeholder="------"
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className={`text-sm ${countdown > 0 ? 'text-gray-400' : 'text-[#2563EB] hover:underline'}`}
              >
                Resend OTP {countdown > 0 && `(${countdown}s)`}
              </button>
              <span className="text-xs text-gray-500">
                Didn't receive? Check spam folder
              </span>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                Back
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={isSubmitting || otp.length !== 6}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  isSubmitting || otp.length !== 6
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isSubmitting ? 'Verifying...' : 'Update Email'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}