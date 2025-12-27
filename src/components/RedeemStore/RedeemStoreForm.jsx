import { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Tag,
  DollarSign,
  ShoppingBag,
  Plus,
  Trash2,
  Users,
  Gift,
  Loader2,
  Image as ImageIcon,
  LinkIcon,
  Coins,
  Calendar,
} from "lucide-react";

const RedeemStoreForm = ({
  userId,
  showForm,
  setShowForm,
  form,
  handleChange,
  handleSubmit,
  resetForm,
  loading,
  isEditing,
  title = isEditing ? "Edit Special Offer" : "Create Special Offer",
  onClose
}) => {
  const [bannerFile, setBannerFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Banner file change
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      handleChange({
        target: {
          name: "banner",
          value: URL.createObjectURL(file) // preview
        }
      });
    }
  }, [handleChange]);

  // Condition helpers
  const addCondition = useCallback(() => {
    handleChange({
      target: {
        name: "conditions",
        value: [...form.conditions, ""]
      }
    });
  }, [form.conditions, handleChange]);

  const removeCondition = useCallback((index) => {
    handleChange({
      target: {
        name: "conditions",
        value: form.conditions.filter((_, i) => i !== index)
      }
    });
  }, [form.conditions, handleChange]);

  const updateCondition = useCallback((index, value) => {
    const updatedConditions = [...form.conditions];
    updatedConditions[index] = value;

    handleChange({
      target: {
        name: "conditions",
        value: updatedConditions
      }
    });
  }, [form.conditions, handleChange]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!form.coupon_name?.trim())
      newErrors.coupon_name = "Coupon name is required";
    if (!form.discountAmount || form.discountAmount <= 0)
      newErrors.discountAmount = "Valid discount amount is required";
    if (!form.usageLimit || form.usageLimit <= 0)
      newErrors.usageLimit = "Valid usage limit is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Submit handler
  // Submit handler
  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isEditing && !bannerFile) {
      // ✅ Creation without image → send plain JSON
      const payload = {
        ...form,
        conditions: form.conditions.filter(condition => condition.trim() !== "")
      };
      await handleSubmit(payload, isEditing);
    } else {
      // ✅ Editing OR creation with image → send FormData
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key !== "banner") {
          // Handle conditions array separately
          if (key === "conditions") {
            // Append each condition as a separate field
            value
              .filter(condition => condition.trim() !== "")
              .forEach((condition, index) => {
                formData.append(`conditions[${index}]`, condition);
              });
          }
          // Normalize numbers
          else if (["minPurchase", "day", "usageLimit", "coin"].includes(key)) {
            formData.append(key, value === "" ? null : Number(value));
          } else {
            formData.append(key, value ?? "");
          }
        }
      });

      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      await handleSubmit(formData, isEditing);
    }
  }, [validateForm, form, bannerFile, handleSubmit, isEditing]);


  // Handle close
  const handleClose = useCallback(() => {
    setErrors({});
    setBannerFile(null);
    if (resetForm) resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Memoize form inputs to prevent unnecessary re-renders
  const formInputs = useMemo(() => ({
    coupon_name: form.coupon_name || "",
    banner: form.banner || "",
    discountType: form.discountType || "percentage",
    discountAmount: form.discountAmount || "",
    minPurchase: form.minPurchase || "",
    usageLimit: form.usageLimit || 1,
    coin: form.coin || 0,
    link: form.link || "",
    conditions: form.conditions || [""],
  }), [form]);

  if (!showForm) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onClick={handleClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-[9999]">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Gift className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading spinner */}
          {loading && (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          )}

          {/* Form */}
          {!loading && (
            <form
              onSubmit={onSubmit}
              className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
            >
              {/* Coupon Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-[#2563EB]" />
                  Coupon Name *
                </label>
                <input
                  name="coupon_name"
                  value={formInputs.coupon_name}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-lg border ${errors.coupon_name ? "border-red-500" : "border-gray-200"
                    } px-4 py-3 text-sm`}
                />
                {errors.coupon_name && (
                  <p className="text-red-500 text-xs">{errors.coupon_name}</p>
                )}
              </div>

              {/* Banner Upload */}
              {isEditing && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2 text-[#2563EB]" />
                  Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                 {formInputs.banner && (
    <div className="mt-2">
      <p className="text-xs text-gray-500 mb-1">Current Banner:</p>
      <img
        src={formInputs.banner}
        alt="Preview"
        className="w-full h-32 object-cover rounded-lg border"
      />
    </div>
  )}
              
              </div>

              )}

              {/* Discount Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-[#2563EB]" />
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={formInputs.discountType}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Discount Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-[#2563EB]" />
                  Discount Amount *
                </label>
                <input
                  name="discountAmount"
                  type={formInputs.discountType === "custom" ? "text" : "number"}
                  value={formInputs.discountAmount}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-lg border ${errors.discountAmount ? "border-red-500" : "border-gray-200"
                    } px-4 py-3 text-sm`}
                />
                {errors.discountAmount && (
                  <p className="text-red-500 text-xs">{errors.discountAmount}</p>
                )}
              </div>

              {/* Min Purchase */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <ShoppingBag className="w-4 h-4 mr-2 text-[#2563EB]" />
                  Min Purchase
                </label>
                <input
                  name="minPurchase"
                  type="number"
                  value={formInputs.minPurchase}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                />
              </div>

              {/* Usage Limit */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Users className="w-4 h-4 mr-2 text-[#2563EB]" />
                  Usage Limit *
                </label>
                <input
                  name="usageLimit"
                  type="number"
                  value={formInputs.usageLimit}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-lg border ${errors.usageLimit ? "border-red-500" : "border-gray-200"
                    } px-4 py-3 text-sm`}
                />
                {errors.usageLimit && (
                  <p className="text-red-500 text-xs">{errors.usageLimit}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-[#2563EB]" /> Validity (Days)
                </label>
                <input
                  name="day"
                  type="number"
                  value={formInputs.day}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center">
                  <Coins className="w-4 h-4 mr-2 text-[#2563EB]" /> Coins
                </label>
                <input
                  name="coin"
                  type="number"
                  value={formInputs.coin}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                />
              </div>

              {/* Link */}
              <div>
                <label className="text-sm font-medium flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2 text-[#2563EB]" /> Link
                </label>
                <input
                  name="link"
                  type="text"
                  value={formInputs.link}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
                />
              </div>

              {/* Conditions */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conditions</span>
                  <button
                    type="button"
                    onClick={addCondition}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </button>
                </div>
                {formInputs.conditions.map((condition, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      value={condition}
                      onChange={(e) => updateCondition(index, e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm"
                    />
                    {formInputs.conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCondition(index)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 rounded-lg py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg py-3 flex justify-center items-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isEditing ? (
                    "Update Item"
                  ) : (
                    "Create Item"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default RedeemStoreForm;