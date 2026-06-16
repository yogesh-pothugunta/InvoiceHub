import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI, clientAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const today = new Date().toISOString().split('T')[0];
const future30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

export default function CreateInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');

  const [form, setForm] = useState({
    issueDate: today,
    dueDate: future30,
    taxRate: user?.defaultTax || 18,
    currency: user?.currency || '₹ INR',
    status: 'draft',
    notes: '',
    terms: 'Payment due within 30 days. Late payments incur 2% monthly interest.',
  });

  const [clientSnap, setClientSnap] = useState({ name: '', email: '', phone: '', company: '', gst: '', address: '' });
  const [items, setItems] = useState([{ description: '', quantity: 1, rate: 0 }]);

  useEffect(() => {
    clientAPI.getAll({ limit: 100 }).then(res => setClients(res.data.data)).catch(() => {});
  }, []);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setCS = (k, v) => setClientSnap(s => ({ ...s, [k]: v }));

  const handleClientSelect = (id) => {
    setSelectedClient(id);
    const c = clients.find(c => c._id === id);
    if (c) {
      setClientSnap({
        name: c.name, email: c.email, phone: c.phone || '',
        company: c.company || '', gst: c.gst || '',
        address: [c.address?.street, c.address?.city, c.address?.state, c.address?.pincode].filter(Boolean).join(', ')
      });
    }
  };

  const setItem = (idx, k, v) => {
    setItems(items => items.map((it, i) => i === idx ? { ...it, [k]: v } : it));
  };
  const addItem = () => setItems(i => [...i, { description: '', quantity: 1, rate: 0 }]);
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));

  const subtotal = items.reduce((s, it) => s + (parseFloat(it.quantity) || 0) * (parseFloat(it.rate) || 0), 0);
  const taxAmount = subtotal * (parseFloat(form.taxRate) || 0) / 100;
  const total = subtotal + taxAmount;
  const sym = form.currency.split(' ')[0];

  const handleSubmit = async (status) => {
    if (!clientSnap.name || !clientSnap.email) return toast.error('Client name and email required');
    if (items.every(it => !it.description)) return toast.error('Add at least one item');
    setLoading(true);
    try {
      await invoiceAPI.create({
        clientId: selectedClient || undefined,
        clientSnapshot: clientSnap,
        items: items.filter(it => it.description),
        dueDate: form.dueDate,
        issueDate: form.issueDate,
        taxRate: parseFloat(form.taxRate),
        currency: form.currency,
        notes: form.notes,
        terms: form.terms,
        status,
      });
      toast.success(status === 'draft' ? 'Saved as draft!' : 'Invoice created!');
      navigate('/invoices');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <h1 className="text-xl font-semibold text-gray-900">New Invoice</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Client */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Client Details</h2>
            {clients.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Select Existing Client</label>
                <select value={selectedClient} onChange={e => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Or enter manually below --</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[['name','Client Name *','text'],['email','Email *','email'],['phone','Phone','text'],['company','Company','text'],['gst','GST Number','text'],['address','Address','text']].map(([k,l,t]) => (
                <div key={k} className={k === 'address' || k === 'name' ? 'col-span-2' : ''}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <input type={t} value={clientSnap[k]} onChange={e => setCS(k, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-500 mb-1">Issue Date</label>
                <input type="date" value={form.issueDate} onChange={e => setF('issueDate', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Tax Rate (%)</label>
                <input type="number" value={form.taxRate} onChange={e => setF('taxRate', e.target.value)} min="0" max="100" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Currency</label>
                <select value={form.currency} onChange={e => setF('currency', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>₹ INR</option><option>$ USD</option><option>€ EUR</option><option>£ GBP</option>
                </select></div>
              <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Any notes for the client..." /></div>
              <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Terms</label>
                <textarea value={form.terms} onChange={e => setF('terms', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
            </div>
          </div>
        </div>

        {/* RIGHT - Items */}
        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Line Items</h2>
            <div className="space-y-2 mb-3">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium px-1">
                <span className="col-span-5">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Rate ({sym})</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input className="col-span-5 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Item / Service" value={item.description} onChange={e => setItem(idx, 'description', e.target.value)} />
                  <input className="col-span-2 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" min="0" value={item.quantity} onChange={e => setItem(idx, 'quantity', e.target.value)} />
                  <input className="col-span-3 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" min="0" value={item.rate} onChange={e => setItem(idx, 'rate', e.target.value)} />
                  <div className="col-span-1 text-right text-sm font-medium text-gray-700">{sym}{((parseFloat(item.quantity)||0)*(parseFloat(item.rate)||0)).toLocaleString('en-IN')}</div>
                  {items.length > 1 && <button onClick={() => removeItem(idx)} className="col-span-1 text-red-400 hover:text-red-600 text-xs">✕</button>}
                </div>
              ))}
            </div>
            <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-5">+ Add Item</button>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{sym}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Tax ({form.taxRate}%)</span><span>{sym}{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-base font-bold text-blue-700 border-t border-gray-200 pt-2 mt-2"><span>Total</span><span>{sym}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button onClick={() => handleSubmit('draft')} disabled={loading} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
                💾 Save Draft
              </button>
              <button onClick={() => handleSubmit('sent')} disabled={loading} className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
                {loading ? 'Saving...' : '📤 Create & Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
