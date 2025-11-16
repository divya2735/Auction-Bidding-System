import React, { useState, useEffect } from 'react';
import { Users, Settings, Mail, Tag, CreditCard, Bell, Database, Trash2 } from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('admin-users');
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState({
    site_name: '',
    site_url: '',
    timezone: '',
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
    maintenance_mode: false
  });

  useEffect(() => {
    if (activeTab === 'admin-users') {
      fetchAdminUsers();
    }
  }, [activeTab]);

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin-users/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch admin users');

      const data = await response.json();
      setAdminUsers(data.results || []);
    } catch (err) {
      console.error('Fetch admin users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (userId) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return;

    try {
      const response = await fetch(`/api/admin-users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete admin');

      fetchAdminUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      'Super Admin': 'bg-red-100 text-red-800',
      'Editor': 'bg-blue-100 text-blue-800',
      'Moderator': 'bg-purple-100 text-purple-800',
      'Viewer': 'bg-gray-100 text-gray-800'
    };
    return badges[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const TabButton = ({ icon: Icon, label, value }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${
        activeTab === value
          ? 'bg-gray-700 text-white'
          : 'text-gray-300 hover:bg-gray-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-8 py-4">
        <h1 className="text-2xl font-bold text-white">Application Settings</h1>
      </header>

      <div className="flex">
        <aside className="w-64 bg-black border-r border-gray-800 min-h-screen p-6">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              General Settings
            </h2>
            <div className="space-y-1">
              <TabButton icon={Users} label="Admin Users" value="admin-users" />
              <TabButton icon={Settings} label="System Settings" value="system-settings" />
              <TabButton icon={Mail} label="Email Configuration" value="email-config" />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Business Settings
            </h2>
            <div className="space-y-1">
              <TabButton icon={Tag} label="Auction Parameters" value="auction-params" />
              <TabButton icon={CreditCard} label="Payment Settings" value="payment-settings" />
              <TabButton icon={Bell} label="Notification Settings" value="notification-settings" />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Advanced
            </h2>
            <div className="space-y-1">
              <TabButton icon={Database} label="Cache Management" value="cache-management" />
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {activeTab === 'admin-users' && (
            <div className="bg-gray-800 rounded-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Admin Users Management</h2>
                <p className="text-gray-400">
                  Manage user accounts with administrative access to the platform. Define roles and permissions for each user.
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-black border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    <tr className="hover:bg-gray-850">
                      <td className="px-6 py-4 text-sm text-white">John Doe</td>
                      <td className="px-6 py-4 text-sm text-gray-300">john.doe@example.com</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Super Admin
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                            Edit
                          </button>
                          <button className="text-sm text-red-400 hover:text-red-300 font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-850">
                      <td className="px-6 py-4 text-sm text-white">Jane Smith</td>
                      <td className="px-6 py-4 text-sm text-gray-300">jane.smith@example.com</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Editor
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                            Edit
                          </button>
                          <button className="text-sm text-red-400 hover:text-red-300 font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-850">
                      <td className="px-6 py-4 text-sm text-white">Peter Jones</td>
                      <td className="px-6 py-4 text-sm text-gray-300">peter.jones@example.com</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Moderator
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                            Edit
                          </button>
                          <button className="text-sm text-red-400 hover:text-red-300 font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-850">
                      <td className="px-6 py-4 text-sm text-white">Alice Brown</td>
                      <td className="px-6 py-4 text-sm text-gray-300">alice.brown@example.com</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Viewer
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                            Edit
                          </button>
                          <button className="text-sm text-red-400 hover:text-red-300 font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-850">
                      <td className="px-6 py-4 text-sm text-white">Bob White</td>
                      <td className="px-6 py-4 text-sm text-gray-300">bob.white@example.com</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Editor
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                            Edit
                          </button>
                          <button className="text-sm text-red-400 hover:text-red-300 font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="px-6 py-4 border-t border-gray-800">
                  <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                    Add New Admin
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system-settings' && (
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={systemSettings.site_name}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, site_name: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Auction Platform"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site URL</label>
                  <input
                    type="url"
                    value={systemSettings.site_url}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, site_url: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                    <select
                      value={systemSettings.timezone}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Timezone</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                    <select
                      value={systemSettings.currency}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenance_mode}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-300">Enable Maintenance Mode</span>
                  </label>
                </div>

                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cache-management' && (
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Cache Management</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Cache Statistics</h3>
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hit Rate:</span>
                        <span className="text-white font-medium">87.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Miss Rate:</span>
                        <span className="text-white font-medium">12.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Requests:</span>
                        <span className="text-white font-medium">15,234</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Actions</h3>
                    <div className="space-y-3 mt-4">
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Clear All Cache
                      </button>
                      <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Clear User Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;