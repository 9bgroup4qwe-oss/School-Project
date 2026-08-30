'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Zap,
  Target,
  Trophy,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Flame,
  Star,
  Check,
  Sliders,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NCERT_CURRICULUM } from '@/data/ncertCurriculum';

export default function Landing() {
  const [demoGrade, setDemoGrade] = useState<number>(10);
  const [demoSelectedAnswer, setDemoSelectedAnswer] = useState<number | null>(0);

  const demoGradeData = NCERT_CURRICULUM[demoGrade] || NCERT_CURRICULUM[10];

  return (
    <div className="min-h-screen bg-[#07080d] text-[#f1f5f9] font-sans antialiased selection:bg-yellow-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* Dynamic Background Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-amber-400/8 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-indigo-600/10 blur-[160px]" />
      </div>

      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#07080d]/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">GrowMyIQ</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#curriculum" className="hover:text-white transition-colors">NCERT Classes 1–12</a>
            <a href="#preview" className="hover:text-white transition-colors">Interactive Demo</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button variant="ghost" className="text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="text-sm font-extrabold bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 rounded-xl px-5 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:-translate-y-0.5 transition-all">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-36 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-bold text-yellow-400 mb-8 backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curriculum Aligned • NCERT Classes 1 to 12</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Master Every Chapter with <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent">Adaptive AI.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl mb-10">
            Generate custom multiple-choice quizzes for any NCERT chapter, receive instant step-by-step reasoning on every question, and monitor your concept mastery.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/auth" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-base shadow-xl shadow-yellow-500/25 hover:shadow-yellow-500/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <Play className="w-4 h-4 fill-current" />
                <span>Start Practicing for Free</span>
              </button>
            </Link>
            <a href="#curriculum" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white font-bold text-base border border-white/[0.08] backdrop-blur-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Browse Syllabus (1–12)</span>
              </button>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-10 border-t border-white/[0.06] w-full text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white">12 Classes</div>
                <div className="text-xs text-gray-400">Primary to Senior</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white">Instant Feedback</div>
                <div className="text-xs text-gray-400">Step-by-step answers</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white">Adaptive AI</div>
                <div className="text-xs text-gray-400">Gemma 4 powered</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white">100% Free</div>
                <div className="text-xs text-gray-400">Open student tool</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Demo Section */}
      <section id="preview" className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Live Demo Experience</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">See How Instant AI Feedback Works</h2>
        </div>

        {/* Demo Interactive Quiz Card */}
        <div className="bg-[#0f111c]/80 backdrop-blur-2xl border border-white/[0.09] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                Class 10 • Science (PCB)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-xs font-bold capitalize">
                Medium
              </span>
            </div>
            <span className="text-xs font-bold text-gray-400">Demo Question 1 of 1</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white mb-6">
            Which of the following processes occurs during photosynthesis in green plants?
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {[
              { text: 'Reduction of carbon dioxide to carbohydrates', isCorrect: true },
              { text: 'Oxidation of carbohydrates to carbon dioxide', isCorrect: false },
              { text: 'Conversion of chemical energy to light energy', isCorrect: false },
              { text: 'Absorption of nitrogen by chlorophyll', isCorrect: false }
            ].map((opt, idx) => {
              const isSelected = demoSelectedAnswer === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setDemoSelectedAnswer(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? opt.isCorrect
                        ? 'bg-green-500/15 border-green-500/50 text-white'
                        : 'bg-red-500/15 border-red-500/50 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] text-gray-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSelected && opt.isCorrect
                        ? 'bg-green-500 text-slate-950'
                        : isSelected && !opt.isCorrect
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 text-gray-300'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-medium">{opt.text}</span>
                  </div>

                  {isSelected && opt.isCorrect && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                </div>
              );
            })}
          </div>

          {/* Explanation Demonstration Box */}
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-xs text-gray-300 leading-relaxed">
            <strong className="text-green-300 block mb-1">✓ Instant AI Explanation:</strong>
            Photosynthesis involves the reduction of carbon dioxide (CO₂) to carbohydrates (glucose) using the assimilatory power (ATP and NADPH) generated during the light reactions.
          </div>
        </div>
      </section>

      {/* Curriculum Showcase Section */}
      <section id="curriculum" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Comprehensive NCERT Library</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Explore All 12 Classes</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto mt-2">
            Click any class below to preview subjects and authentic NCERT chapter lists.
          </p>
        </div>

        {/* Grade Selector Strip */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
            <button
              key={g}
              onClick={() => setDemoGrade(g)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                demoGrade === g
                  ? 'bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20'
                  : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
              }`}
            >
              Class {g}
            </button>
          ))}
        </div>

        {/* Selected Grade Subjects Preview */}
        <div className="bg-[#0f111c]/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-xl font-bold text-white">
                {demoGradeData.gradeLabel} Curriculum
              </h3>
              <span className="text-xs text-yellow-400 font-bold">{demoGradeData.category}</span>
            </div>
            <Link href="/auth">
              <Button size="sm" className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-lg text-xs">
                Launch {demoGradeData.gradeLabel} Quiz →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoGradeData.subjects.map(s => (
              <div key={s.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{s.name}</h4>
                    <span className="text-xs text-gray-400">{s.chapters.length} NCERT Chapters</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mt-2">
                  {s.chapters.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Key Advantages</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Designed for Academic Excellence</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-[#0f111c]/70 backdrop-blur-xl border border-white/[0.08] hover:border-yellow-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Instant Step-by-Step Clarity</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Never wait until the end of an exam to discover why an answer was right or wrong. Learn the exact NCERT principle instantaneously.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0f111c]/70 backdrop-blur-xl border border-white/[0.08] hover:border-blue-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Custom Chapter Selection</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Focus on specific weak chapters or select an entire subject syllabus. Adjust difficulty between Easy, Medium, and Exemplar Hard.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0f111c]/70 backdrop-blur-xl border border-white/[0.08] hover:border-green-400/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-6">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Live Progress & History</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Track your scores, mastery percentage, time per question, and study consistency on your personalized student dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Call-to-Action */}
      <section className="relative z-10 py-20 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-b from-[#141829] to-[#0d0e17] border border-white/[0.1] rounded-3xl p-10 sm:p-14 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/25 text-xs font-bold text-yellow-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to Elevate Your Scores?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Start Your First NCERT Quiz Now
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto mb-8">
            Join students preparing smartly across CBSE and state boards. No setup fees, no paywalls.
          </p>

          <Link href="/auth">
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-base shadow-xl shadow-yellow-500/25 hover:shadow-yellow-500/35 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
              <span>Create Free Student Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8 px-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-yellow-400 flex items-center justify-center text-slate-950 font-black text-[10px]">
              G
            </div>
            <span className="font-bold text-white">GrowMyIQ</span>
            <span>• AI-Powered NCERT Learning</span>
          </div>
          <div>© {new Date().getFullYear()} GrowMyIQ. Built for educational excellence.</div>
        </div>
      </footer>
    </div>
  );
}
