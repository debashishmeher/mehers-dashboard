import { FaCoins, FaEdit, FaList, FaSpinner, FaTimes, FaTrash, FaPlus } from "react-icons/fa";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import SocialMediaRewardsSection from "./SocialMediaRewardSection";
import ReferralCoinsModal from "./ReferralCoinModal";
import UpdateFieldModal from "./ReferralCoinModal";

export default function Setting() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isJoiningModalOpen, setIsJoiningModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategories, setEditingCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [referralCoin, setReferralCoin] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [modalField, setModalField] = useState(null);


  const handleOpenModal = (field, label) => setModalField({ field, label });

  // Default settings template
  const [newSettings, setNewSettings] = useState({
    referralCoin: 10,
    signupCoin: 5,
    socialMediaRewards: {
      facebook: 5,
      twitter: 5,
      instagram: 5,
      linkedin: 5,
      youtube: 5
    },
    category: []
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.data);
        setReferralCoin(data.data?.referralCoin || 0);
      } else {
        setSettings(null);
      }

    } catch (err) {
      setError(err.message);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCreateSettings = async () => {
    setIsSaving(true);
    try {
      const token = Cookies.get('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(newSettings)
      });

      if (!response.ok) {
        throw new Error('Failed to create settings');
      }

      const data = await response.json();
      setSettings(data.data);
      setIsCreateModalOpen(false);
      fetchSettings(); // Refresh the settings
    } catch (error) {
      console.error('Error creating settings:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSetting = async (field, value) => {
    setIsSaving(true);
    try {
      const token = Cookies.get('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({
          [field]: value
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${field}`);
      }

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        [field]: data.data[field]
      }));
      return true;
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRewards = async (platform, newValue) => {
    return handleUpdateSetting('socialMediaRewards', {
      ...settings.socialMediaRewards,
      [platform]: newValue
    });
  };

  const handleOpenCategoryModal = () => {
    setEditingCategories(settings?.category || []);
    setIsCategoryModalOpen(true);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !editingCategories.includes(newCategory.trim())) {
      setEditingCategories([...editingCategories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (index) => {
    setEditingCategories(editingCategories.filter((_, i) => i !== index));
  };

  const handleUpdateCategories = async () => {
    const success = await handleUpdateSetting('category', editingCategories);
    if (success) {
      setIsCategoryModalOpen(false);
    }
  };

  const handleUpdateReferralCoin = async () => {
    const success = await handleUpdateSetting('referralCoin', referralCoin);
    if (success) {
      setIsReferralModalOpen(false);
    }
  };
  // Submit updates to context
  const onSubmit = (updated) => {
    setSettings((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  if (loading) return <div className="text-center py-8">Loading settings...</div>;

  if (!settings && !error) {
    return (
      <div className="max-w-screen-lg mx-auto p-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-6 text-center text-white">
            <div className="mx-auto w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <FaCoins className="text-white text-3xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome to Your Admin Panel</h2>
            <p className="opacity-90">Let's configure your initial settings</p>
          </div>

          {/* Create Settings Form */}
          <div className="p-8">
            {isCreateModalOpen ? (
              <div className="space-y-6">
                {/* Referral Settings */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2">
                    <FaCoins /> Referral Program
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referral Reward (coins)
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={newSettings.referralCoin}
                          onChange={(e) => setNewSettings({
                            ...newSettings,
                            referralCoin: Math.max(0, Number(e.target.value))
                          })}
                          className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          min="0"
                          placeholder="10"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">coins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Rewards */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2">
                    <FaCoins /> Social Media Rewards
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(newSettings.socialMediaRewards).map(([platform, value]) => (
                      <div key={platform} className="flex items-center">
                        <label className="w-24 capitalize text-sm font-medium text-gray-700">
                          {platform}:
                        </label>
                        <div className="flex-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => setNewSettings({
                              ...newSettings,
                              socialMediaRewards: {
                                ...newSettings.socialMediaRewards,
                                [platform]: Math.max(0, Number(e.target.value))
                              }
                            })}
                            className="block w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            min="0"
                            placeholder="5"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">coins</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2">
                    <FaList /> Content Categories
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Categories (Press Enter after each)
                    </label>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newCategory.trim()) {
                            setNewSettings({
                              ...newSettings,
                              category: [...newSettings.category, newCategory.trim()]
                            });
                            setNewCategory('');
                            e.preventDefault();
                          }
                        }}
                        className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. Technology"
                      />
                      <button
                        onClick={() => {
                          if (newCategory.trim()) {
                            setNewSettings({
                              ...newSettings,
                              category: [...newSettings.category, newCategory.trim()]
                            });
                            setNewCategory('');
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>

                    {/* Categories Preview */}
                    {newSettings.category.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          {newSettings.category.map((cat, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                            >
                              {cat}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...newSettings.category];
                                  updated.splice(index, 1);
                                  setNewSettings({
                                    ...newSettings,
                                    category: updated
                                  });
                                }}
                                className="ml-1.5 inline-flex text-indigo-600 hover:text-indigo-900"
                              >
                                <FaTimes className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSettings}
                    disabled={isSaving || newSettings.category.length === 0}
                    className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${isSaving || newSettings.category.length === 0
                        ? 'bg-indigo-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        Creating Settings...
                      </span>
                    ) : 'Save Settings'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto shadow-lg"
                >
                  <FaPlus className="text-lg" />
                  <span className="font-medium">Initialize Application Settings</span>
                </button>
                <p className="mt-4 text-sm text-gray-500">
                  This will set up default rewards and categories for your application
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <FaTimes className="text-4xl mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Settings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-content min-h-28 max-w-screen-lg mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 w-full my-10 divide-y py-4 divide-gray-200">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <FaCoins className="text-[#2563EB] text-xl" />
          <h2 className="text-base font-semibold">Admin Settings</h2>
        </div>

        {/* Settings List */}
        <div className="divide-y divide-gray-200">
          {/* Referral Coins */}
          <div
            key="referral-coins"
            className="cursor-pointer flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors bg-white"
            onClick={(e) => {
            
              handleOpenModal("referralCoin", "Referral Coins");
            }
            }
          >
            <div className="flex-1 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 basis-[100px]">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaCoins className="text-[#2563EB] text-lg" />
                </div>
                <span className="text-gray-600 font-medium">
                  Referral Coins
                </span>
              </div>
              <div className="flex-1 basis-[100px]">
                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                  {settings?.referralCoin || 0} coins
                </span>
              </div>
            </div>
            <div className="pl-4 flex gap-2">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Joining Coins */}
          <div
            key="joining-coins"
            className="cursor-pointer flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors bg-white"
            onClick={() => {
              handleOpenModal("signupCoin", "Joining Coins");
            }}
          >
            <div className="flex-1 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 basis-[100px]">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaCoins className="text-[#2563EB] text-lg" />
                </div>
                <span className="text-gray-600 font-medium">
                  Joining Coins
                </span>
              </div>
              <div className="flex-1 basis-[100px]">
                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                  {settings?.signupCoin || 0} coins
                </span>
              </div>
            </div>
            <div className="pl-4 flex gap-2">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Social Media Rewards */}
          <SocialMediaRewardsSection
            settings={settings}
            onUpdateRewards={handleUpdateRewards}
          />

          {/* Categories */}
          <div
            key="categories"
            className="cursor-pointer flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors bg-white"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenCategoryModal();
            }}
          >
            <div className="flex-1 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 basis-[100px]">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FaList className="text-indigo-600 text-lg" />
                </div>
                <span className="text-gray-600 font-medium">
                  Categories
                </span>
              </div>
              <div className="flex-1 basis-[100px]">
                <div className="flex flex-wrap gap-2">
                  {settings.category?.length > 0 ? (
                    settings.category.slice(0, 3).map((cat, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-sm">
                      No categories
                    </span>
                  )}
                  {settings.category?.length > 3 && (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                      +{settings.category.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="pl-4 flex gap-2">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Category Edit Modal */}
          {isCategoryModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl transition-all">
                {/* Modal Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-indigo-100">
                      <FaList className="text-indigo-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Manage Categories
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Add or remove content categories</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-full hover:bg-gray-100"
                    disabled={isSaving}
                    aria-label="Close modal"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700">
                      Add New Category
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="newCategory"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        placeholder="Enter category name"
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        disabled={isSaving}
                      />
                      <button
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim() || isSaving}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Current Categories ({editingCategories.length})
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
                      {editingCategories.length > 0 ? (
                        editingCategories.map((cat, index) => (
                          <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                            <span className="text-gray-800 font-medium">{cat}</span>
                            <button
                              onClick={() => handleRemoveCategory(index)}
                              disabled={isSaving}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No categories added yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateCategories}
                    disabled={isSaving || editingCategories.length === 0}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${isSaving
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                      }`}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </span>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Referral Coin Edit Modal */}
          {modalField && (
            <UpdateFieldModal
              settings={settings}
              field={modalField.field}
              label={modalField.label}
              onClose={() => setModalField(null)}
              onSubmit={onSubmit}
            />
          )}

          {/* Created At */}
          <div className="flex items-center justify-between py-4 border-t">
            <div className="flex-1 flex items-center gap-4 flex-wrap">
              <span className="text-gray-600 flex-1 basis-[100px]">Last Updated</span>
              <span className="text-gray-800 font-medium flex-1 basis-[100px]">
                {new Date(settings.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}