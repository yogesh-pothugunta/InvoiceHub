import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { paid: 'bg-green-100 text-green-700', sent: 'bg-blue-100 text-blue-700', draft: 'bg-gray-100 text-gray-600', overdue: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-400' };

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  useEffect(() => {
    invoiceAPI.getOne(id).then(res => setInvoice(res.data.data)).catch(() => { toast.error('Invoice not found'); navigate('/invoices'); }).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>;
  if (!invoice) return null;

  const sym = (invoice.currency || '₹ INR').split(' ')[0];
  const fmt = (n) => `${sym}${(n||0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleDownloadPDF = async () => {
    try {
      const res = await invoiceAPI.downloadPDF(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `${invoice.invoiceNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF generation failed'); }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      await invoiceAPI.sendEmail(id, { customMessage: customMsg });
      toast.success(`Email sent to ${invoice.clientSnapshot.email}!`);
      setShowEmailModal(false);
      const res = await invoiceAPI.getOne(id);
      setInvoice(res.data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Email failed'); }
    finally { setSending(false); }
  };

  const handleStatusChange = async (status) => {
    try {
      await invoiceAPI.updateStatus(id, { status });
      setInvoice(i => ({ ...i, status }));
      toast.success(`Status updated to ${status}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
          <h1 className="text-xl font-semibold text-gray-900">{invoice.invoiceNumber}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[invoice.status]}`}>{invoice.status}</span>
        </div>
        <div className="flex gap-2">
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <select value={invoice.status} onChange={e => handleStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Mark Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          <button onClick={() => navigate(`/invoices/${id}/edit`)} className="border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">✏️ Edit</button>
          <button onClick={handleDownloadPDF} className="border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">📄 PDF</button>
          <button onClick={() => setShowEmailModal(true)} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">📧 Send Email</button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-blue-700 text-white p-6 flex justify-between items-start">
          <div>
            <div className="text-lg font-semibold">INVOICE</div>
            <div className="text-blue-200 text-sm mt-1">#{invoice.invoiceNumber}</div>
          </div>
          <div className="text-right text-sm text-blue-100">
            <div>Issue: {fmtDate(invoice.issueDate)}</div>
            <div>Due: {fmtDate(invoice.dueDate)}</div>
            {invoice.paidAt && <div className="text-green-300">Paid: {fmtDate(invoice.paidAt)}</div>}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Billed To</p>
              <p className="font-semibold text-gray-800">{invoice.clientSnapshot.name}</p>
              {invoice.clientSnapshot.company && <p className="text-sm text-gray-500">{invoice.clientSnapshot.company}</p>}
              <p className="text-sm text-gray-500">{invoice.clientSnapshot.email}</p>
              {invoice.clientSnapshot.phone && <p className="text-sm text-gray-500">{invoice.clientSnapshot.phone}</p>}
              {invoice.clientSnapshot.address && <p className="text-sm text-gray-500">{invoice.clientSnapshot.address}</p>}
              {invoice.clientSnapshot.gst && <p className="text-sm text-gray-500">GST: {invoice.clientSnapshot.gst}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Amount Due</p>
              <p className="text-3xl font-bold text-blue-700">{fmt(invoice.total)}</p>
              {invoice.emailSentAt && <p className="text-xs text-gray-400 mt-1">Email sent: {fmtDate(invoice.emailSentAt)}</p>}
            </div>
          </div>

          {/* Items */}
          <table className="w-full text-sm mb-6">
            <thead><tr className="bg-gray-50 border-y border-gray-100">
              <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">#</th>
              <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Description</th>
              <th className="text-right py-2 px-3 text-xs text-gray-500 font-medium">Qty</th>
              <th className="text-right py-2 px-3 text-xs text-gray-500 font-medium">Rate</th>
              <th className="text-right py-2 px-3 text-xs text-gray-500 font-medium">Amount</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 px-3 text-gray-400">{i + 1}</td>
                  <td className="py-3 px-3 text-gray-700">{item.description}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{fmt(item.rate)}</td>
                  <td className="py-3 px-3 text-right font-medium text-gray-800">{fmt(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{fmt(invoice.subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax ({invoice.taxRate}%)</span><span>{fmt(invoice.taxAmount)}</span></div>
              {invoice.discount > 0 && <div className="flex justify-between text-gray-600"><span>Discount</span><span>-{fmt(invoice.discount)}</span></div>}
              <div className="flex justify-between font-bold text-blue-700 text-base border-t pt-2"><span>Total</span><span>{fmt(invoice.total)}</span></div>
            </div>
          </div>

          {(invoice.notes || invoice.terms) && (
            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
              {invoice.notes && <div><p className="font-medium text-gray-700 mb-1">Notes</p><p>{invoice.notes}</p></div>}
              {invoice.terms && <div><p className="font-medium text-gray-700 mb-1">Terms</p><p>{invoice.terms}</p></div>}
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Send Invoice Email</h2>
            <p className="text-sm text-gray-500 mb-4">To: {invoice.clientSnapshot.email}</p>
            <textarea value={customMsg} onChange={e => setCustomMsg(e.target.value)} rows={6}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              placeholder="Custom message (leave blank for default professional template)..." />
            <div className="flex gap-3">
              <button onClick={() => setShowEmailModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSendEmail} disabled={sending} className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60">
                {sending ? 'Sending...' : '📧 Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
