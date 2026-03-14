"use client";

// LaudStack — Events Page
// Upcoming events grid, past events archive, and event registration CTAs

import {
  Calendar, MapPin, Clock, Users, ArrowRight, Video,
  Mic, Globe, Star, CheckCircle, Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { toast } from 'sonner';

type EventType = 'webinar' | 'virtual' | 'in-person' | 'workshop';

interface Event {
  id: number;
  type: EventType;
  title: string;
  date: string;
  time: string;
  pathname: string;
  host: string;
  attendees: number;
  description: string;
  tags: string[];
  featured: boolean;
  registrationOpen: boolean;
}

const UPCOMING_EVENTS: Event[] = [
  {
    id: 1,
    type: 'webinar',
    title: 'State of AI Tools 2025: What\'s Actually Worth Your Budget',
    date: 'March 25, 2025',
    time: '11:00 AM EST',
    pathname: 'Online — Zoom',
    host: 'LaudStack Editorial Team',
    attendees: 847,
    description: 'Join our editorial team for a live breakdown of the top-performing AI tools of Q1 2025. We\'ll cover what\'s trending, what\'s overhyped, and where the real ROI is.',
    tags: ['AI Tools', 'Trends', 'Free'],
    featured: true,
    registrationOpen: true,
  },
  {
    id: 2,
    type: 'workshop',
    title: 'LaunchPad Workshop: How to Get Your Tool Discovered',
    date: 'April 3, 2025',
    time: '2:00 PM EST',
    pathname: 'Online — Zoom',
    host: 'Marcus Chen, Head of Community',
    attendees: 312,
    description: 'A hands-on workshop for founders on how to optimise your LaudStack listing, collect verified reviews, and climb the rankings. Bring your tool — we\'ll give live feedback.',
    tags: ['Founders', 'LaunchPad', 'Free'],
    featured: false,
    registrationOpen: true,
  },
  {
    id: 3,
    type: 'virtual',
    title: 'SaaS Buyer Panel: How 5 PMs Evaluate Tools in 2025',
    date: 'April 17, 2025',
    time: '12:00 PM EST',
    pathname: 'Online — YouTube Live',
    host: 'LaudStack Community',
    attendees: 1240,
    description: 'Five senior product managers share their real evaluation frameworks — what they look for, what they ignore, and how platforms like LaudStack fit into their process.',
    tags: ['Buyers', 'Panel', 'Free'],
    featured: false,
    registrationOpen: true,
  },
  {
    id: 4,
    type: 'in-person',
    title: 'LaudStack Founders Meetup — San Francisco',
    date: 'May 8, 2025',
    time: '6:30 PM PST',
    pathname: 'San Francisco, CA',
    host: 'LaudStack Team',
    attendees: 95,
    description: 'An intimate in-person gathering for founders who\'ve launched on LaudStack. Share learnings, build connections, and get early access to upcoming platform features.',
    tags: ['Founders', 'Networking', 'In-Person'],
    featured: false,
    registrationOpen: true,
  },
];

const PAST_EVENTS = [
  {
    title: 'AI Tool Trends: Q4 2024 Roundup',
    date: 'December 12, 2024',
    type: 'webinar' as EventType,
    attendees: 1850,
    recording: true,
  },
  {
    title: 'How to Write Reviews That Actually Help Buyers',
    date: 'November 20, 2024',
    type: 'workshop' as EventType,
    attendees: 420,
    recording: true,
  },
  {
    title: 'LaunchPad Office Hours — October Edition',
    date: 'October 15, 2024',
    type: 'virtual' as EventType,
    attendees: 280,
    recording: false,
  },
  {
    title: 'LaudStack Community Kickoff',
    date: 'September 5, 2024',
    type: 'virtual' as EventType,
    attendees: 3200,
    recording: true,
  },
];

const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  webinar:    { label: 'Webinar',    color: '#2563EB', bg: '#EFF6FF', icon: <Video className="w-3.5 h-3.5" /> },
  virtual:    { label: 'Virtual',    color: '#7C3AED', bg: '#F5F3FF', icon: <Globe className="w-3.5 h-3.5" /> },
  'in-person':{ label: 'In-Person',  color: '#059669', bg: '#ECFDF5', icon: <MapPin className="w-3.5 h-3.5" /> },
  workshop:   { label: 'Workshop',   color: '#D97706', bg: '#FFFBEB', icon: <Mic className="w-3.5 h-3.5" /> },
};

export default function Events() {
  const handleRegister = (title: string) => {
    toast.success(`Registered for "${title}"! Check your email for confirmation.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
          eyebrow="Events & Webinars"
          title="Learn, connect, and stay ahead."
          subtitle="Free webinars, founder workshops, and community events — hosted by the LaudStack team and community. Join live or watch the recordings."
          accent="amber"
          layout="centered"
          size="lg"
        />

        <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">

          {/* Featured event */}
          {UPCOMING_EVENTS.filter(e => e.featured).map(event => {
            const cfg = EVENT_TYPE_CONFIG[event.type];
            return (
              <section key={event.id}>
                <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" />
                  Featured Event
                </div>
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-8 shadow-sm shadow-amber-100">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                      <Star className="w-3 h-3" />
                      Featured
                    </span>
                    {event.tags.map(tag => (
                      <span key={tag} className="text-xs text-slate-400 bg-gray-100 px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-3">{event.title}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{event.description}</p>
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      {event.attendees.toLocaleString()} registered
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      onClick={() => handleRegister(event.title)}
                      className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-2.5 rounded-xl transition-colors"
                    >
                      Register Free
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-400">Hosted by {event.host}</span>
                  </div>
                </div>
              </section>
            );
          })}

          {/* Upcoming events grid */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-6">
              <Calendar className="w-4 h-4" />
              Upcoming Events
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {UPCOMING_EVENTS.filter(e => !e.featured).map(event => {
                const cfg = EVENT_TYPE_CONFIG[event.type];
                return (
                  <div key={event.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-amber-300 transition-colors flex flex-col">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      {event.tags.map(tag => (
                        <span key={tag} className="text-xs text-slate-400 bg-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <h3 className="font-black text-slate-900 text-base mb-2 leading-snug">{event.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">{event.description}</p>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {event.date} · {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {event.pathname}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        {event.attendees.toLocaleString()} registered
                      </div>
                    </div>
                    <button
                      onClick={() => handleRegister(event.title)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-amber-400 hover:text-slate-900 text-slate-700 font-bold text-sm py-2.5 rounded-xl transition-colors"
                    >
                      Register Free
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Past events */}
          <section>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              Past Events
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {PAST_EVENTS.map((event, idx) => {
                const cfg = EVENT_TYPE_CONFIG[event.type];
                return (
                  <div
                    key={event.title}
                    className={`flex items-center gap-4 px-6 py-4 ${idx < PAST_EVENTS.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ color: cfg.color, background: cfg.bg }}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 text-sm">{event.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{event.date} · {event.attendees.toLocaleString()} attendees</div>
                    </div>
                    {event.recording ? (
                      <button
                        onClick={() => toast.info('Recording coming soon!')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors flex-shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Watch Recording
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300 flex-shrink-0">No recording</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Host an event CTA */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <Mic className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 mb-2">Want to host an event with LaudStack?</h3>
            <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">
              We partner with founders, communities, and industry experts to co-host webinars and workshops. Reach our audience of 12,000+ professionals.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </a>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
