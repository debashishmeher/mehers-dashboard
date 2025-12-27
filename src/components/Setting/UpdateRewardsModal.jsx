import { useState } from 'react';
import { FaTimes, FaCoins, FaSpinner } from 'react-icons/fa';
import Cookies from 'js-cookie';

export default function UpdateRewardsModal({ 
  platform, 
  currentValue, 
  onClose, 
  onSave,
  isSaving 
})  {
  const [newValue, setNewValue] = useState(currentValue);

  const handleSave = () => {
    onSave(platform.toLowerCase(), newValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaCoins className="text-yellow-500" />
            Update {platform} Rewards
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            disabled={isSaving}
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Reward Value
            </label>
            <div className="text-2xl font-bold text-gray-800">
              {currentValue} coins
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="newValue" className="block text-sm font-medium text-gray-700 mb-2">
              New Reward Value
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                id="newValue"
                min="0"
                value={newValue}
                onChange={(e) => setNewValue(parseInt(e.target.value) || 0)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 py-3 sm:text-sm border-gray-300 rounded-md border"
                placeholder="Enter new value"
                disabled={isSaving}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">coins</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || newValue === currentValue || newValue < 0}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
              isSaving || newValue === currentValue || newValue < 0
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};