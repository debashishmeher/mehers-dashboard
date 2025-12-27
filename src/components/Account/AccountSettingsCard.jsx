import { FaUser } from "react-icons/fa";
import { ChevronRight } from "lucide-react";
import { useUser } from "../../Context/ContextApt";
import Cookies from 'js-cookie';

export default function AccountSettingsCard({ setIsEmailUpdate, setIsPasswordUpdate, setIsVerificationOtp }) {
  const { userData } = useUser();
  const email = userData?.user?.email || "Not available";
  const createdAt = userData?.user?.createdAt;
  const isEmailVerified = userData?.user?.email_verified || false;

  const sendInitialOtp = async () => {
    try {
      const token = Cookies.get('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/send-verification-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send OTP');
      }
      
      // Success - the modal will handle showing the OTP field
    } catch (err) {
      console.error('Error sending verification OTP:', err.message);
      // Error handling can be added here if needed
    }
  };

  const handleVerifyEmailClick = async () => {
    if (!isEmailVerified) {
      await sendInitialOtp();
      setIsVerificationOtp(true);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full my-5 divide-y py-4 divide-gray-200">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <FaUser className="text-[#2563EB] text-xl" />
        <h2 className="text-base font-semibold">Account settings</h2>
      </div>

      {/* Settings List */}
      <div className="divide-y divide-gray-200">
        {/* Email */}
        <div 
          className="cursor-pointer flex items-center justify-between py-4 border-t hover:bg-muted transition-colors" 
          onClick={() => setIsEmailUpdate(true)}
        >
          <div className="flex-1 flex items-center gap-4 flex-wrap">
            <span className="text-gray-600 flex-1 basis-[100px]">Email</span>
            <span className="text-gray-800 font-medium flex-1 basis-[100px] truncate break-all">
              {email}
            </span>
          </div>
          <div className="pl-4">
            <ChevronRight className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Change Password */}
        <div 
          className="cursor-pointer flex items-center justify-between py-4 border-t hover:bg-muted transition-colors" 
          onClick={() => setIsPasswordUpdate(true)}
        >
          <div className="flex-1 flex items-center gap-4 flex-wrap">
            <span className="text-gray-600 flex-1 basis-[100px]">Change password</span>
            <span className="text-gray-800 font-medium flex-1 basis-[100px]">
              ••••••••••
            </span>
          </div>
          <div className="pl-4">
            <ChevronRight className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Email Verification */}
        <div
          className="cursor-pointer flex items-center justify-between py-4 border-t hover:bg-muted transition-colors"
          onClick={handleVerifyEmailClick}
        >
          <div className="flex-1 flex items-center gap-4 flex-wrap">
            <span className="text-gray-600 flex-1 basis-[100px]">Verify Email</span>
            <span className={`font-semibold flex-1 basis-[100px] ${isEmailVerified ? 'text-green-600' : 'text-red-500'}`}>
              {isEmailVerified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
          <div className="pl-4">
            {!isEmailVerified && (
              <ChevronRight className="w-5 h-5 text-[#2563EB]" />
            )}
          </div>
        </div>

        {/* Member Since */}
        <div className="cursor-pointer flex items-center justify-between py-4 border-t hover:bg-muted transition-colors">
          <div className="flex-1 flex items-center gap-4 flex-wrap">
            <span className="text-gray-600 flex-1 basis-[100px]">Member since</span>
            <span className="text-gray-800 font-medium flex-1 basis-[100px]">
              {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <div className="pl-4">
            <ChevronRight className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}