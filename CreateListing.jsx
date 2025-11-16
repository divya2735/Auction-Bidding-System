import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

const CreateListing = () => {
  const navigate = useNavigate();
  const { tokens } = useAuth();
  const fileInputRef = useRef();
  
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    condition: '',
    category: '',
    start_time: '',
    auction_duration: '7d', // ✅ Updated default value
    starting_price: '',
    reserve_price: '',
    bid_increment: '1.00',
    buy_it_now: false,
  });
  
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const conditionOptions = [
    { value: '', label: 'Select condition' },
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    { value: 'home', label: 'Luxurious Bungalow Or Villa' },
    { value: 'automotive', label: 'Rare & Classic Cars' },
    { value: 'jewelry', label: 'Expensive Jewelry & Watches' },
    { value: 'art', label: 'Luxurious Arts' },
    { value: 'other', label: 'Other' },
  ];

  // ✅ NEW: Updated duration options with minutes and hours
  const durationOptions = [
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '3h', label: '3 Hours' },
    { value: '6h', label: '6 Hours' },
    { value: '12h', label: '12 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '3d', label: '3 Days' },
    { value: '5d', label: '5 Days' },
    { value: '7d', label: '7 Days' },
    { value: '10d', label: '10 Days' },
    { value: '14d', label: '14 Days' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 10;
    
    if (images.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file,
          preview: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Item name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }
    
    if (!formData.starting_price || parseFloat(formData.starting_price) <= 0) {
      newErrors.starting_price = 'Valid starting price is required';
    }
    
    if (formData.reserve_price && parseFloat(formData.reserve_price) < parseFloat(formData.starting_price)) {
      newErrors.reserve_price = 'Reserve price must be greater than starting price';
    }
    
    if (!formData.bid_increment || parseFloat(formData.bid_increment) <= 0) {
      newErrors.bid_increment = 'Valid bid increment is required';
    }
    
    return newErrors;
  };

  // ✅ NEW: Calculate end time based on duration format (30m, 1h, 3d, etc.)
  const calculateEndTime = (startTime, duration) => {
    const start = new Date(startTime);
    
    // Parse duration string (e.g., "30m", "1h", "7d")
    const unit = duration.slice(-1); // Last character (m, h, d)
    const value = parseInt(duration.slice(0, -1)); // Number part
    
    let endTime = new Date(start);
    
    if (unit === 'm') {
      // Minutes
      endTime.setMinutes(start.getMinutes() + value);
    } else if (unit === 'h') {
      // Hours
      endTime.setHours(start.getHours() + value);
    } else if (unit === 'd') {
      // Days
      endTime.setDate(start.getDate() + value);
    }
    
    return endTime;
  };

  // ✅ NEW: Format duration for display
  const formatDuration = (duration) => {
    const unit = duration.slice(-1);
    const value = duration.slice(0, -1);
    
    if (unit === 'm') {
      return `${value} Minutes`;
    } else if (unit === 'h') {
      return `${value} Hours`;
    } else if (unit === 'd') {
      return `${value} Days`;
    }
    return duration;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Updated: Use new calculateEndTime function
      const startTime = new Date(formData.start_time);
      const endTime = calculateEndTime(formData.start_time, formData.auction_duration);
      
      const auctionData = {
        item_name: formData.item_name,
        description: formData.description,
        condition: formData.condition,
        category: formData.category,
        start_time: formData.start_time,
        end_time: endTime.toISOString(),
        auction_duration: formatDuration(formData.auction_duration), // ✅ Send formatted duration
        starting_price: parseFloat(formData.starting_price),
        reserve_price: formData.reserve_price ? parseFloat(formData.reserve_price) : null,
        bid_increment: parseFloat(formData.bid_increment),
        buy_it_now: formData.buy_it_now,
      };

      const response = await axiosInstance.post('/auctions/', auctionData);
      console.log('Auction created:', response.data);
      
      // Upload images
      if (images.length > 0) {
        try {
          const imageFormData = new FormData();
          
          images.forEach((img) => {
            imageFormData.append('images', img.file);
          });
          
          const imageResponse = await axiosInstance.post(
            `/auctions/${response.data.id}/images/`, 
            imageFormData, 
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            }
          );
          
          console.log('Images uploaded:', imageResponse.data);
          alert('Listing and all images uploaded successfully!');
        } catch (imageError) {
          console.error('Error uploading images:', imageError);
          console.error('Error response:', imageError.response?.data);
          alert(`Auction created but images failed to upload: ${imageError.response?.data?.detail || 'Unknown error'}`);
        }
      } else {
        alert('Listing created successfully (no images)!');
      }
      
      localStorage.removeItem('auction_draft');
      navigate('/seller-dashboard');
      
    } catch (error) {
      console.error('Create auction error:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object' && !backendErrors.detail) {
          setErrors(backendErrors);
          alert('Please fix the form errors');
        } else {
          alert(backendErrors.detail || 'Failed to create auction');
        }
      } else {
        alert('Failed to create auction. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      ...formData,
      images: images.map(img => ({ name: img.name, preview: img.preview }))
    };
    localStorage.setItem('auction_draft', JSON.stringify(draftData));
    alert('Draft saved successfully!');
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem('auction_draft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        const { images: draftImages, ...restData } = draftData;
        setFormData(prev => ({ ...prev, ...restData }));
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleInputChange}
                placeholder="Vintage Leather Briefcase"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.item_name && (
                <p className="text-red-500 text-sm mt-1">{errors.item_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item in detail..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {conditionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="text-red-500 text-sm mt-1">{errors.condition}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Media Upload</h2>
          <p className="text-gray-600 text-sm mb-6">
            Upload high-quality images of your item. Maximum 10 images, 5MB each.
          </p>

          <div className="mb-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
            >
              <div className="text-4xl mb-4">📷</div>
              <p className="text-lg font-medium text-gray-900 mb-2">Add Photos</p>
              <p className="text-sm text-gray-600">
                Click to upload images (max 10 files, 5MB each)
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auction Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Auction Details</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.start_time && (
                <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auction Duration <span className="text-red-500">*</span>
              </label>
              <select
                name="auction_duration"
                value={formData.auction_duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {durationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose how long your auction will run
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="starting_price"
                  step="0.01"
                  min="0.01"
                  value={formData.starting_price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.starting_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.starting_price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reserve Price (Optional)
                </label>
                <input
                  type="number"
                  name="reserve_price"
                  step="0.01"
                  min="0.01"
                  value={formData.reserve_price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.reserve_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.reserve_price}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Minimum price you'll accept</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bid Increment <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="bid_increment"
                  step="0.01"
                  min="0.01"
                  value={formData.bid_increment}
                  onChange={handleInputChange}
                  placeholder="1.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.bid_increment && (
                  <p className="text-red-500 text-sm mt-1">{errors.bid_increment}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="buy_it_now"
                checked={formData.buy_it_now}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Offer "Buy It Now" Option
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => navigate('/seller-dashboard')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;