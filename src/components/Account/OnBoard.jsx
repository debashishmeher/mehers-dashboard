import React, { useState } from "react";
import { FaCoffee, FaUtensils } from "react-icons/fa";
import ProfileUpdate from "./ProfileUpdate";

export default function Onboard() {
    const [step, setStep] = useState(1);
    const handleNext = () => setStep((prev) => prev + 1);
    const handleBack = () => setStep((prev) => prev - 1);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        window.open("https://dashboard.thryvoo.com/", "_self");
        // TODO: Send to server
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold">
                        {step === 1 && "Welcome to Digital Menu!"}
                        {step === 2 && "Set up your profile"}
                        {step === 3 && "You're all set!"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Step {step} of 5
                    </p>
                </div>

                {step === 1 && (
                    <div className="space-y-4 text-center">
                        <p className="text-gray-700">
                            Let’s get your account set up for success.
                        </p>
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            onClick={handleNext}
                        >
                            Get Started
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <ProfileUpdate 
                    handleBack={handleBack}
                    handleNext={handleNext}
                    handleChange={handleChange}
                    />

                )}

                {step === 3 && (
                    <div className="text-center space-y-6">
                        <p className="text-gray-700">Thanks</p>
                        <p className="text-gray-500">
                            We’ve set up your onboarding. You’re ready to explore.
                        </p>
                        <button
                            onClick={handleSubmit}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}


            </div>
        </div>
    );
}
