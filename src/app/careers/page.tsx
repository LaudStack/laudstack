"use client";

export const dynamic = 'force-dynamic';


// LaudStack — Careers Page
// Company culture, open positions, and application process

import { useState } from 'react';
import {
  Briefcase, MapPin, Clock, Users, Heart, Zap, Globe,
  Shield, ArrowRight, CheckCircle, Star, ChevronDown,
  Coffee, Laptop, TrendingUp, Award, Mail
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────

type Department = 'All' | 'Engineering' | 'Product' | 'Marketing' | 'Community' | 'Operations';

interface Job {
  id: number;
  title: string;
  department: Department;
  pathname: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  remote: boolean;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  description: string;
  requirements: string[];
  posted: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────

const DEPARTMENTS: Department[] = ['All', 'Engineering', 'Product', 'Marketing', 'Community', 'Operations'];

const OPEN_ROLES: Job[] = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    pathname: 'Remote (Americas / Europe)',
    type: 'Full-time',
    remote: true,
    level: 'Senior',
    description: 'Own and evolve core platform features — from the product discovery engine to the review system. You\'ll work across the full stack (TypeScript, React, Node.js, MySQL) and have a direct impact on how 12,000+ professionals find their next tool.',
    requirements: [
      '5+ years of full-stack experience with TypeScript',
      'Strong React and Node.js fundamentals',
      'Experience with relational databases (MySQL or PostgreSQL)',
      'Comfortable working in a fast-moving, async-first team',
    ],
    posted: '3 days ago',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Product',
    pathname: 'Remote (Global)',
    type: 'Full-time',
    remote: true,
    level: 'Mid',
    description: 'Shape the visual and interaction design of LaudStack — from the homepage to the founder dashboard. You\'ll work closely with engineering and community to design experiences that feel earned, not assembled.',
    requirements: [
      '3+ years of product design experience',
      'Strong Figma skills and a portfolio showing end-to-end design work',
      'Experience designing for SaaS or marketplace products',
      'Ability to contribute to and maintain a design system',
    ],
    posted: '1 week ago',
  },
  {
    id: 3,
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    pathname: 'Remote (Americas)',
    type: 'Full-time',
    remote: true,
    level: 'Mid',
    description: 'Drive user and founder acquisition across SEO, content, and partnerships. You\'ll own the growth funnel end-to-end — from organic discovery to activation — and build the playbooks that scale LaudStack from 12k to 100k users.',
    requirements: [
      '3+ years in growth or performance marketing for a B2B or marketplace product',
      'Strong SEO fundamentals and content strategy experience',
      'Data-driven mindset with experience in analytics tools',
      'Bonus: experience with developer or founder communities',
    ],
    posted: '2 weeks ago',
  },
  {
    id: 4,
    title: 'Community Manager',
    department: 'Community',
    pathname: 'Remote (Global)',
    type: 'Full-time',
    remote: true,
    level: 'Mid',
    description: 'Build and nurture the LaudStack community of tool users and founders. You\'ll run events, manage the newsletter, moderate reviews, and be the voice of the community internally — ensuring what we build reflects what our users actually need.',
    requirements: [
      '2+ years of community management experience',
      'Excellent written communication skills',
      'Experience running online events and webinars',
      'Passion for software tools and the indie founder ecosystem',
    ],
    posted: '2 weeks ago',
  },
  {
    id: 5,
    title: 'Backend Engineer (Search & Ranking)',
    department: 'Engineering',
    pathname: 'Remote (Americas / Europe)',
    type: 'Full-time',
    remote: true,
    level: 'Senior',
    description: 'Own the search and ranking systems that power tool discovery on LaudStack. You\'ll design and improve the algorithms that determine which tools surface first — balancing community signals, editorial curation, and business rules.',
    requirements: [
      '4+ years of backend engineering experience',
      'Experience building or improving search and ranking systems',
      'Strong SQL and data modelling skills',
      'Familiarity with search infrastructure (Elasticsearch, Typesense, or similar)',
    ],
    posted: '3 weeks ago',
  },
  {
    id: 6,
    title: 'Trust & Quality Analyst',
    department: 'Operations',
    pathname: 'Remote (Global)',
    type: 'Part-time',
    remote: true,
    level: 'Junior',
    description: 'Help maintain the integrity of the LaudStack review ecosystem. You\'ll review flagged submissions, investigate suspicious activity, and work with the Trust team to refine our verification policies.',
    requirements: [
      '1+ years of experience in trust & safety, content moderation, or quality assurance',
      'Strong attention to detail and analytical thinking',
      'Comfortable working with data and internal tooling',
      'Interest in SaaS and AI stacks is a big plus',
    ],
    posted: '1 month ago',
  },
];

const PERKS = [
  { icon: <Globe className="w-5 h-5 text-amber-500" />, title: 'Fully Remote', desc: 'Work from anywhere in the world. We\'re async-first and trust you to manage your time.' },
  { icon: <Laptop className="w-5 h-5 text-amber-500" />, title: '$2,000 Home Office Budget', desc: 'Set up your ideal workspace. Spend it on whatever makes you most productive.' },
  { icon: <Heart className="w-5 h-5 text-amber-500" />, title: 'Health & Wellness', desc: 'Comprehensive health coverage plus a monthly wellness stipend for gym, therapy, or whatever keeps you well.' },
  { icon: <TrendingUp className="w-5 h-5 text-amber-500" />, title: 'Learning Budget', desc: '$1,500/year for courses, books, conferences, or anything that makes you better at your craft.' },
  { icon: <Coffee className="w-5 h-5 text-amber-500" />, title: 'Team Retreats', desc: 'Two in-person team retreats per year. We work remotely but we value real human connection.' },
  { icon: <Award className="w-5 h-5 text-amber-500" />, title: 'Equity', desc: 'Every full-time team member gets meaningful equity. We\'re building this together.' },
  { icon: <Clock className="w-5 h-5 text-amber-500" />, title: 'Flexible Hours', desc: 'No fixed hours. We care about output, not when you\'re online. Take the time you need.' },
  { icon: <Zap className="w-5 h-5 text-amber-500" />, title: 'Tool Allowance', desc: 'Unlimited access to every product on LaudStack, plus a $500/year budget for any SaaS subscriptions you need.' },
];

const VALUES = [
  { icon: <Shield className="w-5 h-5 text-amber-500" />, title: 'Integrity over optics', desc: 'We say what we mean, do what we say, and own our mistakes. No politics, no spin.' },
  { icon: <Users className="w-5 h-5 text-amber-500" />, title: 'Community is the product', desc: 'The people who use LaudStack are not just users — they\'re co-creators. We build with them, not for them.' },
  { icon: <Star className="w-5 h-5 text-amber-500" />, title: 'Craft matters', desc: 'We care deeply about quality — in our code, our copy, our design, and our community. Good enough is never enough.' },
  { icon: <Zap className="w-5 h-5 text-amber-500" />, title: 'Bias toward action', desc: 'We move fast, ship often, and learn from real usage. A shipped imperfect feature beats a perfect one that never launches.' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Apply', desc: 'Send your CV and a short note on why you\'re interested in this role. No cover letter required — just be yourself.' },
  { step: '02', title: 'Intro Call', desc: 'A 30-minute video call with someone from the team. We\'ll tell you about LaudStack and learn about you.' },
  { step: '03', title: 'Take-Home Task', desc: 'A short, paid task relevant to the role. We respect your time — nothing longer than 3 hours.' },
  { step: '04', title: 'Team Interview', desc: 'A 60-minute conversation with 2–3 team members. We focus on how you think, not trivia questions.' },
  { step: '05', title: 'Offer', desc: 'If it\'s a match, we move fast. Expect an offer within 48 hours of your final interview.' },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function Careers() {
  const [activeDept, setActiveDept] = useState<Department>('All');
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  const filteredJobs = activeDept === 'All'
    ? OPEN_ROLES
    : OPEN_ROLES.filter(j => j.department === activeDept);

  const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
    Junior:  { color: '#059669', bg: '#ECFDF5' },
    Mid:     { color: '#2563EB', bg: '#EFF6FF' },
    Senior:  { color: '#7C3AED', bg: '#F5F3FF' },
    Lead:    { color: '#D97706', bg: '#FFFBEB' },
  };

  const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
    'Full-time':  { color: '#0F172A', bg: '#F1F5F9' },
    'Part-time':  { color: '#475569', bg: '#F8FAFC' },
    'Contract':   { color: '#64748B', bg: '#F8FAFC' },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">

        {/* Hero */}
        <PageHero
          eyebrow="Careers at LaudStack"
          title="Help us build the future of software discovery."
          subtitle="We're a small, fully remote team on a mission to make software discovery honest, transparent, and community-driven. If that sounds like your kind of work, we'd love to meet you."
          accent="amber"
          layout="centered"
          size="lg"
        />

        {/* Stats bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '8', label: 'Team Members' },
                { value: '100%', label: 'Remote' },
                { value: '6', label: 'Open Roles' },
                { value: '12', label: 'Countries Represented' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-3xl font-black text-slate-900 mb-1">{s.value}</div>
                  <div className="text-slate-500 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

          {/* Company values */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-2">
              <Heart className="w-4 h-4" />
              How We Work
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Our values, not just words on a wall.</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-2xl">
              These aren't aspirational posters — they're the actual principles that guide how we make decisions, hire people, and build the product.
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {VALUES.map(v => (
                <div key={v.title} className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    {v.icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 mb-1">{v.title}</div>
                    <div className="text-slate-500 text-sm leading-relaxed">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Perks */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-2">
              <Award className="w-4 h-4" />
              Perks & Benefits
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">We take care of our team.</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-2xl">
              Beyond competitive salaries, here's what working at LaudStack looks like day-to-day.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {PERKS.map(perk => (
                <div key={perk.title} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-3">
                    {perk.icon}
                  </div>
                  <div className="font-bold text-slate-900 text-sm mb-1">{perk.title}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{perk.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Open positions */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-2">
              <Briefcase className="w-4 h-4" />
              Open Positions
            </div>
            <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">
                  {filteredJobs.length} open role{filteredJobs.length !== 1 ? 's' : ''}
                  {activeDept !== 'All' && <span className="text-amber-500"> in {activeDept}</span>}
                </h2>
                <p className="text-slate-500 text-sm">All roles are fully remote unless otherwise noted.</p>
              </div>
            </div>

            {/* Department filter */}
            <div className="flex gap-2 flex-wrap mb-6">
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  onClick={() => { setActiveDept(dept); setExpandedJob(null); }}
                  className="text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all"
                  style={{
                    background: activeDept === dept ? '#FBBF24' : '#FFFFFF',
                    borderColor: activeDept === dept ? '#FBBF24' : '#E2E8F0',
                    color: activeDept === dept ? '#0F172A' : '#64748B',
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Job cards */}
            <div className="space-y-3">
              {filteredJobs.map(job => {
                const isExpanded = expandedJob === job.id;
                const levelCfg = LEVEL_COLORS[job.level];
                const typeCfg = TYPE_COLORS[job.type];
                return (
                  <div
                    key={job.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-amber-300 transition-colors"
                  >
                    {/* Card header — always visible */}
                    <button
                      className="w-full text-left px-6 py-5 flex items-start gap-4"
                      onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Briefcase className="w-4.5 h-4.5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-black text-slate-900 text-base">{job.title}</span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ color: levelCfg.color, background: levelCfg.bg }}
                          >
                            {job.level}
                          </span>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ color: typeCfg.color, background: typeCfg.bg }}
                          >
                            {job.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.pathname}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Posted {job.posted}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className="w-5 h-5 text-slate-300 flex-shrink-0 mt-1 transition-transform"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-100 pt-5">
                        <p className="text-slate-600 text-sm leading-relaxed mb-5">{job.description}</p>
                        <div className="mb-6">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">What we're looking for</div>
                          <ul className="space-y-2">
                            {job.requirements.map(req => (
                              <li key={req} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          onClick={() => toast.success(`Application started for "${job.title}". Check your email for next steps.`)}
                          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
                        >
                          Apply for this role
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No open roles in {activeDept} right now.</p>
                <button
                  onClick={() => setActiveDept('All')}
                  className="mt-2 text-amber-500 hover:text-amber-400 text-sm font-semibold transition-colors"
                >
                  View all departments
                </button>
              </div>
            )}
          </section>

          {/* Application process */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-2">
              <CheckCircle className="w-4 h-4" />
              Application Process
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">What to expect.</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-2xl">
              We keep our hiring process short, respectful, and transparent. From first application to offer, most roles take 2–3 weeks.
            </p>
            <div className="grid md:grid-cols-5 gap-4">
              {PROCESS_STEPS.map((step, idx) => (
                <div key={step.step} className="relative">
                  {idx < PROCESS_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[calc(100%-8px)] w-full h-px bg-amber-200 z-0" />
                  )}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 relative z-10">
                    <div className="text-2xl font-black text-amber-400 mb-2">{step.step}</div>
                    <div className="font-bold text-slate-900 text-sm mb-1">{step.title}</div>
                    <div className="text-slate-400 text-xs leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Speculative application CTA */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <Mail className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 mb-2">Don't see the right role?</h3>
            <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">
              We're always interested in meeting exceptional people. Send us a note about who you are and what you'd love to work on — we read every message.
            </p>
            <a
              href="mailto:careers@laudstack.com"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <Mail className="w-4 h-4" />
              careers@laudstack.com
            </a>
            <p className="text-slate-400 text-xs mt-3">We aim to respond to all speculative applications within 5 business days.</p>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
