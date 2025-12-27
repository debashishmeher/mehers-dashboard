import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MessagePopup from '../Common/MessagePopup';
import { useUser } from '../../Context/ContextApt';
import PresetCard from './PresetCard'; // assuming you’ll reuse this
import OfferForm from './PresetsForm';

const PresetsPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('Own');

  const { userData } = useUser();
  const user = userData.user.role;
  const { userId } = useParams();

  const getUrl =
    user === 'admin'
      ? `${import.meta.env.VITE_API_URL}/api/admin/user/${userId}/getDiscount`
      : `${import.meta.env.VITE_API_URL}/api/user/getCoupon`;

  const setUrl =
    user === 'admin'
      ? `${import.meta.env.VITE_API_URL}/api/admin/user/${userId}/setDiscount`
      : `${import.meta.env.VITE_API_URL}/api/user/setCoupon`;

  // initial form state
  const [form, setForm] = useState({
    discountType: 'percentage',
    presetName: '',
    discountAmount: '',
    maxDiscount: '',
    minPurchase: '',
    day: '',
    hour: '',
    usageLimit: '',
    type: 'own',
    conditions: [''],
    link: '',
    startAt: null,
    expireAt: null,
  });

  // fetch offers
  const fetchOffers = async () => {
    try {
      const res = await fetch(getUrl, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOffers(data.discount || []);
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      discountType: 'percentage',
      presetName: '',
      discountAmount: '',
      maxDiscount: '',
      minPurchase: '',
      day: '',
      hour: '',
      usageLimit: '',
      type: 'own',
      conditions: [''],
      link: '',
      startAt: null,
      expireAt: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(setUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Offer created successfully!');
        resetForm();
        fetchOffers();
        setShowForm(false);
      } else {
        setMessage(data.message || '❌ Failed to create offer.');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Error creating offer.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['Own', 'Cross Brand'];

  const filteredOffers = offers.filter((offer) => {
    if (activeTab === 'Own') return offer.type === 'own';
    if (activeTab === 'Cross Brand') return offer.type === 'cross';
    return false;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md min-h-screen">
      {message && (
        <MessagePopup
          message={message}
          type={message.includes('✅') ? 'success' : 'error'}
          onClose={() => setMessage('')}
        />
      )}

      <div className="flex justify-between mb-6 items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Special Offers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md shadow transition"
        >
          + Create Offer
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-indigo-500 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 my-6">
        {filteredOffers.length > 0 ? (
          filteredOffers.map((offer, index) => (
            <PresetCard key={index} preset={offer} index={index} />
          ))
        ) : (
          <div className="text-gray-500 col-span-full text-center py-10">
            No {activeTab} offers found.
          </div>
        )}
      </div>

      {/* OfferForm Modal */}
      <OfferForm
        showForm={showForm}
        setShowForm={setShowForm}
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
        loading={loading}
        title="Create Special Offer"
      />
    </div>
  );
};

export default PresetsPage;
