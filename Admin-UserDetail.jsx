import React, { useState, useEffect } from 'react';
import { Save, Trash2, Phone, MapPin, Calendar, Activity } from 'lucide-react';

const UserDetail = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal-info');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const [userRes, profileRes] = await Promise.all([
        fetch(`/api/users/${userId}/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/${user?.role}-profiles/${userId}/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => null)
      ]);

      if (!userRes.ok) throw new Error('Failed to fetch user');

      const userData = await userRes.json();
      setUser(userData);
      setFormData(userData);

      if (profileRes && profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fetch user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update user');

      alert('User updated successfully!');
      fetchUserDetails();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/users/${userId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to delete user');

      alert('User deleted successfully!');
      window.location.href = '/admin/users';
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
          <button onClick={fetchUserDetails} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details: {user.first_name} {user.last_name}</h1>
            <p className="text-sm text-gray-600 mt-1">Manage user information and permissions</p>
          </div>
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold mb-4">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.first_name} {user.last_name}</h2>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                
                <div className="mt-4 space-y-2 w-full">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold text-center ${
                    user.role === 'buyer' ? 'bg-blue-100 text-blue-800' : 
                    user.role === 'seller' ? 'bg-purple-100 text-purple-800' : 
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {user.role}
                  </div>
                  
                  {user.is_verified && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold text-center">
                      Verified
                    </div>
                  )}
                  
                  {user.is_active && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold text-center">
                      Active
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-4">Ticket ID: {user.ticket_id || 'N/A'}</p>

                <button
                  onClick={handleDeleteUser}
                  className="mt-6 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('personal-info')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'personal-info'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Personal Info
                  </button>
                  <button
                    onClick={() => setActiveTab('permissions')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'permissions'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Permissions
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'profile'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {user.role === 'buyer' ? 'Buyer' : 'Seller'} Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'activity'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Activity
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'personal-info' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={user.is_verified}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ticket ID</label>
                        <input
                          type="text"
                          value={formData.ticket_id || ''}
                          onChange={(e) => handleInputChange('ticket_id', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={formData.first_name || ''}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={formData.last_name || ''}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                          value={formData.role || ''}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'permissions' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.is_active || false}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Is Active</span>
                          <p className="text-xs text-gray-500">User can log in and access the platform</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.is_verified || false}
                          onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Is Verified</span>
                          <p className="text-xs text-gray-500">Email verification status</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.is_staff || false}
                          onChange={(e) => handleInputChange('is_staff', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Is Staff</span>
                          <p className="text-xs text-gray-500">Can access admin panel</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.is_superuser || false}
                          onChange={(e) => handleInputChange('is_superuser', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Is Superuser</span>
                          <p className="text-xs text-gray-500">Has all permissions without explicitly assigning them</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && profile && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profile.contact_number || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          City
                        </label>
                        <input
                          type="text"
                          value={profile.city || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={profile.state || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                        <input
                          type="text"
                          value={profile.pincode || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Completion</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${profile.profile_completion || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-green-600">{profile.profile_completion || 0}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      <Activity className="w-5 h-5 inline mr-2" />
                      Recent Activity
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">Account created</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(user.date_joined).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">Last login</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;