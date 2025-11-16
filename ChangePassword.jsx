import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name] || errors.general) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.oldPassword) newErrors.oldPassword = "Current password is required";
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    setSuccessMessage("");

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/users/change-password/", {
        old_password: formData.oldPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      });

      setSuccessMessage(res.data.message || "Password changed successfully.");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});

      setTimeout(() => {
        alert("You will be logged out of all active sessions.");
        localStorage.removeItem("tokens");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      if (error.response) {
        const data = error.response.data;
        const backendErrors = {};
        if (data.old_password) backendErrors.oldPassword = data.old_password[0];
        if (data.new_password) backendErrors.newPassword = data.new_password[0];
        if (data.confirm_password) backendErrors.confirmPassword = data.confirm_password[0];
        if (data.non_field_errors) backendErrors.general = data.non_field_errors[0];
        setErrors(backendErrors);
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-gradient-to-br from-[#e8ecc4] to-[#d4daa8] rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-black px-6 py-2 rounded">
            <h1 className="text-white text-3xl font-bold">LuxeBid</h1>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">Change Password</h2>

        {/* Instructions */}
        <p className="text-gray-600 text-center mb-2 text-sm">
          Make sure your new password is 8 characters or more. Include numbers, letters, and punctuation for a strong password.
        </p>
        <p className="text-gray-600 text-center mb-6 text-sm">
          You'll be logged out of all active sessions after your password is changed.
        </p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        {/* Current Password */}
        <PasswordInput
          label="Current Password"
          name="oldPassword"
          value={formData.oldPassword}
          show={showPasswords.old}
          toggle={() => togglePasswordVisibility("old")}
          onChange={handleChange}
          error={errors.oldPassword}
        />

        {/* New Password */}
        <PasswordInput
          label="New Password"
          name="newPassword"
          value={formData.newPassword}
          show={showPasswords.new}
          toggle={() => togglePasswordVisibility("new")}
          onChange={handleChange}
          error={errors.newPassword}
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          show={showPasswords.confirm}
          toggle={() => togglePasswordVisibility("confirm")}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        {/* Buttons */}
        <div className="flex gap-4 mt-8 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Changing..." : "Change Password"}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-xs flex items-center justify-center gap-1">
          Made with
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#5B4FFF" />
            <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">V</text>
          </svg>
          Visily
        </div>
      </div>
    </div>
  );
};

const PasswordInput = ({ label, name, value, show, toggle, onChange, error }) => (
  <div className="mb-5">
    <label className="block text-gray-800 font-semibold mb-2">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-white border ${error ? "border-red-400" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 ${error ? "focus:ring-red-400" : "focus:ring-gray-400"}`}
        placeholder="**********"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);

export default ChangePasswordForm;
