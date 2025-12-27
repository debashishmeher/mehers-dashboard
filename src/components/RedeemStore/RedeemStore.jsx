import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import axios from "axios";
import Cookies from "js-cookie";
import RedeemStoreForm from "./RedeemStoreForm";
import MessagePopup from "../Common/MessagePopup";
import { Gift } from "lucide-react";

export default function RedeemStore() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [storeItem, setStoreItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    coupon_name: "",
    banner: "",
    discountType: "percentage",
    discountAmount: "",
    minPurchase: "",
    day: "",
    usageLimit: 1,
    isActive: false,
    coin: 0,
    link: "",
    conditions: [""],
  });

  const token = Cookies.get("authToken");
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch store item
  const fetchItem = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/user/${userId}/redeem-store`,
        {
          headers: { Authorization: `${token}` },
          withCredentials: true,
        }
      );
      setStoreItem(res.data?.data || null);
    } catch {
      console.log("No item found, ready to create new.");
      setStoreItem(null);
    } finally {
      setLoading(false);
    }
  }, [userId, token, API_URL]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  // Handle form submission
const handleSubmit = useCallback(
  async (data, isEditing) => {
    setLoading(true);
    try {
      let res;

      // detect if data is FormData or plain JSON
      const isFormData = data instanceof FormData;

      const config = {
        headers: {
          Authorization: `${token}`,
          ...(isFormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" }),
        },
        withCredentials: true,
      };
      console.log(data);
      
      if (isEditing && storeItem?._id) {
        res = await axios.patch(
          `${API_URL}/api/admin/redeem-store/${storeItem._id}`,
          data,
          config
        );
      } else {
        res = await axios.post(
          `${API_URL}/api/admin/user/${userId}/redeem-store`,
          data,
          config
        );
      }

      setStoreItem(res.data.data);
      setShowForm(false);
      showMessage(
        isEditing
          ? "Redeem store item updated ✅"
          : "Redeem store item created ✅"
      );
      return res.data.data;
    } catch (err) {
      console.error("Error saving redeem store item:", err);
      showMessage("Error saving redeem store item ❌", "error");
      throw err;
    } finally {
      setLoading(false);
    }
  },
  [userId, token, storeItem, API_URL]
);


  // Handle form changes
  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // Reset form data
  const resetForm = useCallback(() => {
    setFormData({
      coupon_name: "",
      banner: "",
      discountType: "percentage",
      discountAmount: "",
      minPurchase: "",
      day: "",
      usageLimit: 1,
      isActive: false,
      coin: 0,
      link: "",
      conditions: [""],
    });
  }, []);

  // Message popup
  const showMessage = useCallback((msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }, []);

  // Delete function
  const handleDelete = async () => {
    if (!storeItem?._id) return;
    try {
      const res = await axios.delete(
        `${API_URL}/api/admin/redeem-store/${storeItem._id}`,
        {
          headers: { Authorization: `${token}` },
          withCredentials: true,
        }
      );
      setStoreItem(null);
      setShowDeleteDialog(false);
      showMessage(res.data?.message || "Item deleted successfully ✅");
    } catch (err) {
      console.error("Failed to delete item:", err);
      showMessage("Failed to delete item ❌", "error");
    }
  };

  // Toggle active/inactive
  const handleToggle = async () => {
    if (!storeItem?._id) return;
    const prevState = storeItem.isActive;

    try {
      const res = await axios.patch(
        `${API_URL}/api/admin/redeem-store/${storeItem._id}/toggle`,
        {},
        {
          headers: { Authorization: `${token}` },
          withCredentials: true,
        }
      );

      if (res.data?.data) {
        setStoreItem(res.data.data.redeemItem);
        showMessage(res.data.message || "Status updated ✅");
      }
    } catch (err) {
      console.error("Failed to toggle item status:", err);
      setStoreItem({ ...storeItem, isActive: prevState }); // rollback
      showMessage("Failed to update status ❌", "error");
    }
  };

  // Open edit form
  const handleEdit = useCallback(() => {
    if (storeItem) {
      setFormData(storeItem);
      setIsEditing(true);
      setShowForm(true);
    }
  }, [storeItem]);

  // Open create form
  const handleCreate = useCallback(() => {
    resetForm();
    setIsEditing(false);
    setShowForm(true);
  }, [resetForm]);

  // Close form
  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setIsEditing(false);
    resetForm();
  }, [resetForm]);

  if (loading && !showForm) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      {/* Message */}
      {message && (
        <MessagePopup
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
      )}

      {/* Content */}
      <div className="mt-6">
        {storeItem ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Banner */}
            {storeItem.banner && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={storeItem.banner}
                  alt="Redeem Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      storeItem.isActive
                        ? "text-green-800 bg-green-100"
                        : "text-red-800 bg-red-100"
                    }`}
                  >
                    {storeItem.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {storeItem.coupon_name}
                </h3>
                {!storeItem.banner && (
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      storeItem.isActive
                        ? "text-green-800 bg-green-100"
                        : "text-red-800 bg-red-100"
                    }`}
                  >
                    {storeItem.isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoCard label="Discount">
                  {storeItem.discountAmount} {storeItem.discountType}
                </InfoCard>
                <InfoCard label="Min Purchase">
                  {storeItem.minPurchase}
                </InfoCard>
                <InfoCard label="Usage Limit">{storeItem.usageLimit}</InfoCard>
                <InfoCard label="Coins Required">{storeItem.coin}</InfoCard>
              </div>

              {/* Validity */}
              <InfoCard label="Validity Period" full>
                {storeItem.day} days
              </InfoCard>

              {/* Conditions */}
              {storeItem.conditions?.length > 0 && (
                <div className="text-sm text-gray-700 pt-2">
                  <p className="font-semibold text-gray-900 mb-3">Conditions:</p>
                  <ul className="space-y-2">
                    {storeItem.conditions.map((c, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-gray-600 p-2 rounded-md hover:bg-gray-50 transition"
                      >
                        <span className="flex-shrink-0 w-5 h-5 mt-0.5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs">
                          ✓
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                <button
                  onClick={handleToggle}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg ${
                    storeItem.isActive
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {storeItem.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Gift className="h-12 w-12 text-purple-500" />
            </div>
            <p className="text-gray-600 mb-6 text-lg font-medium">
              No redeem store item yet.
            </p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all font-medium flex items-center justify-center mx-auto gap-2"
            >
              Create Store Item
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this redeem store item? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      <RedeemStoreForm
        showForm={showForm}
        setShowForm={setShowForm}
        form={formData}
        handleChange={handleFormChange}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
        loading={loading}
        isEditing={isEditing}
        title={isEditing ? "Edit Redeem Store Item" : "Create Redeem Store Item"}
        onClose={handleCloseForm}
      />
    </div>
  );
}

// Small reusable InfoCard component
function InfoCard({ label, children, full }) {
  return (
    <div
      className={`flex items-center p-3 bg-gray-50 rounded-lg ${
        full ? "col-span-2" : ""
      }`}
    >
      <div>
        <p className="font-medium text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900">{children}</p>
      </div>
    </div>
  );
}