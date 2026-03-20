"use client";

// LaudStack — Careers Page
// Fully rebuilt: culture-forward, no fake stats, founder-driven narrative

import { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase, MapPin, Clock, Users, Heart, Zap, Globe,
  Shield, ArrowRight, CheckCircle, Star, ChevronDown,
  Coffee, Laptop, TrendingUp, Award, Mail, Rocket,
  Code, Palette, BarChart3, MessageSquare, Target
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
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  remote: boolean;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  posted: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────

const DEPARTMENTS: Department[] = ['All', 'Engineering', 'Product', 'Marketing', 'Community', 'Operations'];

const DEPT_ICONS: Record<string, React.ReactNode> = {
  Engineering: <Code className="w-4.5 h-4.5 text-amber-500" />,
  Product: <Palette className="w-4.5 h-4.5 text-amber-500" />,
  Marketing: <BarChart3 className="w-4.5 h-4.5 text-amber-500" />,
  Community: <MessageSquare className="w-4.5 h-4.5 text-amber-500" />,
  Operations: <Shield className="w-4.5 h-4.5 text-amber-500" />,
};

const OPEN_ROLES: Job[] = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote (Americas / Europe)',
    type: 'Full-time',
    remote: true,
    level: 'Senior',
    description: 'Own and evolve core platform features — from the product discovery engine and review system to the deals marketplace and community voting. You\'ll work across the full stack (TypeScript, React, Node.js, PostgreSQL) and have a direct impact on how professionals discover their next stack.',
    responsibilities: [
      'Design, build, and ship full-stack features end-to-end',
      'Collaborate with product and design on user-facing experiences',
      'Improve platform performance, reliability, and developer experience',
      'Participate in code reviews and mentor junior engineers',
      'Contribute to technical architecture decisions',
    ],
    requirements: [
      '5+ years of full-stack experience with TypeScript',
      'Strong React and Node.js fundamentals',
      'Experience with relational databases (MySQL or PostgreSQL)',
      'Comfortable working in a fast-moving, async-first team',
      'Track record of shipping production features independently',
    ],
    niceToHave: [
      'Experience building marketplace or review platforms',
      'Familiarity with search infrastructure (Elasticsearch, Typesense)',
      'Open-source contributions or side projects',
    ],
    posted: '3 days ago',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Product',
    location: 'Remote (Global)',
    type: 'Full-time',
    remote: true,
    level: 'Mid',
    description: 'Shape the visual and interaction design of LaudStack — from the homepage and product pages to the founder dashboard and deals marketplace. You\'ll work closely with engineering and community to design experiences that feel crafted, not assembled.',
    responsibilities: [
      'Own the end-to-end design process from research to shipped pixels',
      'Create wireframes, prototypes, and high-fidelity designs in Figma',
      'Maintain and evolve the LaudStack design system',
      'Conduct user research and usability testing',
      'Collaborate daily with engineering on implementation quality',
    ],
    requirements: [
      '3+ years of product design experience',
      'Strong Figma skills and a portfolio showing end-to-end design work',
      'Experience designing for SaaS, marketplace, or community products',
      'Ability to contribute to and maintain a design system',
      'Understanding of responsive design and accessibility standards',
    ],
    niceToHave: [
      'Experience with motion design or micro-interactions',
      'Basic understanding of HTML/CSS for design handoff',
      'Passion for software tools and the indie founder ecosystem',
    ],
    posted: '1 week ago',
  },
  {
    id: 3,
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Remote (Americas)',
    type: 'Full-time',
    remote: true,
    level: 'Mid',
    description: 'Drive user and founder acquisition across SEO, content, partnerships, and community channels. You\'ll own the growth funnel end-to-end — from organic discovery to activation — and build the playbooks that scale LaudStack\'s reach and engagement.',
    responsibilities: [
      'Develop and execute SEO and content marketing strategies',
      'Build and manage partnership and co-marketing programs',
      'Analyse acquisition funnels and optimise conversion rates',
      'Create growth experiments and measure results rigorously',
      'Collaborate with community and product teams on launch campaigns',
    ],
    requirements: [
      '3+ years in growth or performance marketing for a B2B or marketplace product',
      'Strong SEO fundamentals and content strategy experience',
      'Data-driven mindset with experience in analytics tools',
      'Excellent written communication skills',
      'Experience managing marketing budgets and reporting on ROI',
    ],
    niceToHave: [
      'Experience with developer or founder communities',
      'Familiarity with Product Hunt, G2, or AppSumo ecosystems',
      'Background in SaaS or tech media',
    ],
    posted: '2 weeks ago',
  },
  {
    id: 4,
    title: 'Community Manager',
    department: 'Community',
    location: 'Remote (Global)',
    type: 'Full-time',
    remote: true,
    level: 'Mid',
    description: 'Build and nurture the LaudStack community of software users and founders. You\'ll run events, manage the newsletter, moderate reviews, facilitate community voting, and be the voice of the community internally — ensuring what we build reflects what our users actually need.',
    responsibilities: [
      'Grow and engage the LaudStack community across channels',
      'Manage the weekly newsletter and community communications',
      'Moderate reviews, comments, and community discussions',
      'Plan and run online events, AMAs, and product launch days',
      'Gather and synthesise community feedback for the product team',
    ],
    requirements: [
      '2+ years of community management experience',
      'Excellent written communication skills',
      'Experience running online events and webinars',
      'Passion for software tools and the indie founder ecosystem',
      'Ability to handle sensitive situations with empathy and professionalism',
    ],
    niceToHave: [
      'Experience moderating review or marketplace platforms',
      'Background in tech journalism or content creation',
      'Familiarity with community tools (Discord, Circle, Slack)',
    ],
    posted: '2 weeks ago',
  },
  {
    id: 5,
    title: 'Backend Engineer (Search & Ranking)',
    department: 'Engineering',
    location: 'Remote (Americas / Europe)',
    type: 'Full-time',
    remote: true,
    level: 'Senior',
    description: 'Own the search and ranking systems that power product discovery on LaudStack. You\'ll design and improve the algorithms that determine which products surface first — balancing community signals (lauds, reviews), editorial curation, and relevance scoring.',
    responsibilities: [
      'Design, build, and optimise search and ranking algorithms',
      'Implement and tune relevance scoring models',
      'Build data pipelines for ranking signal aggregation',
      'Monitor search quality metrics and iterate on improvements',
      'Collaborate with product on discovery and recommendation features',
    ],
    requirements: [
      '4+ years of backend engineering experience',
      'Experience building or improving search and ranking systems',
      'Strong SQL and data modelling skills',
      'Familiarity with search infrastructure (Elasticsearch, Typesense, or similar)',
      'Experience with data pipelines and ETL processes',
    ],
    niceToHave: [
      'Experience with recommendation systems or ML-based ranking',
      'Background in marketplace or e-commerce search',
      'Knowledge of information retrieval theory',
    ],
    posted: '3 weeks ago',
  },
  {
    id: 6,
    title: 'Trust & Quality Analyst',
    department: 'Operations',
    location: 'Remote (Global)',
    type: 'Part-time',
    remote: true,
    level: 'Junior',
    description: 'Help maintain the integrity of the LaudStack review and voting ecosystem. You\'ll review flagged submissions, investigate suspicious activity, verify product listings, and work with the Trust team to refine our verification policies and fraud detection systems.',
    responsibilities: [
      'Review flagged reviews, products, and community reports',
      'Investigate suspicious voting and review patterns',
      'Verify new product submissions against quality standards',
      'Document and improve trust & safety processes',
      'Escalate complex cases to senior team members',
    ],
    requirements: [
      '1+ years of experience in trust & safety, content moderation, or quality assurance',
      'Strong attention to detail and analytical thinking',
      'Comfortable working with data and internal tooling',
      'Excellent written communication for documenting findings',
      'Ability to make fair, consistent judgement calls',
    ],
    niceToHave: [
      'Interest in SaaS and AI products',
      'Experience with fraud detection or anti-abuse systems',
      'Background in customer support or operations',
    ],
    posted: '1 month ago',
  },
];

const PERKS = [
  { icon: <Globe className="w-5 h-5 text-amber-500" />, title: 'Fully Remote', desc: 'Work from anywhere in the world. We\'re async-first and trust you to manage your time.' },
  { icon: <Laptop className="w-5 h-5 text-amber-500" />, title: '$2,000 Home Office', desc: 'Set up your ideal workspace. Spend it on whatever makes you most productive.' },
  { icon: <Heart className="w-5 h-5 text-amber-500" />, title: 'Health & Wellness', desc: 'Comprehensive health coverage plus a monthly wellness stipend for gym, therapy, or whatever keeps you well.' },
  { icon: <TrendingUp className="w-5 h-5 text-amber-500" />, title: '$1,500 Learning Budget', desc: 'Annual budget for courses, books, conferences, or anything that makes you better at your craft.' },
  { icon: <Coffee className="w-5 h-5 text-amber-500" />, title: 'Team Retreats', desc: 'Two in-person team retreats per year. We work remotely but we value real human connection.' },
  { icon: <Award className="w-5 h-5 text-amber-500" />, title: 'Equity', desc: 'Every full-time team member gets meaningful equity. We\'re building this together.' },
  { icon: <Clock className="w-5 h-5 text-amber-500" />, title: 'Flexible Hours', desc: 'No fixed hours. We care about output, not when you\'re online. Take the time you need.' },
  { icon: <Zap className="w-5 h-5 text-amber-500" />, title: 'Tool Allowance', desc: '$500/year for any SaaS subscriptions you need, plus full access to every product on LaudStack.' },
];

const VALUES = [
  { icon: <Shield className="w-5 h-5 text-amber-500" />, title: 'Integrity over optics', desc: 'We say what we mean, do what we say, and own our mistakes. No politics, no spin.' },
  { icon: <Users className="w-5 h-5 text-amber-500" />, title: 'Community is the product', desc: 'The people who use LaudStack are not just users — they\'re co-creators. We build with them, not for them.' },
  { icon: <Star className="w-5 h-5 text-amber-500" />, title: 'Craft matters', desc: 'We care deeply about quality — in our code, our copy, our design, and our community. Good enough is never enough.' },
  { icon: <Zap className="w-5 h-5 text-amber-500" />, title: 'Bias toward action', desc: 'We move fast, ship often, and learn from real usage. A shipped imperfect feature beats a perfect one that never launches.' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Apply', desc: 'Send your CV and a short note on why you\'re interested. No cover letter required — just be yourself.' },
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

  const LEVEL_CLASSES: Record<string, string> = {
    Junior:  'text-emerald-700 bg-emerald-50 border border-emerald-200',
    Mid:     'text-blue-700 bg-blue-50 border border-blue-200',
    Senior:  'text-violet-700 bg-violet-50 border border-violet-200',
    Lead:    'text-amber-700 bg-amber-50 border border-amber-200',
  };
  const TYPE_CLASSES: Record<string, string> = {
    'Full-time':  'text-slate-700 bg-slate-100 border border-slate-200',
    'Part-time':  'text-slate-600 bg-slate-50 border border-slate-200',
    'Contract':   'text-slate-500 bg-slate-50 border border-slate-200',
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">

        {/* Hero */}
        <PageHero
          breadcrumbs={[{ label: 'Careers' }]}
          eyebrow="Careers at LaudStack"
          title="Help us build the future of software discovery."
          subtitle="We're a small, fully remote team on a mission to make software discovery honest, community-driven, and founder-friendly. If that resonates with you, we'd love to talk."
          accent="amber"
          layout="centered"
          size="md"
        />

        {/* ── Why LaudStack ── */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
                  <Rocket className="w-4 h-4" />
                  Why LaudStack
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-tight">
                  We&apos;re building something that matters.
                </h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  The SaaS and AI landscape is exploding — thousands of products launch every month. But the way people discover and evaluate software is broken. Rankings are pay-to-play. Reviews are unverified. And great indie products get buried under enterprise marketing budgets.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  LaudStack is changing that. We&apos;re building the platform where community votes, verified reviews, and editorial curation — not ad spend — determine what rises to the top. Every person on our team has a direct, visible impact on how millions of professionals choose their tools.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-5 uppercase tracking-wider">What you&apos;ll be part of</h4>
                <div className="space-y-4">
                  {[
                    'A platform used by founders, engineers, and product teams worldwide',
                    'A transparent ranking system where merit beats marketing budget',
                    'Community-driven product launches, voting, and reviews',
                    'A deals marketplace that helps builders save on the tools they need',
                    'A small team where every person\'s work is visible and valued',
                    'A company that prioritises craft, honesty, and long-term thinking',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16 sm:space-y-20">

          {/* Company values */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-2">
              <Heart className="w-4 h-4" />
              How We Work
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Our values, not just words on a wall.</h2>
            <p className="text-slate-600 text-sm mb-8 max-w-2xl">
              These aren&apos;t aspirational posters — they&apos;re the actual principles that guide how we make decisions, hire people, and build the product.
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {VALUES.map(v => (
                <div key={v.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex gap-4 hover:border-amber-300/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    {v.icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 mb-1">{v.title}</div>
                    <div className="text-slate-600 text-sm leading-relaxed">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Perks */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-2">
              <Award className="w-4 h-4" />
              Perks &amp; Benefits
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">We take care of our team.</h2>
            <p className="text-slate-600 text-sm mb-8 max-w-2xl">
              Beyond competitive salaries, here&apos;s what working at LaudStack looks like day-to-day.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {PERKS.map(perk => (
                <div key={perk.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-amber-300/40 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-3">
                    {perk.icon}
                  </div>
                  <div className="font-bold text-slate-900 text-sm mb-1">{perk.title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{perk.desc}</div>
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
                <p className="text-slate-600 text-sm">All roles are fully remote unless otherwise noted.</p>
              </div>
            </div>

            {/* Department filter */}
            <div className="flex gap-2 flex-wrap mb-6">
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  onClick={() => { setActiveDept(dept); setExpandedJob(null); }}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                    activeDept === dept
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-slate-700'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Job cards */}
            <div className="space-y-3">
              {filteredJobs.map(job => {
                const isExpanded = expandedJob === job.id;
                const levelCls = LEVEL_CLASSES[job.level] ?? 'text-slate-600 bg-slate-100';
                const typeCls = TYPE_CLASSES[job.type] ?? 'text-slate-600 bg-slate-100';
                const deptIcon = DEPT_ICONS[job.department] ?? <Briefcase className="w-4.5 h-4.5 text-amber-500" />;
                return (
                  <div
                    key={job.id}
                    className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                      isExpanded ? 'border-amber-300 shadow-md' : 'border-slate-200 hover:border-amber-200'
                    }`}
                  >
                    {/* Card header */}
                    <button
                      className="w-full text-left px-4 sm:px-6 py-5 flex items-start gap-4 cursor-pointer"
                      onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {deptIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-black text-slate-900 text-base">{job.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${levelCls}`}>
                            {job.level}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeCls}`}>
                            {job.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Posted {job.posted}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-300 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-6 border-t border-slate-100 pt-5">
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">{job.description}</p>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          {/* Responsibilities */}
                          <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">What you&apos;ll do</div>
                            <ul className="space-y-2">
                              {job.responsibilities.map(item => (
                                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-1" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Requirements */}
                          <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">What we&apos;re looking for</div>
                            <ul className="space-y-2">
                              {job.requirements.map(req => (
                                <li key={req} className="flex items-start gap-2 text-sm text-slate-600">
                                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-1" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Nice to have */}
                        {job.niceToHave.length > 0 && (
                          <div className="mb-6">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Nice to have</div>
                            <div className="flex flex-wrap gap-2">
                              {job.niceToHave.map(item => (
                                <span key={item} className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => toast.info(`Applications for "${job.title}" will open soon. Stay tuned!`)}
                          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
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
              <div className="text-center py-12 text-slate-500">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No open roles in {activeDept} right now.</p>
                <button
                  onClick={() => setActiveDept('All')}
                  className="mt-2 text-amber-500 hover:text-amber-400 text-sm font-semibold transition-colors cursor-pointer"
                >
                  View all departments
                </button>
              </div>
            )}
          </section>

          {/* Application process */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-2">
              <Target className="w-4 h-4" />
              Application Process
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">What to expect.</h2>
            <p className="text-slate-600 text-sm mb-8 max-w-2xl">
              We keep our hiring process short, respectful, and transparent. From first application to offer, most roles take 2–3 weeks. We pay for take-home tasks and never ask trick questions.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
              {PROCESS_STEPS.map((step, idx) => (
                <div key={step.step} className="relative">
                  {idx < PROCESS_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[calc(100%-8px)] w-full h-px bg-amber-200 z-0" />
                  )}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative z-10 h-full">
                    <div className="text-2xl font-black text-amber-500 mb-2">{step.step}</div>
                    <div className="font-bold text-slate-900 text-sm mb-1">{step.title}</div>
                    <div className="text-slate-500 text-xs leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Speculative application CTA */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 sm:p-10 text-center">
            <Mail className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 mb-2">Don&apos;t see the right role?</h3>
            <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
              We&apos;re always interested in meeting exceptional people. Send us a note about who you are and what you&apos;d love to work on — we read every message.
            </p>
            <a
              href="mailto:careers@laudstack.com"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-colors no-underline"
            >
              <Mail className="w-4 h-4" />
              careers@laudstack.com
            </a>
            <p className="text-slate-500 text-xs mt-4">We aim to respond to all speculative applications within 5 business days.</p>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
