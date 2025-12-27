import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
/*
 * Show "Activate" button if status is inactive and handle API request in activateCard.
 * Already implemented in the component's render and activateCard function.
 */
const Active = ({ card }) => {
    const [status, setStatus] = useState(card.status);
    const [days, setDays] = useState('');
    const [expireAt, setExpireAt] = useState(card.expireAt);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const toggleCardStatus = async (newStatus) => {
        setLoading(true);
        setMsg('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/card/${card._id}/updateStatus`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            console.log("Status update response:", data);
            
            if (res.ok) {
                setStatus(data.data.status);
                setMsg(`✅ Card ${newStatus === 'active' ? 'activated' : 'inactivated'}.`);
            } else {
                setMsg(data.message || `❌ Failed to ${newStatus}.`);
            }
        } catch (err) {
            setMsg(`❌ Error trying to ${newStatus} card.`);
        } finally {
            setLoading(false);
        }
    };

    const updateExpiration = async () => {
        if (!days || isNaN(days) || parseInt(days) <= 0) {
            return setMsg('❌ Enter a valid number of days.');
        }

        setLoading(true);
        setMsg('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/card/${card._id}/updateExpire`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ days: parseInt(days) })
            });

            const data = await res.json();
            console.log(data);
            
            if (res.ok) {
                setExpireAt(data.data.card.expire);
                setMsg('✅ Expiration updated.');
                setDays("");
            } else {
                setMsg(data.message || '❌ Failed to update expiration.');
            }
        } catch (err) {
            setMsg('❌ Error updating expiration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md mx-auto border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Card #{card._id.slice(-6)}</h3>
                    <span className={`inline-flex items-center text-xs mt-1 px-2 py-0.5 rounded-full font-medium ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {status === 'active' ? (
                            <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                            <XCircle className="w-4 h-4 mr-1" />
                        )}
                        {status.toUpperCase()}
                    </span>
                </div>

                <button
                    onClick={() => toggleCardStatus(status === 'active' ? 'inactive' : 'active')}
                    disabled={loading}
                    className={`text-white text-sm px-4 py-1.5 rounded-md transition shadow ${status === 'active'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {loading ? (status === 'active' ? 'Inactivating...' : 'Activating...') : status === 'active' ? 'Inactivate' : 'Activate'}
                </button>
            </div>

            {/* Expiration Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Expires on:</span>{' '}
                        <span className={`inline-block ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${expireAt ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                            }`}>
                            {expireAt ? new Date(expireAt).toLocaleString() : 'N/A'}
                        </span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        placeholder="Days to add"
                        min="1"
                        value={days}
                        onChange={e => setDays(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={updateExpiration}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow transition"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg
                                    className="animate-spin h-4 w-4 mr-2 text-white"
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
                                        d="M4 12a8 8 0 018-8v8z"
                                    ></path>
                                </svg>
                                Updating...
                            </span>
                        ) : (
                            'Update Expiry'
                        )}
                    </button>
                </div>
            </div>


            {/* Message */}
            {msg && (
                <div className={`mt-4 text-sm font-medium ${msg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
                    {msg}
                </div>
            )}
        </div>
    );
};

export default Active;
