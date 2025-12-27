import { useState, useEffect } from "react";
import { Search, Calendar, ExternalLink } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const CrossBrand = () => {
  const [data, setData] = useState(null);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingSet, setLoadingSet] = useState(null); // track which card is setting

  const token = Cookies.get("authToken");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCrossBrandData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/api/cross-brand/store`, {
          headers: { Authorization: `${token}` },
          withCredentials: true,
        });

        const allPresets = response.data.data.crossBrand.flatMap((brand) =>
          brand.presets.map((preset) => ({
            ...preset,
            brandInfo: brand.card,
          }))
        );

        setData(response.data);
        setFilteredPromotions(allPresets);
      } catch (err) {
        console.error("Failed to fetch cross brand data:", err);
        setError("Failed to load promotions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrossBrandData();
  }, [API_URL, token]);

  const formatDate = (dateString) => {
    if (!dateString) return "No expiration";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDiscountText = (promotion) => {
    if (promotion.discountType === "percentage") {
      return `${promotion.discountAmount}% Off`;
    } else if (promotion.discountType === "fixed") {
      return `₹${promotion.discountAmount} Off`;
    } else {
      return promotion.discountAmount;
    }
  };

  const getStatusBadge = (promotion) => {
    const now = new Date();
    const expireDate = promotion.expireAt ? new Date(promotion.expireAt) : null;

    if (!promotion.isActive) {
      return { text: "Inactive", color: "bg-red-100 text-red-700" };
    }

    if (expireDate && expireDate < now) {
      return { text: "Expired", color: "bg-gray-100 text-gray-700" };
    }

    return { text: "Active", color: "bg-green-100 text-green-700" };
  };

  // 🔑 Handle setting a coupon
  const handleSetCoupon = async (presetId) => {
    setLoadingSet(presetId);
    try {
      const res = await fetch(`${API_URL}/api/cross-brand/${presetId}/set`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      credentials: "include",
    });

      console.log(res.data);
      
    } catch (err) {
      console.error("Failed to set coupon:", err);
      alert("Failed to set coupon. Please try again.");
    } finally {
      setLoadingSet(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
          Cross Brand Promotions
        </h1>

        {error && (
          <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md h-52 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPromotions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promotion) => {
              const status = getStatusBadge(promotion);

              return (
                <div
                  key={promotion._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100"
                >
                  {/* Brand Info */}
                  <div className="flex items-center gap-3 mb-4">
                    {promotion.brandInfo.logo ? (
                      <img
                        src={promotion.brandInfo.logo}
                        alt={promotion.brandInfo.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                        {promotion.brandInfo.name?.charAt(0) || "B"}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {promotion.brandInfo.name || "Unknown Brand"}
                      </h3>
                      <p className="text-xs text-gray-500 truncate max-w-[180px]">
                        {promotion.brandInfo.address || "No address"}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                  >
                    {status.text}
                  </span>

                  {/* Promotion Title */}
                  <h2 className="text-lg font-medium text-gray-900 mt-3 mb-1">
                    {promotion.presetName}
                  </h2>

                  {/* Discount */}
                  <p className="text-blue-600 font-semibold mb-3">
                    {getDiscountText(promotion)}{" "}
                    {promotion.maxDiscount && (
                      <span className="text-gray-500 text-sm">
                        (Upto ₹{promotion.maxDiscount})
                      </span>
                    )}
                  </p>

                  {/* Expiry */}
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar className="h-3 w-3 mr-1" />
                    Expires: {formatDate(promotion.expireAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    {promotion.link && (
                      <a
                        href={promotion.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm inline-flex items-center hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit Offer
                      </a>
                    )}
                    <button
                      onClick={() => handleSetCoupon(promotion._id)}
                      disabled={loadingSet === promotion._id}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg"
                    >
                      {loadingSet === promotion._id ? "Setting..." : "Set Coupon"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            No promotions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossBrand;
