import React, { useState } from 'react';
import { soundEffects } from '../utils/audio';
import {
  Sparkles,
  Brain,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Star,
  ShieldCheck,
  ChevronRight,
  Zap,
  Users,
  Clock,
  Heart
} from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const benefits = [
    {
      title: 'Effortless Study Scheduling',
      description: 'Auto-generates balanced weekly timetables tailored to your syllabus, exams, and free time.',
      icon: Calendar,
      color: '#6366f1'
    },
    {
      title: 'Adaptive AI Quizzing',
      description: 'Generates questions on demand that target your weak areas, with step-by-step explanations.',
      icon: Brain,
      color: '#a855f7'
    },
    {
      title: 'NCERT & CBSE Aligned',
      description: 'Content perfectly structured for school curriculum and board exams to guarantee concept clarity.',
      icon: BookOpen,
      color: '#ec4899'
    }
  ];

  const comparisons = [
    { feature: 'Adaptive AI assessments', grow: true, traditional: false },
    { feature: 'Automatic syllabus-based scheduling', grow: true, traditional: false },
    { feature: 'Instant mistake analysis & weak spot tracking', grow: true, traditional: false },
    { feature: 'Zero-stress planning', grow: true, traditional: false },
    { feature: 'Static, outdated question banks', grow: false, traditional: true },
    { feature: 'Overwhelming, unstructured cramming', grow: false, traditional: true }
  ];

  const testimonials = [
    {
      name: 'Ishita',
      role: 'Student, NPS INR',
      quote: 'GrowMyIQ completely removed the stress of exam planning. The daily quizzes keep me prepared without burnout.'
    },
    {
      name: 'Daksh Saxena',
      role: 'Student, Class 11',
      quote: 'The AI understands where I make silly mistakes in Physics and focuses right on them. My scores improved drastically.'
    },
    {
      name: 'Advait',
      role: 'Student, Class 12',
      quote: 'Generating study timetables used to take me hours on paper. Now it takes 5 seconds, and it actually works.'
    }
  ];

  const faqs = [
    {
      q: 'How does GrowMyIQ tailor quizzes to my syllabus?',
      a: 'GrowMyIQ uses curriculum-aware AI models that generate specific questions for your grade, subject, and chapter. When you complete quizzes, it detects weak chapters and reinforces them.'
    },
    {
      q: 'Can I upload my school portion or syllabus PDF?',
      a: 'Yes! The Timetable module features an AI syllabus extractor where you upload your portion PDF and it automatically maps topics into a weekly study plan.'
    },
    {
      q: 'Is it suitable for CBSE and school exams?',
      a: 'Absolutely. It is built ground-up to support NCERT and CBSE subjects including Physics, Chemistry, Mathematics, and Biology.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <nav className="app-top-navbar" style={{
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: 'var(--accent-glow)'
          }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            Grow<span style={{ color: '#818cf8' }}>MyIQ</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => {
              soundEffects.playNextStep();
              onGetStarted();
            }}
            className="btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            Get Started
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '6rem 1.5rem 4rem 1.5rem',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 1rem', borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)',
          color: '#818cf8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.75rem'
        }}>
          <Zap size={15} />
          <span>Next-Generation AI Study Companion</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem',
          color: '#ffffff'
        }}>
          Learning. <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Re-invented.</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          maxWidth: '650px',
          margin: '0 auto 2.5rem auto'
        }}>
          Revolutionising student learning with artificial intelligence. GrowMyIQ turns your syllabus into daily adaptive quizzes and structured study timetables.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              soundEffects.playNextStep();
              onGetStarted();
            }}
            className="btn-primary"
            style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}
          >
            <span>Launch Your Workspace</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Benefits Grid */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Why Choose GrowMyIQ?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Smart tools engineered to give you the highest retention in the least amount of time.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="glass-panel responsive-panel" style={{ padding: '2rem' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `${b.color}22`, border: `1px solid ${b.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <Icon size={24} color={b.color} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{b.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>GrowMyIQ vs Traditional Studying</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            See why thousands of students make the switch.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Capability</th>
                <th style={{ padding: '1rem', color: '#818cf8', fontWeight: 700, textAlign: 'center' }}>GrowMyIQ</th>
                <th style={{ padding: '1rem', color: 'var(--text-subtle)', fontWeight: 600, textAlign: 'center' }}>Traditional Method</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500, fontSize: '0.95rem' }}>{c.feature}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {c.grow ? <CheckCircle2 size={20} color="#10b981" style={{ margin: '0 auto' }} /> : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {c.traditional ? <span style={{ color: '#f87171', fontWeight: 700 }}>✕</span> : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Loved by Top Students</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', color: '#fbbf24', marginTop: '0.5rem' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#fbbf24" />)}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                "{t.quote}"
              </p>
              <div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{t.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#818cf8' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{ padding: '4rem 1.5rem 6rem 1.5rem', maxWidth: '750px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((f, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
                onClick={() => {
                  soundEffects.playToggle(!isOpen);
                  setActiveFaq(isOpen ? null : idx);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
                  <span>{f.q}</span>
                  <ChevronRight size={18} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
                {isOpen && (
                  <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text-subtle)',
        fontSize: '0.85rem'
      }}>
        © 2026 GrowMyIQ. All rights reserved. Built for school excellence.
      </footer>
    </div>
  );
}
