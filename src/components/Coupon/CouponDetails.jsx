import { X } from 'lucide-react';

const CouponDetails = ({
 coupon,setShowReviewCard
}) => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white p-6 sm:p-8 border-b border-gray-100">
          <button
            onClick={() => setShowReviewCard(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X size={22} />
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
            🎁 Coupon Details
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 sm:px-8 py-4 space-y-4 text-sm sm:text-base text-gray-700">
          <Detail label="Name" value={coupon.account?.name || "N/A"} />
          <Detail label="Number" value={coupon.account?.phone || "N/A"} />
          <Detail label="Email" value={coupon.account?.email || "N/A"} />
          <Detail label="Source" value={coupon.source || "N/A"} />
          <Detail
            label="Code"
            value={
              <span className="font-mono bg-blue-100 text-blue-700 px-3 py-1 rounded-lg tracking-wider">
                {coupon.code}
              </span>
            }
          />
          <Detail label="Discount Type" value={coupon.discountType} />
          <Detail
            label="Discount Amount"
            value={coupon.discountType === 'percentage'
              ? `${coupon.discountAmount}%`
              : `${coupon.discountAmount}`}
          />
          {coupon.maxDiscount && (
            <Detail label="Max Discount" value={`${coupon.maxDiscount}`} />
          )}
          <Detail label="Min Purchase" value={`${coupon.minPurchase}`} />
          <Detail label="Created At" value={new Date(coupon.createdAt).toLocaleDateString()} />
          <Detail label="Expiration Date" value={new Date(coupon.expirationDate).toLocaleDateString()} />
          <Detail label="Usage Limit" value={coupon.usageLimit} />
          <Detail label="Usage Count" value={coupon.usageCount} />
          <Detail label="Status" value={<StatusPill status={coupon.status} />} />
          {coupon.redeemedAt && (
            <Detail label="Redeemed At" value={new Date(coupon.redeemedAt).toLocaleDateString()} />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-white px-6 sm:px-8 py-4 border-t border-gray-100 text-center">
          <button
            onClick={() => setShowReviewCard(false)}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition shadow-sm w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => {
  const displayValue = label === 'Discount Type' || label === "Name" || label === "Source"
    ? value
    : value;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-gray-100 pb-3">
      <span className="font-medium text-gray-600 sm:w-2/5 text-left mb-1 sm:mb-0">{label}:</span>
      <span className="text-right sm:w-3/5 text-gray-800 break-words">{displayValue}</span>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();
  const statusStyles =
    normalizedStatus === 'active'
      ? 'bg-green-100 text-green-700'
      : normalizedStatus === 'redeemed'
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles}`}>
      {status}
    </span>
  );
};

export default CouponDetails;