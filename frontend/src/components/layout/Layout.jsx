import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/invoices', icon: '🧾', label: 'Invoices' },
  { to: '/invoices/new', icon: '✦', label: 'New Invoice' },
  { to: '/clients', icon: '👥', label: 'Clients' },
  { to: '/profile', icon: '⚙️', label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0b0f', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{ width: '220px', background: '#0d0e18', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🧾</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>InvoiceHub</div>
              <div style={{ fontSize: '10px', color: '#475569' }}>Invoice Management</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          <div style={{ fontSize: '10px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px 8px', fontWeight: '500' }}>Main</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', margin: '1px 0', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s',
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: isActive ? '#818cf8' : '#475569',
                fontWeight: isActive ? '500' : '400',
                border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
              })}>
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', marginBottom: '4px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: '10px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#475569', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.08)'; e.target.style.color = '#f87171'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#475569'; }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', background: '#0a0b0f' }}>
        <Outlet />
      </main>
    </div>
  );
}
