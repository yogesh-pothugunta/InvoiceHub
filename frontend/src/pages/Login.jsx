import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        // Register → OTP page కి వెళ్తుంది
        await authAPI.register({
          name: form.name,
          email: form.email,
          password: form.password,
          companyName: form.companyName
        });
        toast.success('Account created! Welcome!');
        navigate('/dashboard');
       
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        toast.error('Please verify your email first');
        navigate('/verify-otp', { state: { email: data.email } });
      } else {
        toast.error(data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🧾</div>
          <h1 className="text-xl font-semibold text-gray-900">InvoiceHub</h1>
          <p className="text-sm text-gray-500 mt-1">Invoice Management System</p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm rounded-md font-medium transition-all ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              {t === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
                <input value={form.companyName} onChange={e => set('companyName', e.target.value)}
                  placeholder="Your Company Pvt Ltd"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="you@company.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="Min 8 characters"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required minLength={8} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}