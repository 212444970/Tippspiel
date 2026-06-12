import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/matches', label: '⚽ Matches' },
  { to: '/my-tips', label: '✏️ My tips' },
  { to: '/all-tips', label: '👥 All tips' },
  { to: '/tournament', label: '🌍 Tournament' },
  { to: '/leaderboard', label: '🏆 Ranking' },
];

export default function Layout() {
  const user = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate('/login');
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem', height: 56 }}>
          <div style={{ fontWeight: 600, fontSize: 17, flex: 1 }}>
            ⚽ Tippspiel <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--text-muted)' }}>WC 2026</span>
          </div>
          <Link to="/profile" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>{user?.email}</Link>
          <button onClick={handleLogout} style={{
            fontSize: 13,
            padding: '5px 12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: 'transparent',
            color: 'var(--text-muted)',
          }}>Log out</button>
        </div>
      </header>

      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 4, padding: '0 1rem' }}>
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              padding: '10px 14px',
              fontSize: 14,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 500 : 400,
            })}>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: 680, margin: '0 auto', width: '100%', padding: '1.5rem 1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
