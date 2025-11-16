// src/pages/Buyer/TransactionsList.jsx
/**
 * Transactions List page - Shows all user transactions in a table/list
 * User can click "View" to see detailed transaction page
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'

const TransactionsList = () => {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, succeeded, failed, pending
  const [sortBy, setSortBy] = useState('date-desc') // date-desc, date-asc, amount-high, amount-low

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get('/payments/')
      console.log('✅ Transactions:', response.data)
      setTransactions(response.data.results || response.data)
    } catch (err) {
      console.error('❌ Error fetching transactions:', err)
      setError(err.response?.data?.error || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true
    return t.status === filter
  })

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'date-asc':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'amount-high':
        return parseFloat(b.amount) - parseFloat(a.amount)
      case 'amount-low':
        return parseFloat(a.amount) - parseFloat(b.amount)
      default:
        return 0
    }
  })

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      succeeded: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      refunded: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      succeeded: '✅',
      failed: '❌',
      pending: '⏳',
      processing: '🔄',
      refunded: '💰',
      cancelled: '⛔',
    }
    return icons[status] || '•'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 My Transactions</h1>
            <p className="text-gray-600">View and manage all your payments</p>
          </div>
          <button
            onClick={() => navigate('/buyer-dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="max-w-6xl mx-auto mb-8 bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['all', 'succeeded', 'failed', 'pending', 'processing', 'refunded'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="max-w-6xl mx-auto">
        {sortedTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-xl text-gray-600 mb-6">No transactions found</p>
            <button
              onClick={() => navigate('/auctions')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Browse Auctions
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Payment ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{transaction.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${transaction.amount} {transaction.currency}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {getStatusIcon(transaction.status)}{' '}
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            navigate(`/transaction/${transaction.id}`)
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {sortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment ID</p>
                      <p className="text-lg font-bold text-gray-900">
                        #{transaction.id}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {getStatusIcon(transaction.status)}{' '}
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${transaction.amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/transaction/${transaction.id}`)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {sortedTransactions.length > 0 && (
        <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">
              {sortedTransactions.length}
            </p>
            <p className="text-gray-600">Total Transactions</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">
              $
              {sortedTransactions
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
                .toFixed(2)}
            </p>
            <p className="text-gray-600">Total Amount</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">
              {sortedTransactions.filter((t) => t.status === 'succeeded').length}
            </p>
            <p className="text-gray-600">Successful Payments</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsList