"use client";
export const dynamic = "force-dynamic";

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

const UPCOMING_EVENTS: Event[] = [];

const PAST_EVENTS: { title: string; date: string; type: EventType; attendees: number; recording: boolean }[] = [];

const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  webinar:    { label: 'Webinar',    color: '#5178FF', bg: '#ECF2FF', icon: <Video className="w-3.5 h-3.5" /> },
  virtual:    { label: 'Virtual',    color: '#5178FF', bg: '#F5F8FF', icon: <Globe className="w-3.5 h-3.5" /> },
  'in-person':{ label: 'In-Person',  color: '#16A34A', bg: '#F0FDF4', icon: <MapPin className="w-3.5 h-3.5" /> },
  workshop:   { label: 'Workshop',   color: '#D97706', bg: '#FFFBEB', icon: <Mic className="w-3.5 h-3.5" /> },
};

export default function Events() {
  const handleRegister = (title: string) => {
    toast.info(`Registration for "${title}" will open soon. Stay tuned!`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHero
        breadcrumbs={[{ label: 'Events' }]}
          eyebrow="Events & Webinars"
          title="Learn, connect, and stay ahead."
          subtitle="Webinars, workshops, and community events. Join live or watch later."
          accent="amber"
          layout="centered"
          size="md"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-10 sm:space-y-16">

          {/* Featured event */}
          {UPCOMING_EVENTS.filter(e => e.featured).map(event => {
            const cfg = EVENT_TYPE_CONFIG[event.type];
            return (
              <section key={event.id}>
                <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" />
                  Featured Event
                </div>
                <div className="bg-slate-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-8 shadow-sm shadow-amber-100">
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
                      <span key={tag} className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">{event.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">{event.description}</p>
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
                    <span className="text-xs text-slate-500">Hosted by {event.host}</span>
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
              {UPCOMING_EVENTS.length === 0 && (
                <div className="col-span-full bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">No upcoming events yet. Check back soon!</p>
                </div>
              )}
              {UPCOMING_EVENTS.filter(e => !e.featured).map(event => {
                const cfg = EVENT_TYPE_CONFIG[event.type];
                return (
                  <div key={event.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 hover:border-amber-300 transition-colors flex flex-col">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      {event.tags.map(tag => (
                        <span key={tag} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <h3 className="font-black text-slate-900 text-base mb-2 leading-snug">{event.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">{event.description}</p>
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
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-amber-400 hover:text-slate-900 text-slate-700 font-bold text-sm py-2.5 rounded-xl transition-colors"
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
            <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
              {PAST_EVENTS.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-600">No past events to display.</p>
                </div>
              )}
              {PAST_EVENTS.map((event, idx) => {
                const cfg = EVENT_TYPE_CONFIG[event.type];
                return (
                  <div
                    key={event.title}
                    className={`flex items-center gap-4 px-4 sm:px-6 py-4 ${idx < PAST_EVENTS.length - 1 ? 'border-b border-slate-200' : ''}`}
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
                      <div className="text-xs text-slate-500 mt-0.5">{event.date} · {event.attendees.toLocaleString()} attendees</div>
                    </div>
                    {event.recording ? (
                      <button
                        onClick={() => toast.info('Recording will be available soon.')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors flex-shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Watch Recording
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 flex-shrink-0">No recording</span>
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
            <p className="text-slate-600 text-sm mb-5 max-w-md mx-auto">
              We partner with founders, communities, and industry experts to co-host webinars and workshops. Reach our growing audience of professionals.
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
