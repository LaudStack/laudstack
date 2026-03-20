"use client";

// LaudStack — About Page
// Design: Editorial dark, amber accents, mission-driven storytelling

import Link from 'next/link';
import {
  Shield, Star, Users, Globe, ArrowRight,
  CheckCircle, TrendingUp, Award, BookOpen, Lightbulb
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

const TEAM = [
  { name: 'Henry Kabak', role: 'Founder', bio: 'Built LaudStack to create an honest, community-driven platform for discovering and evaluating the best SaaS and AI tools.', initials: 'HK' },
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
    description: 'We manually review every product before it goes live. We prioritize well-vetted, quality listings over sheer volume.',
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-amber-400" />,
    title: 'Founder Empathy',
    description: 'We\'ve built products ourselves. We know how hard it is to get discovered. LaudStack gives indie founders and bootstrapped teams a fair shot at visibility.',
  },
];

const STATS = [
  { value: '42+', label: 'Verified Stacks', icon: <CheckCircle className="w-5 h-5 text-amber-400" /> },
  { value: '20', label: 'Categories', icon: <Globe className="w-5 h-5 text-amber-400" /> },
  { value: 'Free', label: 'To List', icon: <Users className="w-5 h-5 text-amber-400" /> },
  { value: '48h', label: 'Review Time', icon: <Star className="w-5 h-5 text-amber-400" /> },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
      <PageHero
        breadcrumbs={[{ label: 'About' }]}
        eyebrow="Our Story"
        title="We built the platform we always wanted."
        subtitle="How LaudStack became the honest platform for discovering and evaluating SaaS and AI tools."
        accent="amber"
        layout="centered"
        size="md"
      />

      {/* Stats */}
      <div className="border-b border-slate-200 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                <div className="text-slate-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-20">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Our Mission
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
              Helping builders find the right products — faster.
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The SaaS and AI tool landscape is growing at an unprecedented rate. There are now thousands of tools competing for your attention, your budget, and your workflow. The signal-to-noise ratio is terrible.
            </p>
            <p className="text-slate-600 leading-relaxed">
              LaudStack exists to fix that. We combine verified reviews from real practitioners, a transparent ranking algorithm, and a community of builders who share what actually works — so you can make confident tool decisions in minutes, not days.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-8">
            <div className="space-y-4">
              {[
                'Every product is manually reviewed before listing',
                'Reviews are verified against real usage',
                'Rankings are algorithmic, never paid',
                'Founders can respond to reviews publicly',
                'No sponsored placements in search results',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-12 sm:mb-20">
          <div className="text-center mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium mb-3">
              <Award className="w-4 h-4" />
              Our Values
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">What we stand for</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {VALUES.map((value) => (
              <div key={value.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 hover:border-amber-400/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  {value.icon}
                  <h3 className="text-slate-900 font-bold">{value.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-12 sm:mb-20">
          <div className="text-center mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium mb-3">
              <Users className="w-4 h-4" />
              The Team
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Built by practitioners, for practitioners</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-bold text-sm">{member.initials}</span>
                </div>
                <div>
                  <div className="text-slate-900 font-bold">{member.name}</div>
                  <div className="text-amber-400 text-sm mb-2">{member.role}</div>
                  <p className="text-slate-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-10 text-center">
          <TrendingUp className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-slate-900 font-black text-xl sm:text-2xl mb-3">Join the LaudStack community</h3>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            Whether you're a founder looking to get discovered, or a builder looking for the best products — LaudStack is for you.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/launchpad">
              <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors">
                Launch Your Tool
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/">
              <button className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold px-6 py-3 rounded-xl transition-colors">
                Browse Products
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
