import { useState, useEffect, useCallback } from 'react';
import { clientAPI } from '../utils/api';
import toast from 'react-hot-toast';

const empty = { name: '', email: '', phone: '', company: '', gst: '', address: { street: '', city: '', state: '', pincode: '', country: 'India' }, notes: '' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await clientAPI.getAll({ search, limit: 50 }); setClients(res.data.data); }
    catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (c) => { setEditing(c._id); setForm({ ...c, address: c.address || empty.address }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      if (editing) { await clientAPI.update(editing, form); toast.success('Client updated'); }
      else { await clientAPI.create(form); toast.success('Client added'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try { await clientAPI.delete(id); toast.success('Client removed'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setAddr = (k, v) => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} clients</p>
        </div>
        <button onClick={openAdd} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">+ Add Client</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p className="text-gray-400 text-sm col-span-3">Loading...</p>}
        {!loading && clients.length === 0 && <p className="text-gray-400 text-sm col-span-3 text-center py-10">No clients yet. Add your first client!</p>}
        {clients.map(c => (
          <div key={c._id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                {c.name[0].toUpperCase()}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 text-sm">✏️</button>
                <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded hover:bg-red-50 text-red-400 text-sm">🗑️</button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">{c.name}</h3>
            {c.company && <p className="text-sm text-gray-500">{c.company}</p>}
            <p className="text-sm text-gray-500 mt-1">{c.email}</p>
            {c.phone && <p className="text-sm text-gray-400">{c.phone}</p>}
            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
              <span>📄 {c.totalInvoices} invoices</span>
              <span>💰 ₹{(c.totalAmount||0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">{editing ? 'Edit Client' : 'Add Client'}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[['name','Name *'],['email','Email *'],['phone','Phone'],['company','Company'],['gst','GST Number']].map(([k,l]) => (
                <div key={k} className={k==='name'||k==='email' ? 'col-span-2' : ''}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <input value={form[k]||''} onChange={e => setF(k, e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="col-span-2"><p className="text-xs font-medium text-gray-500 mb-2 mt-1">Address</p></div>
              {[['street','Street','col-span-2'],['city','City',''],['state','State',''],['pincode','Pincode',''],['country','Country','']].map(([k,l,cls]) => (
                <div key={k} className={cls || ''}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <input value={form.address?.[k]||''} onChange={e => setAddr(k, e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea value={form.notes||''} onChange={e => setF('notes', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60">{saving ? 'Saving...' : 'Save Client'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
