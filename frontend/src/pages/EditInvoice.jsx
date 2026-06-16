// EditInvoice.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    invoiceAPI.getOne(id).then(res => {
      const inv = res.data.data;
      setInvoice(inv);
      setItems(inv.items.map(it => ({ description: it.description, quantity: it.quantity, rate: it.rate })));
      setForm({ dueDate: inv.dueDate.split('T')[0], taxRate: inv.taxRate, notes: inv.notes || '', terms: inv.terms || '', currency: inv.currency });
    }).catch(() => navigate('/invoices'));
  }, [id, navigate]);

  const setItem = (idx, k, v) => setItems(items => items.map((it, i) => i === idx ? { ...it, [k]: v } : it));
  const sym = (form.currency || '₹ INR').split(' ')[0];
  const subtotal = items.reduce((s, it) => s + (parseFloat(it.quantity)||0)*(parseFloat(it.rate)||0), 0);
  const tax = subtotal * (parseFloat(form.taxRate)||0) / 100;

  const handleSave = async () => {
    setLoading(true);
    try {
      await invoiceAPI.update(id, { ...form, items: items.filter(it => it.description), clientSnapshot: invoice.clientSnapshot });
      toast.success('Invoice updated!');
      navigate(`/invoices/${id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  if (!invoice) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <h1 className="text-xl font-semibold text-gray-900">Edit {invoice.invoiceNumber}</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Due Date</label>
            <input type="date" value={form.dueDate||''} onChange={e => setForm(f => ({...f, dueDate: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Tax Rate (%)</label>
            <input type="number" value={form.taxRate||''} onChange={e => setForm(f => ({...f, taxRate: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Currency</label>
            <select value={form.currency||''} onChange={e => setForm(f => ({...f, currency: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>₹ INR</option><option>$ USD</option><option>€ EUR</option><option>£ GBP</option>
            </select></div>
        </div>
        <div>
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium px-1 mb-2">
            <span className="col-span-6">Description</span><span className="col-span-2 text-center">Qty</span><span className="col-span-3 text-right">Rate</span><span className="col-span-1"></span>
          </div>
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
              <input className="col-span-6 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={it.description} onChange={e => setItem(idx,'description',e.target.value)} />
              <input className="col-span-2 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" value={it.quantity} onChange={e => setItem(idx,'quantity',e.target.value)} />
              <input className="col-span-3 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" value={it.rate} onChange={e => setItem(idx,'rate',e.target.value)} />
              {items.length > 1 && <button onClick={() => setItems(i => i.filter((_,j) => j!==idx))} className="col-span-1 text-red-400 hover:text-red-600 text-xs">✕</button>}
            </div>
          ))}
          <button onClick={() => setItems(i => [...i, {description:'',quantity:1,rate:0}])} className="text-sm text-blue-600 mt-1">+ Add Item</button>
        </div>
        <div className="flex justify-end text-sm">
          <div className="w-56 space-y-1">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{sym}{subtotal.toLocaleString('en-IN',{minimumFractionDigits:2})}</span></div>
            <div className="flex justify-between text-gray-500"><span>Tax ({form.taxRate}%)</span><span>{sym}{tax.toLocaleString('en-IN',{minimumFractionDigits:2})}</span></div>
            <div className="flex justify-between font-bold text-blue-700 border-t pt-1"><span>Total</span><span>{sym}{(subtotal+tax).toLocaleString('en-IN',{minimumFractionDigits:2})}</span></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Notes</label><textarea value={form.notes||''} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Terms</label><textarea value={form.terms||''} onChange={e => setForm(f=>({...f,terms:e.target.value}))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate(-1)} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60">{loading ? 'Saving...' : '💾 Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}
