import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { paid: 'bg-green-100 text-green-700', sent: 'bg-blue-100 text-blue-700', draft: 'bg-gray-100 text-gray-600', overdue: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-400' };

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoiceAPI.getAll({ search, status, page, limit: 10 });
      setInvoices(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await invoiceAPI.delete(id);
      toast.success('Invoice deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  const handleDownloadPDF = async (id, num, e) => {
    e.stopPropagation();
    try {
      const res = await invoiceAPI.downloadPDF(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `${num}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF generation failed'); }
  };

  const handleExportCSV = async () => {
    try {
      const res = await invoiceAPI.exportCSV({ status });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click();
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total || 0} total invoices</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            📥 Export CSV
          </button>
          <button onClick={() => navigate('/invoices/new')} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
            + New Invoice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by client or invoice #..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Invoice #</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Client</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Issue Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <tr><td colSpan={7} className="py-10 text-center text-gray-400">Loading...</td></tr>}
            {!loading && invoices.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">No invoices found. <button onClick={() => navigate('/invoices/new')} className="text-blue-600 hover:underline">Create one!</button></td></tr>
            )}
            {invoices.map(inv => (
              <tr key={inv._id} onClick={() => navigate(`/invoices/${inv._id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-medium text-blue-700">{inv.invoiceNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{inv.clientSnapshot.name}</div>
                  <div className="text-xs text-gray-400">{inv.clientSnapshot.email}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800">₹{inv.total.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(inv.issueDate).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[inv.status]}`}>{inv.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => handleDownloadPDF(inv._id, inv.invoiceNumber, e)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Download PDF">📄</button>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv._id}/edit`); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Edit">✏️</button>
                    <button onClick={(e) => handleDelete(inv._id, e)} className="p-1.5 rounded hover:bg-red-50 text-red-400" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
