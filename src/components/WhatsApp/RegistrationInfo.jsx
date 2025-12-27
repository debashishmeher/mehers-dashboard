import React, { useState, useEffect } from 'react';
import { ClipboardCopy, Trash2, PencilLine, Check, Plus, Save, X } from 'lucide-react';
import { usePushNotifications } from '../../hooks/pushNotifications';

function RegistrationInfo() {
     const { subscribeToPush } = usePushNotifications();
    const [copied, setCopied] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        whatsappToken: '',
        whatsappBusinessId: '',
        phoneNumberId: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    useEffect(() => {
        const fetchRegistration = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/registration`, {
                    credentials: 'include',
                });
                const result = await res.json();
                if (result.status === 'success') {
                    setData(result.data.registration);
                }
            } catch (err) {
                console.error('Fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRegistration();
    }, []);

    const formatDate = (isoDate) =>
        new Date(isoDate).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };


    const confirmDelete = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/registration`, {
                method: 'DELETE',
                credentials: 'include',
            });
            setData(null);
            setForm({ whatsappToken: '', whatsappBusinessId: '', phoneNumberId: '' });
            setIsEditing(false);
            setShowConfirmDelete(false);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };


    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/registration`, {
                method: data ? 'PATCH' : 'POST', // ✅ corrected
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });

            const result = await res.json();

            if (result.status === 'success') {
                setData(result.data.registration);
                setIsEditing(false);
                console.log(data);
                
            } else {
                alert(result.message || 'Failed to save registration');
            }
        } catch (err) {
            console.error('Save failed:', err);
            alert('Something went wrong while saving.');
        }
    };


    const enterEditMode = () => {
        setForm({
            whatsappToken: data?.whatsappToken || '',
            whatsappBusinessId: data?.whatsappBusinessId || '',
            phoneNumberId: data?.phoneNumberId || '',
        });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setForm({ whatsappToken: '', whatsappBusinessId: '', phoneNumberId: '' });
    };

    if (loading) {
        return <div className="text-center text-gray-500 font-medium py-10">⏳ Loading...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-white/80 backdrop-blur-lg rounded-3xl border border-gray-200 l">
        <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">🚀 React Push Notifications</h1>
        <p className="text-gray-600 text-sm">
          Click the button below to enable push notifications in your browser.
        </p>
        <button
          onClick={subscribeToPush}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition duration-300"
        >
          Enable Push Notifications
        </button>
      </div>
    </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
                📋 WhatsApp Registration Details
            </h2>

            {data && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm p-4 rounded-md mb-6">
                    ⚠️ <strong>Warning:</strong> Changing or deleting this registration may interrupt your WhatsApp messaging. Proceed with caution.
                </div>
            )}

            {isEditing || !data ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="WhatsApp Token"
                        name="whatsappToken"
                        value={form.whatsappToken}
                        onChange={handleInputChange}
                        required
                    />
                    <InputField
                        label="Business ID"
                        name="whatsappBusinessId"
                        value={form.whatsappBusinessId}
                        onChange={handleInputChange}
                        required
                    />
                    <InputField
                        label="Phone Number ID"
                        name="phoneNumberId"
                        value={form.phoneNumberId}
                        onChange={handleInputChange}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700"
                        >
                            <Save size={16} />
                            {data ? 'Update' : 'Register'}
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 mb-6">
                        <div className="md:col-span-2">
                            <label className="block font-medium text-gray-700 mb-1">🔐 WhatsApp Token</label>

                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 overflow-x-auto whitespace-nowrap relative">
                                <span className="flex-1 min-w-0 truncate">
                                    {data.whatsappToken.slice(0, 80)}...
                                </span>
                                <button
                                    onClick={() => copyToClipboard(data.whatsappToken)}
                                    className="ml-2 text-blue-600 hover:text-blue-800 transition"
                                    title="Copy token"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <ClipboardCopy size={16} />}
                                </button>
                            </div>
                        </div>

                        <InfoCard label="🏢 Business ID" value={data.whatsappBusinessId} />
                        <InfoCard label="📞 Phone Number ID" value={data.phoneNumberId} />
                        <InfoCard label="📅 Created At" value={formatDate(data.createdAt)} />
                        <InfoCard label="♻️ Updated At" value={formatDate(data.updatedAt)} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t mt-6">
                        <button
                            onClick={enterEditMode}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition"
                        >
                            <PencilLine size={16} />
                            Edit
                        </button>
                        <button
                            onClick={() => setShowConfirmDelete(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </>
            )}


            {showConfirmDelete && (
                <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg border border-gray-200 text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this WhatsApp registration? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-full hover:bg-red-700"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}

function InputField({ label, name, value, onChange, required = false }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
        </div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1 tracking-wide">{label}</div>
            <div className="text-gray-800 text-sm break-words font-medium">{value}</div>
        </div>
    );
}

export default RegistrationInfo;
