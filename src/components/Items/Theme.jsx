import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useCard } from "../../Context/CardContext";


// Replace these with your actual image/video URLs
const backgrounds = [
    { id: 1, type: "image", src: "https://picsum.photos/id/1/100/100" },
    { id: 2, type: "image", src: "https://picsum.photos/id/2/100/100" },
    { id: 3, type: "image", src: "https://picsum.photos/id/3/100/100" },
    // Replace below with actual video URLs or use images for now
    { id: 4, type: "image", src: "https://picsum.photos/id/4/100/100" },
    { id: 5, type: "image", src: "https://picsum.photos/id/5/100/100" },
    { id: 6, type: "image", src: "https://picsum.photos/id/6/100/100" },
    // Add more items...
];

const colorOptions = [
    { id: 1, primary: "#4F86F7", secondary: "#CBF2FF" },
    { id: 2, primary: "#2B3A67", secondary: "#D4F1F9" },
    { id: 3, primary: "#E63946", secondary: "#FFD6EB" },
    { id: 4, primary: "#FFA500", secondary: "#FFEAC3" },
    { id: 5, primary: "#7B4B1F", secondary: "#D9FFBF" },
    { id: 6, primary: "#3AAFA9", secondary: "#B2F7EF" },
    { id: 7, primary: "#0D47A1", secondary: "#E3F2FD" },
    { id: 8, primary: "#6A5ACD", secondary: "#DAD7FF" },
    { id: 9, primary: "#FF3366", secondary: "#FFEAEA" },
    { id: 10, primary: "#5D3A00", secondary: "#FFF1C1" },
    { id: 11, primary: "#FFD700", secondary: "#FFFACD" },
    { id: 12, primary: "#50FA7B", secondary: "#D9FCD2" },
    { id: 13, primary: "#A3B18A", secondary: "#F5FDEB" },
    { id: 14, primary: "#1E40AF", secondary: "#E0E7FF" },
    { id: 15, primary: "#E60000", secondary: "#FFDCDC" },
    { id: 16, primary: "#2D0B5F", secondary: "#E2D8FF" },
    { id: 17, primary: "#000000", secondary: "#D3D3D3" },
    { id: 18, primary: "#28A745", secondary: "#D2F8D2" },
    { id: 19, primary: "#DAA520", secondary: "#FFF7D6" },
    { id: 20, primary: "#F2E94E", secondary: "#FFFFD5" },
];

const fontOptions = [
    { id: "sans", label: "Default", fontFamily: "sans-serif" },
    { id: "work-sans", label: "Work Sans", fontFamily: "'Work Sans', sans-serif" },
    { id: "open-sans", label: "Open Sans", fontFamily: "'Open Sans', sans-serif" },
    { id: "roboto", label: "Roboto", fontFamily: "'Roboto', sans-serif" },
    { id: "playfair", label: "Playfair Display", fontFamily: "'Playfair Display', serif" },
    { id: "josefin", label: "Josefin Sans", fontFamily: "'Josefin Sans', sans-serif" },
    { id: "slabo", label: "Slabo", fontFamily: "'Slabo 27px', serif" },
    { id: "concert", label: "Concert One", fontFamily: "'Concert One', cursive" },
    { id: "krona", label: "Krona One", fontFamily: "'Krona One', sans-serif" },
    { id: "syne", label: "Syne", fontFamily: "'Syne', sans-serif" },
    { id: "federo", label: "Federo", fontFamily: "'Federo', sans-serif" },
    { id: "viaoda", label: "Viaoda Libre", fontFamily: "'Viaoda Libre', cursive" },
    { id: "handlee", label: "Handlee", fontFamily: "'Handlee', cursive" },
    { id: "courier", label: "Courier New", fontFamily: "'Courier New', monospace" },
    { id: "poppins", label: "Poppins", fontFamily: "'Poppins', sans-serif" },
    { id: "montserrat", label: "Montserrat", fontFamily: "'Montserrat', sans-serif" },
    { id: "lato", label: "Lato", fontFamily: "'Lato', sans-serif" },
    { id: "spectral", label: "Spectral", fontFamily: "'Spectral', serif" },
    { id: "manrope", label: "Manrope", fontFamily: "'Manrope', sans-serif" },
    { id: "didot", label: "Didot", fontFamily: "'Didot', serif" },
    // Add more as needed
];

const templateOptions = [
    { id: "classic", label: "Classic", thumbnail: "https://picsum.photos/id/1/100/100" },
    { id: "modern", label: "Modern", thumbnail: "https://picsum.photos/id/2/100/100" },
    { id: "minimal", label: "Minimal", thumbnail: "https://picsum.photos/id/3/100/100" },
];

export default function Theme({ handleNext, cardId }) {
    const [apperror, setError] = useState(null);
    const { cardData, setCardData, loading, error } = useCard()

    const [formData, setFormData] = useState({
        color: [],
        template: "",
        fonts: "",
        background: "",
    });

    useEffect(() => {
        if (cardData?.theme?.color) {
            setFormData((prev) => ({
                ...prev,
                color: cardData.theme.color || ["#4F86F7", "#CBF2FF"],
                template: cardData.theme.template || "classic",
                fonts: cardData.theme.fonts || "sans",
                background: cardData.theme.background || "",
            }));
        }
    }, [cardData]);

    const handleBackgroundSelect = (src) => {
        setFormData((prev) => ({ ...prev, background: src }));
    };

    const handleSubmit = async () => {
        setError(null);

        const authToken = Cookies.get("authToken");

        // Remove empty fields from formData
        const cleanedData = Object.fromEntries(
            Object.entries(formData).filter(
                ([_, value]) =>
                    value !== "" &&
                    value !== null &&
                    !(Array.isArray(value) && value.length === 0)
            )
        );

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/card/${cardId}/theme`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authToken || "",
                },
                credentials: "include",
                body: JSON.stringify(cleanedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update theme");
            }

            const result = await response.json();
            setCardData((prev) => ({
                ...prev,
                theme: {
                    ...prev.theme,
                    ...result.data.theme,
                },
            }));
            console.log(cardData);
            
            handleNext();
        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <div className="space-y-6 max-w-xl mx-auto p-4">
            <h2 className="text-xl font-semibold text-gray-800">Customize Your Theme</h2>

            {/* Color Picker */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                <div className="grid grid-cols-6 gap-3">
                    {colorOptions.map((color) => {
                        // Fix isSelected: check if formData.color[0] matches color.primary
                        const isSelected = formData.color[0] === color.primary;
                        return (
                            <div
                                key={color.id}
                                onClick={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        color: [color.primary, color.secondary],
                                    }))
                                }
                                className={`w-12 h-12 rounded-full border-4 cursor-pointer transition ${isSelected ? "border-blue-500" : "border-transparent"
                                    } flex flex-col overflow-hidden`}
                                title={`${color.primary} + ${color.secondary}`}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        setFormData((prev) => ({
                                            ...prev,
                                            color: [color.primary, color.secondary],
                                        }));
                                    }
                                }}
                            >
                                <div className="flex-1" style={{ backgroundColor: color.primary }} />
                                <div className="flex-1" style={{ backgroundColor: color.secondary }} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Font Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                <div className="grid grid-cols-5 gap-3">
                    {fontOptions.map((font) => (
                        <button
                            key={font.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, fonts: font.id }))}
                            className={`flex flex-col items-center justify-center border rounded-md p-2 h-20 transition focus:outline-none ${formData.fonts === font.id
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-200"
                                }`}
                            style={{ fontFamily: font.fontFamily }}
                            title={font.label}
                        >
                            <span className="text-2xl">Aa</span>
                            <span className="text-xs mt-1">{font.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Style</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3">

                    {templateOptions.map((template) => (
                        <div
                            key={template.id}
                            onClick={() =>
                                setFormData((prev) => ({
                                    ...prev,
                                    template: template.id,
                                }))
                            }
                            className={`relative w-full h-full border-2 rounded-md overflow-hidden cursor-pointer transition ${formData.template === template.id ? "border-blue-500 ring-2 ring-blue-300" : "border-transparent"
                                }`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    setFormData((prev) => ({ ...prev, template: template.id }));
                                }
                            }}
                            title={template.label}
                        >
                            <img src={template.thumbnail} alt={template.label} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-40 text-white text-xs text-center py-1">
                                {template.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Background Image/Video Picker */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Image / Video</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-80 overflow-y-auto p-2 border rounded-md bg-gray-50">

                    {backgrounds.map((bg) => (
                        <div
                            key={bg.id}
                            onClick={() => handleBackgroundSelect(bg.src)}
                            className={`relative w-full h-full cursor-pointer rounded-md overflow-hidden border-2 ${formData.background === bg.src ? "border-blue-500" : "border-transparent"
                                }`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    handleBackgroundSelect(bg.src);
                                }
                            }}
                            aria-label={`Select background ${bg.type}`}
                        >
                            {bg.type === "video" ? (
                                <>
                                    <video
                                        src={bg.src}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                        autoPlay
                                        playsInline
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-white text-xl select-none">▶</span>
                                    </div>
                                </>
                            ) : (
                                <img src={bg.src} alt={`Background ${bg.id}`} className="w-full h-full object-cover" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {apperror && <p className="text-red-500 text-sm">{apperror}</p>}

            {/* Navigation */}
            <div className="flex flex-row-reverse mt-6">

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
