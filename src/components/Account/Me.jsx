import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Monitor, Smartphone, Shield, LogOut, Trash2 } from "lucide-react";
import UpdateNameModal from '../Form/NameChange';
import UpdatePhoneForm from '../Modals/UpdatePhoneForm';
import AccountSettingsCard from './AccountSettingsCard';
import PersonalInformationCard from './PersonalInformationCard';
import AddressModal from '../Modals/AddressModal';
import ChangePhotoModal from "./ChangePhotoModel";
import EmailUpdateModal from "../Modals/EmailUpdateModal";
import UpdatePasswordModal from "../Modals/UpdatePasswordModal";
import VerifyEmailModal from "../Modals/VerifyEmailModal";
import api from "../../utils/api";

const Me = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPhotoUpload, setIsPhotoUpload] = useState(false);
    const [isAddressForm, setIsAddressForm] = useState(false);
    const [isPhoneForm, setIsPhoneForm] = useState(false);
    const [isEmailUpdate, setIsEmailUpdate] = useState(false);
    const [isPasswordUpdate, setIsPasswordUpdate] = useState(false);
    const [isVerificationOtp, setIsVerificationOtp] = useState(false);

    // Active Sessions States
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const fetchSessions = async () => {
        setSessionsLoading(true);
        try {
            const res = await api.get("/api/user/sessions");
            if (res && res.status === "success") {
                setSessions(res.data.sessions);
            }
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
        } finally {
            setSessionsLoading(false);
        }
    };

    const handleRevokeSession = async (sessionId, isCurrent) => {
        if (isCurrent) {
            const confirmLogout = window.confirm("Logging out of the current session will redirect you to the login screen. Continue?");
            if (!confirmLogout) return;
        } else {
            const confirmRevoke = window.confirm("Are you sure you want to terminate this session? The device will be logged out immediately.");
            if (!confirmRevoke) return;
        }

        try {
            const res = await api.delete(`/api/user/sessions/${sessionId}`);
            if (res && res.status === "success") {
                if (isCurrent) {
                    Cookies.remove("authToken");
                    window.location.replace("/login");
                } else {
                    alert("Session terminated successfully.");
                    fetchSessions();
                }
            }
        } catch (err) {
            console.error("Failed to revoke session:", err);
            alert("Failed to terminate session. Please try again.");
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return (
        <div className="relative mt-10">
            {isModalOpen && (
                <UpdateNameModal
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={(data) => {
                        console.log("Updated data:", data);
                        setIsModalOpen(false);
                    }}
                />
            )}

            {isPhoneForm && (
                <UpdatePhoneForm
                    onClose={() => setIsPhoneForm(false)}
                    onSubmit={(data) => {
                        setIsPhoneForm(false);
                    }}
                />
            )}

            <div className="user-content min-h-28 max-w-screen-lg mx-auto px-4">
                {/* Account Information */}
                <PersonalInformationCard
                    setIsModalOpen={setIsModalOpen}
                    setIsAddressForm={setIsAddressForm}
                    setIsPhotoUpload={setIsPhotoUpload}
                    setIsPhoneForm={setIsPhoneForm}
                />

                <AccountSettingsCard 
                    setIsEmailUpdate={setIsEmailUpdate}
                    setIsPasswordUpdate={setIsPasswordUpdate}
                    setIsVerificationOtp={setIsVerificationOtp}
                />

                {/* Active Sessions */}
                <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-xl border border-gray-100 dark:border-gray-700 p-6 w-full my-6 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <Shield className="text-[#2563EB] w-5 h-5" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Active Sessions</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage and sign out of other active devices.</p>
                        </div>
                    </div>

                    {sessionsLoading ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Loading active sessions...</p>
                    ) : sessions.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No active sessions found.</p>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {sessions.map((session) => {
                                const isMobile = /mobile|iphone|android|ipad/i.test(session.userAgent);
                                const dateFormatted = new Date(session.createdAt).toLocaleString();
                                return (
                                    <div key={session._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 border border-gray-100 dark:border-gray-600 flex-shrink-0">
                                                {isMobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">
                                                        {session.userAgent || "Unknown Device"}
                                                    </span>
                                                    {session.isCurrent && (
                                                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-100 dark:border-blue-800 flex-shrink-0">
                                                            Current Device
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    IP Address: {session.ip} • Last accessed: {dateFormatted}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRevokeSession(session._id, session.isCurrent)}
                                            className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                                            title="Terminate Session"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Account Control */}
                <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-xl border border-gray-100 dark:border-gray-700 p-6 w-full my-6 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <Trash2 className="text-red-500 w-5 h-5" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Account Control</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">High-impact actions to manage your account status.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Delete your account and all associated dashboard metadata. This action is irreversible.
                        </p>
                        <button 
                            onClick={() => {
                                const confirmDelete = window.confirm("Are you sure you want to request account deletion? Please contact your administrator for final removal.");
                                if (confirmDelete) {
                                    alert("Deletion request sent successfully.");
                                }
                            }}
                            className="bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold text-sm px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 transition flex-shrink-0"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {isPhotoUpload && (
                <ChangePhotoModal onClose={() => setIsPhotoUpload(false)} />
            )}
            {isAddressForm && (
                <AddressModal onClose={() => setIsAddressForm(false)} />
            )}
            {isEmailUpdate && (
                <EmailUpdateModal onClose={() => setIsEmailUpdate(false)} />
            )}
            {isPasswordUpdate && (
                <UpdatePasswordModal onClose={() => setIsPasswordUpdate(false)} />
            )}
            {isVerificationOtp && (
                <VerifyEmailModal onClose={() => setIsVerificationOtp(false)} />
            )}
        </div>
    );
};

export default Me;
