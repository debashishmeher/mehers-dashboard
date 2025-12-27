// pages/PlansPage.jsx
import { useState, useEffect } from 'react';
import { usePlans } from '../../hooks/usePlans';
import PlanCard from './PlanCard';
import PeriodModal from './PeriodsModel';
import Cookies from 'js-cookie';
import { useUser } from '../../Context/ContextApt';

const PlansPage = () => {
  const { plans, loading, error } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = Cookies.get('authToken');
  const { userData } = useUser();

  // ✅ Load Razorpay script once
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve, reject) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject('Failed to load Razorpay SDK');
        document.body.appendChild(script);
      });
    };

    loadRazorpay().catch(err => console.error(err));
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handlePeriodSelect = async (plan, periodOption) => {
    setIsModalOpen(false);

    try {
      // Step 1: Create order on backend
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `${token}`
        },
        body: JSON.stringify({
          planId: plan._id,
          planName: plan.name,
          years: periodOption.years,
        }),
      });

      const orderData = await orderResponse.json();
      console.log(orderData);

      if (!orderData.status || orderData.status !== 'success') {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // ✅ Step 2: Check if Razorpay SDK is available
      if (typeof window.Razorpay === 'undefined') {
        alert('Razorpay SDK not loaded. Please refresh and try again.');
        return;
      }

      // Step 3: Create options and open checkout
      const options = {
        key: "rzp_test_RRP1wKh3V4oJUp",
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'GigaX',
        description: `${plan.name} Plan - ${periodOption.years} Year${periodOption.years > 1 ? 's' : ''}`,
        order_id: orderData.data.id,
        handler: async function (response) {
          try {
            // Step 4: Verify payment on backend
            const verificationResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/razorpay/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                authorization: `${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan._id,
                years: periodOption.years
              }),
            });

            const verificationData = await verificationResponse.json();

            if (verificationData.success) {
              alert('Payment successful! Your plan has been activated.');
              // Redirect or refresh user plan data
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData?.phone 
        },
        notes: {
          plan: plan.name,
          period: `${periodOption.years} years`
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading plans</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your digital card needs. 
            Start with our free plan or unlock advanced features with our premium options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              isPopular={plan.name === 'Personal'}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              All plans include
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
              <div className="flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure hosting
              </div>
              <div className="flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Fast loading
              </div>
              <div className="flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL Certificate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selection Modal */}
      <PeriodModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        plan={selectedPlan}
        onPeriodSelect={handlePeriodSelect}
      />
    </div>
  );
};

export default PlansPage;
