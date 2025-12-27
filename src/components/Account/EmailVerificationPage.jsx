import React, { useState, useEffect, useRef } from "react";

export default function EmailVerificationPage({ email }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const inputsRef = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !otp[index]) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmitOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return;

    setLoading(true);
    setMessage("");

    try {
        console.log(email,code);
        
      const res = await fetch(`${import.meta.env.VITE_API_URL}/account/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Email verified successfully!");
        window.open("https://dashboard.thryvoo.com/onboard", "_self")
        // Optionally navigate to dashboard or next step
      } else {
        setMessage(data.message || "Verification failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
        <p className="text-gray-600 mb-4">
          To confirm your account, enter the 6-digit code that we sent to{" "}
          <span className="font-medium text-black">{email}</span>.
        </p>
        <a href="#" className="text-sm text-black underline block mb-6">
          Change email address
        </a>

        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 border border-black rounded-md text-center text-lg font-semibold focus:outline-none"
            />
          ))}
        </div>

        <button
          onClick={handleSubmitOtp}
          disabled={otp.some((d) => d === "") || loading}
          className={`w-full flex justify-center items-center bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200 ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? (
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            "Create your account"
          )}
        </button>

        <button
          className="w-full mt-3 text-gray-500 border border-gray-300 rounded-md py-2"
          disabled={timer > 0}
        >
          Resend code {timer > 0 && `(${timer})`}
        </button>

        {message && (
          <p className="text-sm text-center text-red-500 mt-4">{message}</p>
        )}

        <p className="text-xs text-gray-500 mt-6">
          Look for an email from debashishmeher955@gmail.com. You may need to check your spam folder.
        </p>
      </div>
    </div>
  );
}
