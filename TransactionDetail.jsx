// src/pages/Buyer/TransactionDetail.jsx
/**
 * Individual Transaction Detail page
 * Shows full details of a specific transaction
 */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'

const TransactionDetail = () => {
  const { transactionId } = useParams()
  const navigate = useNavigate()

  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTransactionDetail()
  }, [transactionId])

  const fetchTransactionDetail = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get(`/payments/${transactionId}/status/`)
      console.log('✅ Transaction detail:', response.data)
      setTransaction(response.data)
    } catch (err) {
      console.error('❌ Error fetching transaction:', err)
      setError(err.response?.data?.error || 'Failed to load transaction details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      succeeded: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      refunded: 'bg-purple-100 text-purple-800 border-purple-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
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

  const downloadReceipt = () => {
    if (!transaction) return

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Receipt</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .status-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-weight: bold; }
          .content { padding: 40px 20px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
          .detail { margin-bottom: 15px; }
          .detail-label { font-size: 12px; color: #666; margin-bottom: 5px; }
          .detail-value { font-size: 16px; font-weight: bold; color: #333; }
          .amount { font-size: 32px; font-weight: bold; color: #667eea; margin: 20px 0; }
          .divider { border-top: 1px solid #eee; margin: 30px 0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
          .success { color: #10b981; }
          .failed { color: #ef4444; }
          .pending { color: #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Transaction Receipt</h1>
            <div class="status-badge">${transaction.status.toUpperCase()}</div>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="detail-value amount">$${parseFloat(transaction.amount).toFixed(2)}</div>
              <p class="detail-label">${transaction.currency}</p>
            </div>

            <div class="divider"></div>

            <div class="grid">
              <div>
                <div class="section-title">Transaction ID</div>
                <div class="detail-value">${transaction.payment_id}</div>
              </div>
              <div>
                <div class="section-title">Status</div>
                <div class="detail-value ${transaction.status === 'succeeded' ? 'success' : transaction.status === 'failed' ? 'failed' : 'pending'}">
                  ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="grid">
              <div>
                <div class="section-title">Date</div>
                <div class="detail-value">${new Date(transaction.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <div class="section-title">Time</div>
                <div class="detail-value">${new Date(transaction.created_at).toLocaleTimeString()}</div>
              </div>
            </div>

            ${transaction.paid_at ? `
              <div class="divider"></div>
              <div>
                <div class="section-title">Paid At</div>
                <div class="detail-value">${new Date(transaction.paid_at).toLocaleString()}</div>
              </div>
            ` : ''}

            ${transaction.error ? `
              <div class="divider"></div>
              <div style="background: #fee; padding: 15px; border-radius: 5px; border-left: 4px solid #f00;">
                <div class="section-title" style="color: #c33;">Error</div>
                <div class="detail-value" style="color: #c33;">${transaction.error}</div>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>Thank you for your transaction!</p>
            <p style="margin-top: 10px;">Please keep this receipt for your records.</p>
            <p style="margin-top: 15px; font-size: 10px;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([receiptHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transaction-${transaction.payment_id}.html`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading transaction...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-red-600 text-lg mb-6">{error}</p>
          <button
            onClick={() => navigate('/transactions')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    )
  }

  if (!transaction) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <button
          onClick={() => navigate('/transactions')}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition mb-4"
        >
          ← Back to Transactions
        </button>
      </div>

      {/* Main Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with Status */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Transaction Details</h1>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg border-2 ${getStatusColor(transaction.status)}`}>
              {getStatusIcon(transaction.status)}
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </div>
          <p className="text-blue-100">Transaction ID: #{transaction.payment_id}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Amount Section */}
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Total Amount</p>
            <p className="text-5xl font-bold text-gray-900 mb-2">
              ${parseFloat(transaction.amount).toFixed(2)}
            </p>
            <p className="text-lg text-gray-600">{transaction.currency}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
            {/* Created At */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">📅 Created Date</p>
              <p className="text-lg text-gray-900">
                {new Date(transaction.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(transaction.created_at).toLocaleTimeString()}
              </p>
            </div>

            {/* Paid At */}
            {transaction.paid_at && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">✅ Paid Date</p>
                <p className="text-lg text-gray-900">
                  {new Date(transaction.paid_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(transaction.paid_at).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {transaction.description && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <p className="text-sm font-semibold text-gray-600 mb-2">Description</p>
              <p className="text-gray-900">{transaction.description}</p>
            </div>
          )}

          {/* Error Message */}
          {transaction.error && (
            <div className="mb-8 p-6 bg-red-50 rounded-lg border-l-4 border-red-600">
              <p className="text-sm font-semibold text-red-800 mb-2">❌ Error Details</p>
              <p className="text-red-700">{transaction.error}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">CURRENCY</p>
              <p className="text-lg font-bold text-gray-900">{transaction.currency}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">STATUS</p>
              <p className="text-lg font-bold text-gray-900">
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">ID</p>
              <p className="text-lg font-bold text-gray-900">#{transaction.payment_id}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-6 border-t">
            <button
              onClick={downloadReceipt}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition flex items-center justify-center gap-2"
            >
              <span>📥</span>
              Download Receipt (HTML)
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold transition"
            >
              Back to All Transactions
            </button>
            <button
              onClick={() => navigate('/buyer-dashboard')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetail