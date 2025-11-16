// src/pages/Buyer/PaymentSuccess.jsx
/**
 * Payment Success page - Shows transaction details after successful payment
 * Displays order ID, payment details, and downloadable receipt
 */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'

const PaymentSuccess = () => {
  const { paymentId } = useParams()
  const navigate = useNavigate()

  const [payment, setPayment] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPaymentDetails()
  }, [paymentId])

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch payment details
      const paymentRes = await axiosInstance.get(`/payments/${paymentId}/status/`)
      setPayment(paymentRes.data)
      console.log('✅ Payment details:', paymentRes.data)
    } catch (err) {
      console.error('❌ Error fetching payment:', err)
      setError(err.response?.data?.error || 'Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = () => {
    if (!payment) return

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .receipt { max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; }
          .details { background: #f5f5f5; padding: 20px; border-radius: 5px; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; }
          .value { color: #666; }
          .success { color: green; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>✅ Payment Receipt</h1>
            <p class="success">Transaction Successful</p>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Payment ID:</span>
              <span class="value">${payment.payment_id}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span class="value">$${payment.amount} ${payment.currency}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value success">${payment.status.toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${new Date(payment.created_at).toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Paid At:</span>
              <span class="value">${payment.paid_at ? new Date(payment.paid_at).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Please keep this receipt for your records.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([receiptHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt-${payment.payment_id}.html`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading payment details...</p>
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
            Go to Transactions
          </button>
        </div>
      </div>
    )
  }

  if (!payment) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4">
      {/* Success Banner */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-8 rounded-2xl shadow-lg text-center">
          <p className="text-6xl mb-4">✅</p>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-lg">Your transaction has been completed</p>
        </div>
      </div>

      {/* Receipt Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Transaction Receipt</h2>
          <p className="text-green-100">Invoice #${payment.payment_id}</p>
        </div>

        {/* Details */}
        <div className="p-8">
          {/* Payment Status */}
          <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-600 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <p className="text-2xl font-bold text-green-600">
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </p>
              </div>
              <span className="text-4xl">✓</span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                <p className="text-lg font-semibold text-gray-900">{payment.payment_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${payment.amount} <span className="text-sm text-gray-600">{payment.currency}</span>
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(payment.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(payment.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {payment.description && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-gray-900">{payment.description}</p>
            </div>
          )}

          {payment.paid_at && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Paid At</p>
              <p className="text-gray-900 font-semibold">
                {new Date(payment.paid_at).toLocaleString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-8 border-t">
            <button
              onClick={downloadReceipt}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition flex items-center justify-center gap-2"
            >
              <span>📥</span>
              Download Receipt
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold transition"
            >
              View All Transactions
            </button>
            <button
              onClick={() => navigate('/buyer-dashboard')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 text-center text-sm text-gray-600">
          <p>Thank you for your purchase!</p>
          <p>Keep this receipt for your records.</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess