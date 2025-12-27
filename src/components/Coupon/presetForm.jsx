import { X, Calendar, Clock, Tag, DollarSign, MinusCircle, ShoppingBag, Users, Link as LinkIcon, Plus, Trash2, Crosshair, Gift } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

export default function OfferForm({
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
}) {
  const [errors, setErrors] = useState({});
  const [hasValidityPeriod, setHasValidityPeriod] = useState(false);
  const [hasExpiryDuration, setHasExpiryDuration] = useState(false);

  // Parse datetime fields from form data
  const getDateTimeFromISO = (isoString) => {
    if (!isoString) return { date: '', time: '09:00' };
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return { date: '', time: '09:00' };
      return {
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().substring(0, 5)
      };
    } catch {
      return { date: '', time: '09:00' };
    }
  };

  const startDateTime = getDateTimeFromISO(form.startAt);
  const endDateTime = getDateTimeFromISO(form.expireAt);

  // Initialize form state
  useEffect(() => {
    if (form.startAt) {
      setHasValidityPeriod(true);
    }
    
    if (form.day || form.hour) {
      setHasExpiryDuration(true);
    }
    
    // Ensure conditions is always an array
    if (!form.conditions || !Array.isArray(form.conditions)) {
      handleChange({ target: { name: 'conditions', value: [''] } });
    }
  }, [form, showForm]);

  // Update datetime fields in form
  const updateDateTimeFields = useCallback(() => {
    if (hasValidityPeriod && startDateTime.date && startDateTime.time) {
      const startAt = new Date(`${startDateTime.date}T${startDateTime.time}`);
      if (!isNaN(startAt)) {
        handleChange({ target: { name: 'startAt', value: startAt.toISOString() } });
      }
    } else {
      handleChange({ target: { name: 'startAt', value: null } });
    }
    
    if (hasValidityPeriod && endDateTime.date && endDateTime.time) {
      const expireAt = new Date(`${endDateTime.date}T${endDateTime.time}`);
      if (!isNaN(expireAt)) {
        handleChange({ target: { name: 'expireAt', value: expireAt.toISOString() } });
      }
    } else {
      handleChange({ target: { name: 'expireAt', value: null } });
    }
  }, [hasValidityPeriod, startDateTime, endDateTime, handleChange]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate presetName
    if (!form.presetName?.trim()) {
      newErrors.presetName = 'Offer name is required';
    } else if (form.presetName.trim().length < 3) {
      newErrors.presetName = 'Offer name must be at least 3 characters';
    } else if (form.presetName.trim().length > 50) {
      newErrors.presetName = 'Offer name must be at most 50 characters';
    }

    // Validate discount fields based on type
    if (form.discountType !== 'custom') {
      if (!form.discountAmount || form.discountAmount <= 0) {
        newErrors.discountAmount = 'Valid discount amount is required';
      }
      
      // Max discount is required for percentage and fixed types
      if (!form.maxDiscount || form.maxDiscount <= 0) {
        newErrors.maxDiscount = 'Valid max discount is required';
      }
    } else {
      // For custom offers, discountAmount is a string description
      if (!form.discountAmount?.trim()) {
        newErrors.discountAmount = 'Custom offer description is required';
      }
    }

    // Min purchase is optional in schema but let's validate if provided
    if (form.minPurchase !== null && form.minPurchase !== undefined && form.minPurchase < 0) {
      newErrors.minPurchase = 'Minimum purchase cannot be negative';
    }

    // Validate expiry duration if enabled
    if (hasExpiryDuration) {
      if (form.day === undefined || form.day === null || form.day < 0) {
        newErrors.day = 'Day must be a non-negative number';
      }
      
      if (form.hour === undefined || form.hour === null || form.hour < 0) {
        newErrors.hour = 'Hour must be a non-negative number';
      }
      
      // At least one of day or hour should be provided
      if ((!form.day || form.day === 0) && (!form.hour || form.hour === 0)) {
        newErrors.day = 'Please provide either days or hours for expiry';
        newErrors.hour = 'Please provide either days or hours for expiry';
      }
    } else {
      // Clear day and hour if duration is disabled
      handleChange({ target: { name: 'day', value: null } });
      handleChange({ target: { name: 'hour', value: null } });
    }

    // Usage limit is required
    if (!form.usageLimit || form.usageLimit <= 0) {
      newErrors.usageLimit = 'Valid usage limit is required';
    }

    // Validate validity period only if enabled
    if (hasValidityPeriod) {
      if (!startDateTime.date) newErrors.startDate = 'Start date is required';
      if (!endDateTime.date) newErrors.endDate = 'End date is required';

      if (startDateTime.date && endDateTime.date) {
        const start = new Date(`${startDateTime.date}T${startDateTime.time}`);
        const end = new Date(`${endDateTime.date}T${endDateTime.time}`);
        if (end <= start) newErrors.endDate = 'End date must be after start date';
        if (start < new Date()) newErrors.startDate = 'Start date cannot be in the past';
      }
    } else {
      // Clear datetime fields when validity period is disabled
      handleChange({ target: { name: 'startAt', value: null } });
      handleChange({ target: { name: 'expireAt', value: null } });
    }

    // Validate conditions - now optional
    const validConditions = form.conditions?.filter(cond => cond?.trim() !== '') || [];
    for (let i = 0; i < validConditions.length; i++) {
      if (!validConditions[i]?.trim()) {
        newErrors[`condition-${i}`] = 'Condition cannot be empty';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, startDateTime, endDateTime, hasValidityPeriod, hasExpiryDuration, handleChange]);

  // Submit handler
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    updateDateTimeFields();
    if (validateForm()) {
      handleSubmit(e);
    }
  }, [updateDateTimeFields, validateForm, handleSubmit]);

  // Condition handlers
  const addCondition = () => {
    const newConditions = [...(form.conditions || []), ''];
    handleChange({ target: { name: 'conditions', value: newConditions } });
  };

  const removeCondition = (index) => {
    if (form.conditions && form.conditions.length > 1) {
      const newConditions = [...form.conditions];
      newConditions.splice(index, 1);
      handleChange({ target: { name: 'conditions', value: newConditions } });
      
      // Clear any error for this condition
      if (errors[`condition-${index}`]) {
        const newErrors = {...errors};
        delete newErrors[`condition-${index}`];
        setErrors(newErrors);
      }
    }
  };

  const updateCondition = (index, value) => {
    const newConditions = [...(form.conditions || [])];
    newConditions[index] = value;
    handleChange({ target: { name: 'conditions', value: newConditions } });
    
    // Clear error for this condition if it exists
    if (errors[`condition-${index}`]) {
      const newErrors = {...errors};
      delete newErrors[`condition-${index}`];
      setErrors(newErrors);
    }
  };

  // Change handlers
  const handleFieldChange = useCallback((e) => {
    const { name, value, type } = e.target;
    
    // Convert numeric fields to numbers
    let processedValue = value;
    if (type === 'number' && value !== '') {
      processedValue = parseFloat(value);
    }
    
    handleChange({
      target: {
        name,
        value: processedValue
      }
    });
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors, handleChange]);

  const handleDateTimeChange = useCallback((field, value) => {
    if (field === 'startDate') {
      handleChange({ target: { name: 'startAt', value: `${value}T${startDateTime.time}` } });
    } else if (field === 'startTime') {
      handleChange({ target: { name: 'startAt', value: `${startDateTime.date}T${value}` } });
    } else if (field === 'endDate') {
      handleChange({ target: { name: 'expireAt', value: `${value}T${endDateTime.time}` } });
    } else if (field === 'endTime') {
      handleChange({ target: { name: 'expireAt', value: `${endDateTime.date}T${value}` } });
    }
    
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors, handleChange, startDateTime, endDateTime]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const handleClose = () => {
    setShowForm(false);
    setErrors({});
    onClose?.();
  };

  const handleReset = () => {
    resetForm();
    setHasValidityPeriod(false);
    setHasExpiryDuration(false);
    setErrors({});
  };

  const toggleValidityPeriod = () => {
    const newHasValidityPeriod = !hasValidityPeriod;
    setHasValidityPeriod(newHasValidityPeriod);
    
    if (!newHasValidityPeriod) {
      // Clear datetime fields when disabling validity period
      handleChange({ target: { name: 'startAt', value: null } });
      handleChange({ target: { name: 'expireAt', value: null } });
    }
    
    // Clear date errors when toggling
    if (errors.startDate || errors.endDate) {
      const newErrors = {...errors};
      delete newErrors.startDate;
      delete newErrors.endDate;
      setErrors(newErrors);
    }
  };

  const toggleExpiryDuration = () => {
    const newHasExpiryDuration = !hasExpiryDuration;
    setHasExpiryDuration(newHasExpiryDuration);
    
    if (!newHasExpiryDuration) {
      // Clear day and hour fields when disabling expiry duration
      handleChange({ target: { name: 'day', value: null } });
      handleChange({ target: { name: 'hour', value: null } });
    }
    
    // Clear day/hour errors when toggling
    if (errors.day || errors.hour) {
      const newErrors = {...errors};
      delete newErrors.day;
      delete newErrors.hour;
      setErrors(newErrors);
    }
  };

  // Get icon based on offer type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'cross':
        return <Crosshair className="w-4 h-4 mr-2 text-[#2563EB]" />;
      case 'own':
        return <Gift className="w-4 h-4 mr-2 text-[#2563EB]" />;
      case 'offer':
      default:
        return <Tag className="w-4 h-4 mr-2 text-[#2563EB]" />;
    }
  };

  // Get label based on offer type
  const getTypeLabel = (type) => {
    switch (type) {
      case 'cross':
        return 'Cross Promotion';
      case 'own':
        return 'Own Promotion';
      case 'offer':
      default:
        return 'Special Offer';
    }
  };

  return (
    <>
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          onClick={handleClose}
        />
      )}

      <div className={`fixed inset-0 flex items-center justify-center z-[9999] transition ${showForm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`relative w-full max-w-md bg-white rounded-xl shadow-2xl transform transition ${showForm ? 'scale-100' : 'scale-95'}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                {getTypeIcon(form.type || 'offer')}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            
            {/* Offer Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                
                Offer Type
              </label>
              <select
                name="type"
                value={form.type || 'own'}
                onChange={handleFieldChange}
                disabled={loading}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:ring-purple-500"
              >
                <option value="own">Own Promotion</option>
                <option value="cross">Cross Promotion</option>
                <option value="offer">Special Offer</option>
              </select>
            </div>

            {/* Discount Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                
                Discount Type
              </label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleFieldChange}
                disabled={loading}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:ring-purple-500"
              >
                <option value="percentage">Percentage Off</option>
                <option value="fixed">Fixed Amount Off</option>
                <option value="custom">Custom Offer</option>
              </select>
            </div>

            {/* Offer Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                
                {getTypeLabel(form.type || 'own')} Name *
              </label>
              <input
                name="presetName"
                value={form.presetName || ''}
                onChange={handleFieldChange}
                placeholder={`Enter ${getTypeLabel(form.type || 'own').toLowerCase()} name`}
                disabled={loading}
                className={`w-full rounded-lg border ${errors.presetName ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-sm`}
              />
              {errors.presetName && <p className="text-red-500 text-xs">{errors.presetName}</p>}
            </div>

            {/* Discount / Custom Offer */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                
                {form.discountType === 'custom' ? 'Custom Offer *' : form.discountType === 'percentage' ? 'Discount Percentage *' : 'Discount Amount *'}
              </label>
              <input
                name="discountAmount"
                type={form.discountType === 'custom' ? 'text' : 'number'}
                value={form.discountAmount || ''}
                onChange={handleFieldChange}
                disabled={loading}
                placeholder={form.discountType === 'custom' ? 'E.g., Buy 1 Get 1 Free' : ''}
                className={`w-full rounded-lg border ${errors.discountAmount ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-sm`}
              />
              {errors.discountAmount && <p className="text-red-500 text-xs">{errors.discountAmount}</p>}
            </div>

            {/* Max Discount (only if not custom) */}
            {form.discountType !== 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  
                  Max Discount *
                </label>
                <input
                  name="maxDiscount"
                  type="number"
                  value={form.maxDiscount || ''}
                  onChange={handleFieldChange}
                  disabled={loading}
                  className={`w-full rounded-lg border ${errors.maxDiscount ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-sm`}
                />
                {errors.maxDiscount && <p className="text-red-500 text-xs">{errors.maxDiscount}</p>}
              </div>
            )}

            {/* Min Purchase (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                
                Min Purchase (Optional)
              </label>
              <input
                name="minPurchase"
                type="number"
                value={form.minPurchase || ''}
                onChange={handleFieldChange}
                disabled={loading}
                placeholder="0"
                min="0"
                className={`w-full rounded-lg border ${errors.minPurchase ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-sm`}
              />
              {errors.minPurchase && <p className="text-red-500 text-xs">{errors.minPurchase}</p>}
            </div>

            {/* Expiry Duration (Optional) */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Expiry Duration (Optional)
                </h3>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasExpiryDuration}
                    onChange={toggleExpiryDuration}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              {hasExpiryDuration && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Days</label>
                    <input
                      name="day"
                      type="number"
                      value={form.day || ''}
                      onChange={handleFieldChange}
                      disabled={loading}
                      placeholder="0"
                      min="0"
                      className={`w-full rounded-lg border ${errors.day ? 'border-red-500' : 'border-gray-200'} px-3 py-2 text-sm`}
                    />
                    {errors.day && <p className="text-red-500 text-xs">{errors.day}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Hours</label>
                    <input
                      name="hour"
                      type="number"
                      value={form.hour || ''}
                      onChange={handleFieldChange}
                      disabled={loading}
                      placeholder="0"
                      min="0"
                      max="23"
                      className={`w-full rounded-lg border ${errors.hour ? 'border-red-500' : 'border-gray-200'} px-3 py-2 text-sm`}
                    />
                    {errors.hour && <p className="text-red-500 text-xs">{errors.hour}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Conditions - Now Optional */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Conditions (optional)
                </label>
                <button 
                  type="button" 
                  onClick={addCondition}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Condition
                </button>
              </div>
              
              {(form.conditions || []).map((condition, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={condition || ''}
                    onChange={(e) => updateCondition(index, e.target.value)}
                    placeholder={`Condition ${index + 1}`}
                    disabled={loading}
                    className={`flex-1 rounded-lg border ${errors[`condition-${index}`] ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-sm`}
                  />
                  {(form.conditions || []).length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeCondition(index)}
                      className="p-3 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {Object.keys(errors).map(key => {
                if (key.startsWith('condition-')) {
                  return <p key={key} className="text-red-500 text-xs">{errors[key]}</p>;
                }
                return null;
              })}
            </div>

            {/* Link Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <LinkIcon className="w-4 h-4 mr-2 text-[#2563EB]" />
                Offer Link (optional)
              </label>
              <input
                name="link"
                type="url"
                value={form.link || ''}
                onChange={handleFieldChange}
                placeholder="https://your-offer-page.com"
                disabled={loading}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
              />
            </div>

            {/* Usage Limit */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Users className="w-4 h-4 mr-2 text-[#2563EB]" />
                Usage Limit *
              </label>
              <input
                name="usageLimit"
                type="number"
                value={form.usageLimit || ''}
                onChange={handleFieldChange}
                disabled={loading}
                min="1"
                className={`w-full rounded-lg border ${errors.usageLimit ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-sm`}
              />
              {errors.usageLimit && <p className="text-red-500 text-xs">{errors.usageLimit}</p>}
            </div>

            {/* Date Range - Now Optional */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Validity Period (optional)
                </h3>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasValidityPeriod}
                    onChange={toggleValidityPeriod}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              {hasValidityPeriod && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Start Date</label>
                      <input 
                        type="date" 
                        value={startDateTime.date} 
                        onChange={e => handleDateTimeChange('startDate', e.target.value)} 
                        min={getTodayDate()} 
                        className={`rounded-lg border ${errors.startDate ? 'border-red-500' : 'border-gray-200'} px-3 py-2 text-sm w-full`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Start Time</label>
                      <input 
                        type="time" 
                        value={startDateTime.time} 
                        onChange={e => handleDateTimeChange('startTime', e.target.value)} 
                        className={`rounded-lg border ${errors.startDate ? 'border-red-500' : 'border-gray-200'} px-3 py-2 text-sm w-full`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">End Date</label>
                      <input 
                        type="date" 
                        value={endDateTime.date} 
                        onChange={e => handleDateTimeChange('endDate', e.target.value)} 
                        min={startDateTime.date || getTodayDate()} 
                        className={`rounded-lg border ${errors.endDate ? 'border-red-500' : 'border-gray-200'} px-3 py-2 text-sm w-full`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">End Time</label>
                      <input 
                        type="time" 
                        value={endDateTime.time} 
                        onChange={e => handleDateTimeChange('endTime', e.target.value)} 
                        className={`rounded-lg border ${errors.endDate ? 'border-red-500' : 'border-gray-200'} px-3 py-2 text-sm w-full`}
                      />
                    </div>
                  </div>
                  {errors.startDate && <p className="text-red-500 text-xs">{errors.startDate}</p>}
                  {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t">
              <button type="button" onClick={handleReset} disabled={loading} className="w-1/2 bg-gray-100 hover:bg-gray-200 rounded-lg py-3">
                Clear All
              </button>
              <button type="submit" disabled={loading} className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg py-3">
                {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Offer' : 'Create Offer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}