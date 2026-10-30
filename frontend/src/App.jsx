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
        background: 'rgba(14, 19, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky', top: 0, zIndex: 50,
        padding: '0.7rem 1rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flexShrink: 0 }} onClick={() => handleNavigate('dashboard')}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: 'var(--accent-glow)'
            }}>
              <Sparkles size={18} color="#0e1312" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff' }}>
              Grow<span style={{ color: 'var(--accent-primary)' }}>MyIQ</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="desktop-nav-links">
            <button
              onClick={() => handleNavigate('dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', borderRadius: '10px',
                background: currentPage === 'dashboard' ? 'rgba(110, 168, 163, 0.15)' : 'transparent',
                border: currentPage === 'dashboard' ? '1px solid rgba(110, 168, 163, 0.3)' : '1px solid transparent',
                color: currentPage === 'dashboard' ? 'var(--accent-primary)' : 'var(--text-muted)',
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
                background: currentPage === 'quiz' ? 'rgba(110, 168, 163, 0.15)' : 'transparent',
                border: currentPage === 'quiz' ? '1px solid rgba(110, 168, 163, 0.3)' : '1px solid transparent',
                color: currentPage === 'quiz' ? 'var(--accent-primary)' : 'var(--text-muted)',
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
                background: currentPage === 'timetable' ? 'rgba(110, 168, 163, 0.15)' : 'transparent',
                border: currentPage === 'timetable' ? '1px solid rgba(110, 168, 163, 0.3)' : '1px solid transparent',
                color: currentPage === 'timetable' ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <Calendar size={16} />
              <span>AI Timetable</span>
            </button>
          </div>

          {/* User action & Global Sound Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleToggleSound}
              style={{
                background: soundOn ? 'rgba(110, 168, 163, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: soundOn ? '1px solid rgba(110, 168, 163, 0.3)' : '1px solid var(--border-subtle)',
                color: soundOn ? 'var(--accent-primary)' : 'var(--text-subtle)',
                borderRadius: '8px', padding: '0.45rem 0.65rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={soundOn ? 'Sound Effects Enabled (Click to mute)' : 'Sound Effects Muted (Click to enable)'}
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hide-on-mobile">{soundOn ? 'SFX On' : 'SFX Off'}</span>
            </button>

            <span className="hide-on-mobile" style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.user?.email || 'Student'}
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span className="hide-on-mobile">Exit</span>
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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'quiz', label: 'AI Quiz', icon: Brain },
          { id: 'timetable', label: 'Timetable', icon: Calendar }
        ].map(tab => {
          const IconComponent = tab.icon;
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.25rem',
                background: 'none',
                border: 'none',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-subtle)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                padding: '0.3rem 0.85rem',
                borderRadius: '999px',
                background: isActive ? 'rgba(110, 168, 163, 0.2)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconComponent size={18} />
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
