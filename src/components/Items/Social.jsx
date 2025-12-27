import React, { useEffect, useState } from "react";
import { FaFacebookF, FaWhatsapp, FaInstagram, FaYoutube, FaLinkedinIn, FaGlobe } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { CiShare1 } from "react-icons/ci";
import Cookies from "js-cookie";
import { useCard } from "../../Context/CardContext";

export default function Social({ handleBack, handleNext, cardId, role }) {
    const { cardData, setCardData, loading, error } = useCard()
    const [formData, setFormData] = useState({

        facebook: "",
        insta: "",
        whatsapp: "",
        twitter: "",
        youtube: "",
        linkedin: "",
        website: "",
    });

    useEffect(() => {
        if (cardData?.social) {
            setFormData((prev) => ({
                ...prev,
                facebook: cardData.social.facebook || "",
                insta: cardData.social.insta || "",
                whatsapp: cardData.social.whatsapp || "",
                twitter: cardData.social.twitter || "",
                youtube: cardData.social.youtube || "",
                linkedin: cardData.social.linkedin || "",
                website: cardData.social.website || "",
            }));
        }
    }, [cardData]);

    const [apperror, setError] = useState(null);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setError(null);

        const authToken = Cookies.get("authToken");
        let url;
        if(role==="admin"){
            url=`${import.meta.env.VITE_API_URL}/api/admin/card/${cardId}/social`
        }
        else{
            url=`${import.meta.env.VITE_API_URL}/api/user/card/${cardId}/social`
        }

        try {
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authToken || "",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update theme");
            }

            const result = await response.json();
            setCardData((prev) => ({
                ...prev,
                social: {
                    ...prev.social,
                    ...result.data.social,
                },
            }));
            handleNext();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto p-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <CiShare1 className="text-[#2563EB] text-2xl" />
                Social Media Links
            </h2>

            <div className="space-y-4">
                {[
                    { id: "facebook", icon: <FaFacebookF />, placeholder: "Enter Facebook URL" },
                    { id: "whatsapp", icon: <FaWhatsapp />, placeholder: "Enter WhatsApp number or URL" },
                    { id: "insta", icon: <FaInstagram />, placeholder: "Enter Instagram handle or URL" },
                    { id: "youtube", icon: <FaYoutube />, placeholder: "Enter YouTube URL" },
                    { id: "twitter", icon: <FaXTwitter />, placeholder: "Enter Twitter URL" },
                    { id: "linkedin", icon: <FaLinkedinIn />, placeholder: "Enter LinkedIn URL" },
                    { id: "website", icon: <FaGlobe />, placeholder: "Enter Website URL" },
                ].map(({ id, icon, placeholder }) => (
                    <div
                        key={id}
                        className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-3 shadow-sm"
                    >
                        <span className="text-xl text-gray-600">{icon}</span>
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={formData[id]}
                            onChange={(e) => handleChange(id, e.target.value)}
                            className="bg-transparent w-full outline-none placeholder-gray-400 text-gray-700"
                        />
                    </div>
                ))}
            </div>

            {apperror && <p className="text-red-500 text-sm">{apperror}</p>}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
                <button type="button" className="text-gray-600 hover:underline" onClick={handleBack}>
                    Back
                </button>
                <button
                    type="button"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    onClick={handleSubmit}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
