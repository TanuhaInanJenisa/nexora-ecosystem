'use client';

import React, { useState } from 'react';
import { Button, useToast } from '@nexora/ui';
import { Mail, MapPin, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({
        type: 'error',
        title: 'Incomplete Submission',
        message: 'Please fill in your name, email, and message.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      toast({
        type: 'success',
        title: 'Inquiry Dispatched',
        message: 'Thank you for reaching out. An engineer will contact you shortly.',
      });
    }, 600);
  };

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          Enterprise Communications
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Get in Touch
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Whether planning a large-scale deployment, requiring compliance audits, or seeking custom integrations, our team is ready.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Direct Email</h3>
            <p className="text-xs text-slate-400">For enterprise inquiries and partnership proposals:</p>
            <div className="text-sm font-mono text-cyan-400 font-semibold">contact@nexora.io</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Live Operations Support</h3>
            <p className="text-xs text-slate-400">24/7 dedicated support for organizations on Enterprise Tier:</p>
            <div className="text-sm font-mono text-emerald-400 font-semibold">support@nexora.io</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Global Headquarters</h3>
            <p className="text-xs text-slate-400">Dhaka Tech District & Remote Worldwide Operations.</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 p-8 sm:p-10 rounded-3xl bg-[#0F172A] border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Send an Enterprise Inquiry</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Hossain"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tanvir@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Monorepo Migration Consultation"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Message & Technical Requirements *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Share project details, timeline expectations, or specific module questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full sm:w-auto"
            >
              Send Message
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
