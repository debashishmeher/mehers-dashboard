// components/PlanCard.jsx
const PlanCard = ({ plan, isPopular = false, onSelectPlan }) => {
  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `₹${(price / 100).toFixed(2)}`;
  };

  const getDurationText = (days) => {
    if (days === 0) return 'Lifetime';
    if (days === 365) return 'Per year';
    return `${days} days`;
  };

  const handleButtonClick = () => {
    if (plan.price === 0) {
      // Handle free plan directly
      // You can redirect to signup or handle free plan creation
      console.log('Free plan selected');
    } else {
      // Open period modal for paid plans
      onSelectPlan(plan);
    }
  };

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg border ${
      isPopular 
        ? 'border-blue-500 transform scale-105 ring-2 ring-blue-200' 
        : 'border-gray-200'
    } transition-all duration-300 hover:shadow-xl`}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="p-8">
        {/* Plan Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrice(plan.price)}
            </span>
            {plan.price > 0 && (
              <span className="text-gray-600 ml-2">/{getDurationText(plan.durationInDays)}</span>
            )}
          </div>
          {plan.price > 0 && (
            <p className="text-gray-600 text-sm">
              {`₹${(plan.price / 100 / 12).toFixed(2)}/month`}
            </p>
          )}
        </div>

        {/* Features List */}
        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={handleButtonClick}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            isPopular
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : plan.price === 0
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          }`}
        >
          {plan.price === 0 ? 'Get Started' : 'Choose Plan'}
        </button>
      </div>
    </div>
  );
};

export default PlanCard;