// LaudStack — About Page
// Design: Editorial dark, amber accents, mission-driven storytelling

import { Link } from 'wouter';
import {
  Shield, Star, Users, Zap, Globe, Heart, ArrowRight,
  CheckCircle, TrendingUp, Award, BookOpen, Lightbulb
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TEAM = [
  { name: 'Alex Rivera', role: 'Co-founder & CEO', bio: 'Former product lead at a Series B SaaS company. Built LaudStack to solve the tool discovery problem he faced every week.', initials: 'AR' },
  { name: 'Priya Nair', role: 'Co-founder & CTO', bio: 'Ex-engineer at a top AI lab. Obsessed with building systems that surface signal from noise in a world full of AI hype.', initials: 'PN' },
  { name: 'Marcus Chen', role: 'Head of Community', bio: 'Built and grew two SaaS communities from 0 to 50k members. Believes the best software discovery happens peer-to-peer.', initials: 'MC' },
  { name: 'Sofia Andersen', role: 'Head of Trust & Quality', bio: 'Former analyst at a research firm. Designed the LaudStack Trust Framework to ensure every review on the platform is genuine.', initials: 'SA' },
];

const VALUES = [
  {
    icon: <Shield className="w-6 h-6 text-amber-400" />,
    title: 'Radical Transparency',
    description: 'Every rating, review, and ranking on LaudStack is earned — never bought. We publish our ranking algorithm openly so founders and users can trust the results.',
  },
  {
    icon: <Users className="w-6 h-6 text-amber-400" />,
    title: 'Community First',
    description: 'LaudStack is built for the people who use tools every day, not for the companies that sell them. Our community of practitioners is our most important asset.',
  },
  {
    icon: <Star className="w-6 h-6 text-amber-400" />,
    title: 'Quality Over Quantity',
    description: 'We manually review every tool before it goes live. We\'d rather have 500 well-vetted tools than 50,000 unverified listings.',
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-amber-400" />,
    title: 'Founder Empathy',
    description: 'We\'ve built products ourselves. We know how hard it is to get discovered. LaudStack gives indie founders and bootstrapped teams a fair shot at visibility.',
  },
];

const STATS = [
  { value: '100+', label: 'Verified Tools', icon: <CheckCircle className="w-5 h-5 text-amber-400" /> },
  { value: '15', label: 'Categories', icon: <Globe className="w-5 h-5 text-amber-400" /> },
  { value: '10K+', label: 'Community Members', icon: <Users className="w-5 h-5 text-amber-400" /> },
  { value: '4.7', label: 'Avg Tool Rating', icon: <Star className="w-5 h-5 text-amber-400" /> },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />
      <div className="mt-[72px] flex-1">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-slate-900/50" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 py-20 relative text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Heart className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            We built the platform<br />
            <span className="text-amber-400">we always wanted.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            LaudStack started as a shared Notion doc between two founders who were tired of wasting hours evaluating tools that looked great on landing pages but fell apart in practice.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Our Mission
            </div>
            <h2 className="text-3xl font-black text-white mb-4">
              Helping builders find the right tools — faster.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              The SaaS and AI tool landscape is growing at an unprecedented rate. There are now thousands of tools competing for your attention, your budget, and your workflow. The signal-to-noise ratio is terrible.
            </p>
            <p className="text-slate-400 leading-relaxed">
              LaudStack exists to fix that. We combine verified reviews from real practitioners, a transparent ranking algorithm, and a community of builders who share what actually works — so you can make confident tool decisions in minutes, not days.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="space-y-4">
              {[
                'Every tool is manually reviewed before listing',
                'Reviews are verified against real usage',
                'Rankings are algorithmic, never paid',
                'Founders can respond to reviews publicly',
                'No sponsored placements in search results',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium mb-3">
              <Award className="w-4 h-4" />
              Our Values
            </div>
            <h2 className="text-3xl font-black text-white">What we stand for</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map((value) => (
              <div key={value.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-400/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  {value.icon}
                  <h3 className="text-white font-bold">{value.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium mb-3">
              <Users className="w-4 h-4" />
              The Team
            </div>
            <h2 className="text-3xl font-black text-white">Built by practitioners, for practitioners</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-bold text-sm">{member.initials}</span>
                </div>
                <div>
                  <div className="text-white font-bold">{member.name}</div>
                  <div className="text-amber-400 text-sm mb-2">{member.role}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-10 text-center">
          <TrendingUp className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-white font-black text-2xl mb-3">Join the LaudStack community</h3>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Whether you're a founder looking to get discovered, or a builder looking for the best tools — LaudStack is for you.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/launchpad">
              <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors">
                Submit Your Tool
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/">
              <button className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                Browse Tools
              </button>
            </Link>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
