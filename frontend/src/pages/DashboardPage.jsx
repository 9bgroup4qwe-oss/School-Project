import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { soundEffects } from '../utils/audio';
import { Award, Brain, Calendar, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = data?.metrics || {
    total_quizzes_completed: 0,
    average_score: 0,
    active_timetables_count: 0,
    weak_areas_count: 0
  };

  return (
    <div className="page-container">
      {/* Welcome Hero */}
      <div className="glass-panel responsive-panel" style={{ marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Academic Command Center
          </span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.25rem)', fontWeight: 800, margin: '0.5rem 0 1rem 0', lineHeight: 1.2 }}>
            Master Every Concept with Precision
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            Generate adaptive practice tests, review weak spots, and optimize your study schedule with real-time AI insights.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                soundEffects.playNextStep();
                onNavigate('quiz');
              }}
              className="btn-primary"
            >
              <Brain size={18} />
              <span>Take a Practice Quiz</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playSelect();
                onNavigate('timetable');
              }}
              className="btn-secondary"
            >
              <Calendar size={18} />
              <span>View Timetable</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quizzes Taken</span>
            <Award size={20} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.total_quizzes_completed}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average Score</span>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{metrics.average_score}%</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Schedules</span>
            <Calendar size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.active_timetables_count}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weak Areas</span>
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>{metrics.weak_areas_count}</div>
        </div>
      </div>

      {/* Weak Areas Banner if any */}
      {(data?.weak_areas || []).length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
            <AlertTriangle size={18} />
            Identified Weak Topics to Strengthen
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {data.weak_areas.map((w, idx) => (
              <div key={idx} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>{w.subject}: </span>
                <span style={{ color: '#fca5a5' }}>{w.chapter}</span>
                <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>({w.accuracy_rate}% accuracy)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
