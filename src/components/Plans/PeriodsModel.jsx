// components/PeriodModal.jsx
import { useState, useEffect } from 'react';

const PeriodModal = ({ isOpen, onClose, plan, onPeriodSelect }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  
  const periodOptions = [
    { years: 1, months: 12, discount: 0 },
    { years: 2, months: 24, discount: 0 },
    { years: 3, months: 36, discount: 0 },
  ];

  const calculatePrice = (basePrice, years, discount) => {
    const yearlyPrice = basePrice ; // Convert paise to rupees
    const totalBeforeDiscount = yearlyPrice * years;
    const discountAmount = (totalBeforeDiscount * discount) / 100;
    const finalPrice = totalBeforeDiscount - discountAmount;
    return {
      original: totalBeforeDiscount,
      discounted: finalPrice,
      savings: discountAmount,
      perYear: finalPrice / years
    };
  };

  const handleProceed = () => {
    const selectedOption = periodOptions.find(opt => opt.years === selectedPeriod);
    onPeriodSelect(plan, selectedOption);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Choose Subscription Period
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              For <span className="font-semibold">{plan.name}</span> plan
            </p>
          </div>

          {/* Period Options */}
          <div className="p-6 space-y-4">
            {periodOptions.map((option) => {
              const priceDetails = calculatePrice(plan.price, option.years, option.discount);
              
              return (
                <div
                  key={option.years}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPeriod === option.years
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPeriod(option.years)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPeriod === option.years
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedPeriod === option.years && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          {option.years} Year{option.years > 1 ? 's' : ''}
                        </span>
                        {option.discount > 0 && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Save {option.discount}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ₹{priceDetails.discounted.toFixed(2)}
                      </div>
                      {option.discount > 0 && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{priceDetails.original.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  {option.discount > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      ₹{priceDetails.perYear.toFixed(2)}/year • Save ₹{priceDetails.savings.toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodModal;