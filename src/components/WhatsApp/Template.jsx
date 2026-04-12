import React, { useEffect, useState } from "react";
import { fetchTemplates } from "../../Services/whatsappServices";

function Template() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const data = await fetchTemplates();
                setTemplates(data?.data || []);
            } catch (err) {
                setError("Failed to load templates");
            } finally {
                setLoading(false);
            }
        };

        loadTemplates();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-gray-500">
                Loading templates...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">WhatsApp Templates</h1>
            </div>

            {/* Empty State */}
            {templates.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                    No templates found
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                        >
                            {/* Title */}
                            <h2 className="text-lg font-semibold mb-1">
                                {template.name}
                            </h2>

                            {/* Category */}
                            <p className="text-xs text-gray-500 mb-3">
                                {template.category}
                            </p>

                            {/* Body */}
                            <div className="text-sm text-gray-700 mb-4 min-h-[60px]">
                                {template.components?.map((comp, i) =>
                                    comp.type === "BODY" ? (
                                        <p key={i}>{comp.text}</p>
                                    ) : null
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                                {/* Status Badge */}
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${template.status === "APPROVED"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-yellow-100 text-yellow-600"
                                        }`}
                                >
                                    {template.status}
                                </span>

                                {/* Button */}
                                <button className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    Use
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Template;