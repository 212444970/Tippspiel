import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import EmailLinkLanding from './pages/EmailLinkLanding';
import MatchesPage from './pages/MatchesPage';
import MyTipsPage from './pages/MyTipsPage';
import LeaderboardPage from './pages/LeaderboardPage';

function RequireAuth({ children }) {
  const user = useAuth();
  if (user === undefined) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/email-link" element={<EmailLinkLanding />} />
      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Navigate to="/matches" replace />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route path="my-tips" element={<MyTipsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
      </Route>
    </Routes>
  );
}
