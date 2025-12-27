import { FaIdCard } from "react-icons/fa";
import { ChevronRight } from "lucide-react";
import { useUser } from "../../Context/ContextApt";
import { Pencil } from "lucide-react";

export default function PersonalInformationCard({
    setIsModalOpen,
    setIsAddressForm,
    setIsPhotoUpload,
    setIsPhoneForm,
}) {
    const { userData } = useUser();
    const user = userData?.user || {};
    console.log(user);
    

    const formatAddress = (address) => {
        if (!address) return "Not provided";
        if (typeof address === 'string') return address;
        return [
            address.addressLine,
            address.city,
            address.state,
            address.country,
            address.pin
        ].filter(Boolean).join(', ');
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full mb-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <FaIdCard className="text-[#2563EB] text-xl" />
                <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
            </div>

            <p className="text-sm text-gray-500 mb-6">
                The information below appears on your invoices.
            </p>

            {/* Layout */}
            <div className="flex flex-col sm:flex-row gap-6">
                {/* Profile Photo */}
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                    <div className="relative group w-20 h-20">
                        <img
                            src={user?.photo || "/default-avatar.png"}
                            alt="Profile"
                            className="w-full h-full rounded-full border-2 border-gray-100 object-cover"
                        />
                        <button
                            onClick={() => setIsPhotoUpload(true)}
                            className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition border border-gray-200"
                            title="Edit Photo"
                        >
                            <Pencil className="w-3.5 h-3.5 text-[#2563EB]" />
                        </button>
                    </div>
                </div>

                {/* Info Fields */}
                <div className="flex-grow divide-y divide-gray-100">
                    {/* Name */}
                    <div 
                        className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg transition cursor-pointer"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className="flex items-start gap-4 w-full">
                            <span className="text-gray-500 text-sm w-28 flex-shrink-0">Name</span>
                            <span className="text-gray-800 font-medium text-sm">{user.name || "-"}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>

                    {/* Mobile number */}
                    <div className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg transition cursor-pointer" onClick={() => setIsPhoneForm(true)}>
                        <div className="flex items-start gap-4 w-full">
                            <span className="text-gray-500 text-sm w-28 flex-shrink-0">Mobile</span>
                            <span className="text-gray-800 font-medium text-sm">{user.phone || "-"}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>

                    {/* Address */}
                    <div 
                        className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg transition cursor-pointer"
                        onClick={() => setIsAddressForm(true)}
                    >
                        <div className="flex items-start gap-4 w-full">
                            <span className="text-gray-500 text-sm w-28 flex-shrink-0">Address</span>
                            <span className="text-gray-800 font-medium text-sm">
                                {formatAddress(userData?.user?.address)}
                            </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                </div>
            </div>
        </div>
    );
}