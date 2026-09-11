import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../../Context/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Mail, ShieldCheck, Loader2, ArrowLeft, AlertCircle, ArrowRight, Sun, Moon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../Context/ThemeContext";

export default function LoginPage() {
  const { sendOtp, verifyOtp, loginWithGoogle } = useUser();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("email"); // "email" or "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputRefs = useRef([]);
  const isDark = theme === "dark";

  // Handle Resend OTP countdown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    try {
      await sendOtp(email);
      setStep("otp");
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      // Focus first input box after transition
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyOtp(email, otpCode);
      window.location.replace("/");
    } catch (err) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setLoading(true);
    try {
      await sendOtp(email);
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // Google Login callbacks
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(credentialResponse.credential);
      window.location.replace("/");
    } catch (err) {
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In failed. Please try again.");
  };

  // OTP inputs handling
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return; // Allow only numbers
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Get last char
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all fields are filled
    if (newOtp.every(val => val !== "")) {
      setTimeout(() => {
        handleAutoSubmit(newOtp.join(""));
      }, 50);
    }
  };

  const handleAutoSubmit = async (code) => {
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(email, code);
      window.location.replace("/");
    } catch (err) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtp(digits);
      otpInputRefs.current[5]?.focus();
      setTimeout(() => {
        handleAutoSubmit(pasteData);
      }, 50);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const loginForm = (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-secondary px-4 py-8 relative overflow-hidden transition-colors duration-300">
      {/* Background circles / orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-80 sm:h-80 bg-accent-primary/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-80 sm:h-80 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-2xl bg-background-primary border border-border-primary/50 text-text-secondary hover:text-text-primary shadow-lg backdrop-blur-md transition duration-200 z-50"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-accent-warning" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      {/* Main Form Card */}
      <div className="w-full max-w-md bg-background-primary/80 dark:bg-background-primary/60 backdrop-blur-xl border border-border-primary/50 shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 transition-all duration-300 relative overflow-hidden">

        {/* Header Icon */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-accent-primary to-purple-400 text-white rounded-2xl shadow-lg shadow-accent-primary/25">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
        </div>

        {/* Branding & Subtitle */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight text-center">
          Revotix
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm font-medium mt-2 text-center px-2">
          {step === "email" ? "Enter your email for passwordless sign-in" : "Enter the verification code sent to your email"}
        </p>

        {/* Interactive sliding panels */}
        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSendEmail}
              className="space-y-4 mt-5 sm:mt-6"
            >
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3.5 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-2xl border border-border-secondary bg-background-secondary text-text-primary placeholder-text-tertiary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition duration-200"
                  required
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex justify-center items-center gap-2 bg-accent-primary hover:bg-accent-primary/95 text-white py-3 sm:py-3.5 px-4 rounded-2xl font-bold shadow-lg shadow-accent-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>

              {/* Google Login Section */}
              {googleClientId && (
                <div className="w-full pt-1">
                  <div className="relative flex items-center justify-center my-3.5 sm:my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border-primary/50"></div>
                    </div>
                    <span className="relative px-2.5 bg-background-primary/0 text-text-tertiary text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                      or
                    </span>
                  </div>

                  <div className="flex justify-center w-full max-w-[320px] sm:max-w-sm mx-auto min-h-[44px]">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme={isDark ? "filled_black" : "outline"}
                      size="large"
                      shape="pill"
                      width="100%"
                    />
                  </div>
                </div>
              )}
            </motion.form>
          ) : (
            <motion.form
              key="otp-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleVerifyOtp}
              className="mt-5 sm:mt-6"
            >
              {/* Back to email link */}
              <button
                type="button"
                onClick={() => setStep("email")}
                className="inline-flex items-center text-xs font-bold text-text-secondary hover:text-accent-primary transition duration-200 mb-5"
                disabled={loading}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Change email address
              </button>

              {/* OTP Code digits - Highly responsive aspect-ratio blocks */}
              <div className="flex justify-between gap-1.5 sm:gap-2.5 my-5 sm:my-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-[14%] aspect-[5/6] sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border border-border-secondary bg-background-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition duration-150"
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.some(v => v === "")}
                className="w-full flex justify-center items-center gap-2 bg-accent-primary hover:bg-accent-primary/95 text-white py-3 sm:py-3.5 px-4 rounded-2xl font-bold shadow-lg shadow-accent-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    <span>Verify and Sign In</span>
                  </>
                )}
              </button>

              {/* Resend Code Link */}
              <div className="text-center mt-5 sm:mt-6">
                {resendTimer > 0 ? (
                  <p className="text-xs sm:text-sm text-text-tertiary">
                    Resend code in <span className="font-semibold text-text-primary">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    type="button"
                    className="text-xs sm:text-sm font-bold text-accent-primary hover:underline hover:text-accent-primary/80 transition duration-150"
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Error Notification Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3 sm:p-3.5 bg-accent-danger/10 border border-accent-danger/20 rounded-2xl flex items-start gap-2.5 text-accent-danger text-xs sm:text-sm font-medium mt-5 sm:mt-6"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy Note */}
        <p className="text-[9px] sm:text-[10px] text-text-tertiary text-center mt-6 sm:mt-8 leading-relaxed">
          By signing in, you agree to our Terms of Service. OTP will expire after 10 minutes.
        </p>
      </div>
    </div>
  );

  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {loginForm}
    </GoogleOAuthProvider>
  ) : (
    loginForm
  );
}