import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getBuyerProfile, updateBuyerProfileWithImage } from "../../utils/api";

const BuyerProfile = () => {
  const { tokens } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Helper to get full image URL
  const getFullImageUrl = (imgPath) => {
    if (!imgPath) return null;
    return imgPath.startsWith("http")
      ? imgPath
      : `${process.env.REACT_APP_API_BASE_URL}${imgPath}`;
  };

  // Fetch profile
  const fetchProfile = async () => {
    if (!tokens?.access) return;
    try {
      const data = await getBuyerProfile(tokens.access);
      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        contact_number: data.contact_number || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      });
      setPreview(getFullImageUrl(data.profile_image));
    } catch (err) {
      console.error("Failed to load buyer profile:", err);
      alert("Failed to load profile.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [tokens]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Save profile
  const handleSave = async () => {
    if (!tokens?.access) return;
    setLoading(true);
    try {
      const dataToSend = { ...profile };
      if (file) dataToSend.profile_image = file;

      await updateBuyerProfileWithImage(tokens.access, dataToSend);
      alert("Profile updated successfully!");

      // Refetch to get updated image URL
      await fetchProfile();
      setIsEditing(false);
      setFile(null);
    } catch (err) {
      console.error("Failed to update buyer profile:", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Buyer Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-500"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-500"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 rounded-lg bg-white shadow-xl p-8 space-x-8">
        {/* Left Column */}
        <div className="flex-1 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={profile.full_name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              readOnly={!isEditing}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="youremail@gmail.com"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              readOnly={!isEditing}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleChange}
              placeholder="9876543210"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              readOnly={!isEditing}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Address</label>
            <textarea
              name="address"
              rows={4}
              value={profile.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              readOnly={!isEditing}
            />
          </div>

          {/* State & City */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-1">State</label>
              <select
                name="state"
                value={profile.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!isEditing}
              >
                <option value="">Select State</option>
                <option value="State1">State1</option>
                <option value="State2">State2</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-1">City</label>
              <select
                name="city"
                value={profile.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!isEditing}
              >
                <option value="">Select City</option>
                <option value="City1">City1</option>
                <option value="City2">City2</option>
              </select>
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={profile.pincode}
              onChange={handleChange}
              placeholder="123456"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              readOnly={!isEditing}
            />
          </div>
        </div>

        {/* Right Column (Profile Image) */}
        <div className="flex flex-col items-center w-1/3 p-4">
          <div className="w-64 h-64 bg-gray-200 rounded-md flex items-center justify-center mb-4 overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="object-cover w-full h-full" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          {isEditing && (
            <label className="flex items-center space-x-2 px-4 py-2 border border-gray-400 rounded-md text-gray-700 cursor-pointer hover:bg-gray-200">
              <span>Choose Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;
