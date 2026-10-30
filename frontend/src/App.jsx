import React, { useState, useEffect } from 'react';
import { authService } from './services/api';
import { soundEffects } from './utils/audio';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import TimetablePage from './pages/TimetablePage';
import { LayoutDashboard, Brain, Calendar, LogOut, Sparkles, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(soundEffects.isEnabled());

  useEffect(() => {
    // Check if user is already logged in
    authService.getSession().then((sess) => {
      if (sess) {
        setSession(sess);
        setCurrentPage('dashboard');
      }
      setLoading(false);
    });
  }, []);

  const handleToggleSound = () => {
    const newState = soundEffects.toggleSound();
    setSoundOn(newState);
  };

  const handleNavigate = (page) => {
    soundEffects.playSelect();
    setCurrentPage(page);
  };

  const handleLogout = async () => {
    soundEffects.playBack();
    await authService.signOut();
    setSession(null);
    setCurrentPage('landing');
  };

  const handleLoginSuccess = (sess) => {
    soundEffects.playScoreTriumph();
    setSession(sess);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading GrowMyIQ...</div>
      </div>
    );
  }

  // Not logged in: show Landing or Auth modal
  if (!session) {
    if (currentPage === 'auth') {
      return (
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onBackToLanding={() => setCurrentPage('landing')}
        />
      );
    }
    return <LandingPage onGetStarted={() => setCurrentPage('auth')} />;
  }

  // Logged in: Main Application Shell
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <nav style={{
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '0.75rem 1.5rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleNavigate('dashboard')}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: 'var(--accent-glow)'
            }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff' }}>
              Grow<span style={{ color: '#818cf8' }}>MyIQ</span>
            </span>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => handleNavigate('dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', borderRadius: '10px',
                background: currentPage === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: currentPage === 'dashboard' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                color: currentPage === 'dashboard' ? '#818cf8' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigate('quiz')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', borderRadius: '10px',
                background: currentPage === 'quiz' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: currentPage === 'quiz' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                color: currentPage === 'quiz' ? '#818cf8' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <Brain size={16} />
              <span>Adaptive Quiz</span>
            </button>

            <button
              onClick={() => handleNavigate('timetable')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', borderRadius: '10px',
                background: currentPage === 'timetable' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: currentPage === 'timetable' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                color: currentPage === 'timetable' ? '#818cf8' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <Calendar size={16} />
              <span>AI Timetable</span>
            </button>
          </div>

          {/* User action & Global Sound Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleToggleSound}
              style={{
                background: soundOn ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: soundOn ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-subtle)',
                color: soundOn ? '#818cf8' : 'var(--text-subtle)',
                borderRadius: '8px', padding: '0.45rem 0.65rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={soundOn ? 'Sound Effects Enabled (Click to mute)' : 'Sound Effects Muted (Click to enable)'}
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>
                {soundOn ? 'SFX On' : 'SFX Off'}
              </span>
            </button>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.user?.email || 'Student'}
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Page Content */}
      <main style={{ flex: 1 }}>
        {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentPage === 'quiz' && <QuizPage />}
        {currentPage === 'timetable' && <TimetablePage />}
      </main>
    </div>
  );
}
