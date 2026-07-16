import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {

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
        await authAPI.register({ name: form.name, email: form.email, password: form.password, companyName: form.companyName });
        toast.success('Account created! Welcome!');
        navigate('/dashboard');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        navigate('/verify-otp', { state: { email: data.email } });
      } else {
        toast.error(data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: '\u{1F9FE}', title: 'Smart Invoicing', desc: 'Auto-calculate tax, subtotal and totals instantly' },
    { icon: '\u{1F4E7}', title: 'Email with PDF', desc: 'Send professional invoices directly to clients' },
    { icon: '\u{1F4CA}', title: 'Revenue Analytics', desc: 'Track payments, overdue and monthly trends' },
    { icon: '\u{1F512}', title: 'Secure & Private', desc: 'JWT auth with encrypted data storage' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0a0b0f 0%, #0f1117 50%, #0a0b1a 100%)' }}>
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: '400px', height: '400px', background: 'rgba(99,102,241,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: '300px', height: '300px', background: 'rgba(139,92,246,0.06)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div className="w-full" style={{ maxWidth: '920px', display: 'flex', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center" style={{ flex: 1, padding: '52px', background: 'linear-gradient(145deg, #0d0e18, #111220)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              {'\u{1F9FE}'}
            </div>
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#f1f5f9' }}>InvoiceHub</span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px', lineHeight: '1.3' }}>
            Manage invoices<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>like a pro</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.7', marginBottom: '36px' }}>
            Professional invoice management for freelancers and businesses. Create, send and track invoices effortlessly.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '2px' }}>{f.title}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Project</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>invoice-hub-liard.vercel.app</div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ width: '380px', padding: '48px', background: '#0d0e18', display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' }}>
              {tab === 'login' ? 'Welcome back' : 'Get started free'}
            </h2>
            <p style={{ fontSize: '13px', color: '#475569' }}>
              {tab === 'login' ? 'Sign in to your InvoiceHub account' : 'Create your account in seconds'}
            </p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '4px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', fontSize: '13px', borderRadius: '7px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: tab === t ? '500' : '400', transition: 'all 0.2s', border: 'none', background: tab === t ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : 'transparent', color: tab === t ? '#fff' : '#475569', boxShadow: tab === t ? '0 2px 8px rgba(99,102,241,0.3)' : 'none' }}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tab === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Name</label>
                  <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Your company"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                </div>
              </>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com" required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" required minLength={8}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: loading ? '#374151' : 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', marginTop: '4px', transition: 'all 0.2s' }}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '12px', color: '#475569', marginTop: '20px' }}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span onClick={() => setTab(tab === 'login' ? 'register' : 'login')} style={{ color: '#818cf8', cursor: 'pointer', fontWeight: '500' }}>
              {tab === 'login' ? 'Create one free' : 'Sign in'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
