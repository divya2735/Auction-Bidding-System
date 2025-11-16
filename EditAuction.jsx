import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const EditAuction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tokens } = useAuth();
  const fileInputRef = useRef();
  
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    condition: '',
    category: '',
    start_time: '',
    auction_duration: '7',
    starting_price: '',
    reserve_price: '',
    bid_increment: '1.00',
    buy_it_now: false,
  });
  
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

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
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Recreation' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'books', label: 'Books & Media' },
    { value: 'jewelry', label: 'Jewelry & Watches' },
    { value: 'art', label: 'Art & Crafts' },
    { value: 'other', label: 'Other' },
  ];

  const durationOptions = [
    { value: '1', label: '1 Day' },
    { value: '3', label: '3 Days' },
    { value: '5', label: '5 Days' },
    { value: '7', label: '7 Days' },
    { value: '10', label: '10 Days' },
    { value: '14', label: '14 Days' },
  ];

  useEffect(() => {
    fetchAuction();
  }, [id]);

  const fetchAuction = async () => {
    try {
      setFetchLoading(true);
      const response = await axiosInstance.get(`/auctions/${id}/`);
      const auction = response.data;
      
      // Extract duration number from "7 Days" format
      const durationMatch = auction.auction_duration?.match(/\d+/);
      const duration = durationMatch ? durationMatch[0] : '7';
      
      // Format datetime for input (YYYY-MM-DDTHH:MM)
      const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        // Get local time in YYYY-MM-DDTHH:MM format
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      setFormData({
        item_name: auction.item_name || '',
        description: auction.description || '',
        condition: auction.condition || '',
        category: auction.category || '',
        start_time: formatDateTime(auction.start_time),
        auction_duration: duration,
        starting_price: auction.starting_price || '',
        reserve_price: auction.reserve_price || '',
        bid_increment: auction.bid_increment || '1.00',
        buy_it_now: auction.buy_it_now || false,
      });
      
      // Process existing images
      const processedImages = auction.images?.map(img => ({
        ...img,
        image: img.image && !img.image.startsWith("http") 
          ? `${API_BASE_URL}${img.image}` 
          : img.image
      })) || [];
      
      setExistingImages(processedImages);
    } catch (error) {
      console.error('Error fetching auction:', error);
      alert('Failed to load auction details');
      navigate('/seller-dashboard');
    } finally {
      setFetchLoading(false);
    }
  };

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
    const totalImages = existingImages.length + newImages.length + files.length;
    
    if (totalImages > maxFiles) {
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
        setNewImages(prev => [...prev, {
          file,
          preview: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/auctions/${id}/images/?image_id=${imageId}`);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
      alert('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      
      // Convert start_time from local datetime-local input to ISO string
      const startTime = new Date(formData.start_time);
      const durationDays = parseInt(formData.auction_duration);
      const endTime = new Date(startTime.getTime() + (durationDays * 24 * 60 * 60 * 1000));
      
      // Prepare auction data
      const auctionData = {
        item_name: formData.item_name.trim(),
        description: formData.description.trim(),
        condition: formData.condition,
        category: formData.category,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        auction_duration: `${formData.auction_duration} Days`,
        starting_price: parseFloat(formData.starting_price).toFixed(2),
        bid_increment: parseFloat(formData.bid_increment).toFixed(2),
        buy_it_now: formData.buy_it_now,
      };

      // Only include reserve_price if it has a value
      if (formData.reserve_price && formData.reserve_price !== '') {
        auctionData.reserve_price = parseFloat(formData.reserve_price).toFixed(2);
      }

      console.log('Sending auction data:', auctionData);

      const response = await axiosInstance.put(`/auctions/${id}/`, auctionData);
      console.log('Update response:', response.data);
      
      // Upload new images if any
      if (newImages.length > 0) {
        try {
          const imageFormData = new FormData();
          newImages.forEach((img) => {
            imageFormData.append('images', img.file);
          });
          
          const imageResponse = await axiosInstance.post(
            `/auctions/${id}/images/`, 
            imageFormData, 
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            }
          );
          console.log('Images uploaded successfully:', imageResponse.data);
        } catch (imageError) {
          console.error('Error uploading new images:', imageError);
          console.error('Image error response:', imageError.response?.data);
          alert('Auction updated but some new images failed to upload');
        }
      }
      
      alert('Auction updated successfully!');
      navigate('/seller-dashboard');
      
    } catch (error) {
      console.error('Update auction error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        
        if (typeof backendErrors === 'string') {
          alert(`Failed to update: ${backendErrors}`);
        } else if (backendErrors.detail) {
          alert(`Failed to update: ${backendErrors.detail}`);
        } else if (typeof backendErrors === 'object') {
          const errorMessages = Object.entries(backendErrors)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${msg}`;
            })
            .join('\n');
          alert(`Failed to update:\n${errorMessages}`);
          setErrors(backendErrors);
        } else {
          alert('Failed to update auction');
        }
      } else {
        alert('Failed to update auction. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading auction details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => navigate('/seller-dashboard')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Auction</h1>
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

        {/* Media Upload - Same as before */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Manage Images</h2>
          <p className="text-gray-600 text-sm mb-6">
            Upload new images or remove existing ones. Maximum 10 images total, 5MB each.
          </p>

          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image}
                      alt="Auction"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Images</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
            >
              <div className="text-4xl mb-4">📷</div>
              <p className="text-lg font-medium text-gray-900 mb-2">Add Photos</p>
              <p className="text-sm text-gray-600">Click to upload new images</p>
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

          {newImages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">New Images to Upload</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {newImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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
            {loading ? 'Updating...' : 'Update Auction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAuction;