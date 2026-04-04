import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Clock } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;

    if (submitted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && submitted) {
      setSubmitted(false);
    }

    return () => clearInterval(interval);
  }, [submitted, timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/forgot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset link");
      }

      setMessage("Reset link sent! Check your email.");
      setSubmitted(true);
      setTimer(60);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* LEFT INFO SECTION - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-8 lg:p-16">
        <div className="text-center max-w-lg">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl">
              <span className="text-4xl">🔐</span>
            </div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
            Reset Password
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            Enter your email address and we'll send you a secure link to reset your password.
          </p>
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Enter your email to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${submitted ? "opacity-60 cursor-not-allowed" : ""}`}
                  required
                  disabled={submitted}
                />
              </div>

              {/* Timer Display */}
              {submitted && timer > 0 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                    You can request again in {timer} second{timer !== 1 && "s"}
                  </p>
                </div>
              )}

              {/* Messages */}
              {message && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-600 dark:text-green-400 text-sm text-center">
                    {message}
                  </p>
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitted || loading}
                className={`w-full flex justify-center items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span>Sending Reset Link...</span>
                  </>
                ) : submitted ? (
                  <span>Reset Link Sent</span>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>

            {/* Additional Help */}
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}