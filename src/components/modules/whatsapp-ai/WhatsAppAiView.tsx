'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { MetricCard } from '../../ui/MetricCard';
import { formatNumber } from '../../../utils/formatters';
import {
  Bot,
  MessageSquare,
  Sparkles,
  User,
  ArrowRight,
  Send,
  CheckCircle2,
  PhoneCall,
  Flame,
  Clock
} from 'lucide-react';

export const WhatsAppAiView: React.FC = () => {
  const { db, setSelectedLeadId } = useApp();

  // Simulated active conversations
  const sampleConversations = [
    {
      id: 'chat_01',
      customerName: 'Priya Sharma',
      phone: '+91 98112 34567',
      vertical: 'Palmistry Reports',
      leadId: 'lead_002',
      intent: 'PAYMENT_ASSISTANCE',
      status: 'RESOLVED_CONVERTED',
      messages: [
        { sender: 'user', text: 'Hi, I was trying to pay ₹999 for the palmistry report but my UPI timed out. Is the link still valid?', time: '10:14 AM' },
        { sender: 'bot', text: 'Namaste Priya ji! Yes, your Kundali & Palmistry session order is reserved. Here is your instant 1-click Razorpay recovery link with 10% special discount applied: https://mangotreetechnology.com/pay/rec_8912', time: '10:15 AM' },
        { sender: 'user', text: 'Great, done! It says captured. When will the PDF be ready?', time: '10:17 AM' },
        { sender: 'bot', text: 'Payment of ₹999 captured successfully! Your automated Astro-Vastu analysis is now generating and will arrive on WhatsApp in 2 minutes.', time: '10:17 AM' }
      ]
    },
    {
      id: 'chat_02',
      customerName: 'Vikram Mehta',
      phone: '+91 99200 45890',
      vertical: 'Vastu Consultancy',
      leadId: 'lead_008',
      intent: 'SCHEDULE_CONSULT',
      status: 'HANDOFF_TO_HUMAN',
      messages: [
        { sender: 'user', text: 'I need an urgent physical on-site audit for a 4BHK duplex in South Delhi. What are the consultation charges?', time: '11:02 AM' },
        { sender: 'bot', text: 'Namaste Vikram ji! On-site residential evaluations by our senior acharya start from ₹21,000 including full magnetic energy mapping. Shall I connect you with our lead consultant directly?', time: '11:03 AM' },
        { sender: 'user', text: 'Yes please connect me right away.', time: '11:04 AM' },
        { sender: 'bot', text: 'Routing conversation to Senior Acharya Manish. A human specialist is joining this chat now.', time: '11:04 AM' }
      ]
    },
    {
      id: 'chat_03',
      customerName: 'Amit Saxena',
      phone: '+91 98450 12345',
      vertical: 'Vastu Webinar',
      leadId: 'lead_015',
      intent: 'GENERAL_INQUIRY',
      status: 'BOT_ENGAGED',
      messages: [
        { sender: 'user', text: 'Will a recording of the Sunday live masterclass be provided if I miss the first 30 minutes?', time: '11:30 AM' },
        { sender: 'bot', text: 'Yes Amit ji! All registered attendees receive lifetime access to the full HD recording, workbook PDF, and energy remedies cheatsheet within 24 hours of webinar completion.', time: '11:31 AM' }
      ]
    }
  ];

  const [activeChat, setActiveChat] = useState(sampleConversations[0]);
  const [replyText, setReplyText] = useState('');

  const handleSendTestReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setActiveChat(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        { sender: 'bot', text: replyText, time: 'Just now' }
      ]
    }));
    setReplyText('');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              WhatsApp Conversational AI Bot Agent
            </h1>
            <Badge variant="primary" size="sm">
              MULTI-TURN LLM AGENT
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Autonomous conversational agent engaging leads 24/7 across all accounts, handling payment links, objections, and consultations.
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Active Bot Sessions"
          value="184"
          trend={{ value: 18.2, isPositive: true }}
          icon={<Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          subtitle="Currently conversing"
        />
        <MetricCard
          title="Automated Resolution Rate"
          value="87.4%"
          trend={{ value: 5.1, isPositive: true }}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          subtitle="Resolved without human"
        />
        <MetricCard
          title="Payment Link Recoveries"
          value="54"
          trend={{ value: 24.0, isPositive: true }}
          icon={<Sparkles className="h-5 w-5 text-amber-500" />}
          subtitle="Paid directly in chat"
        />
        <MetricCard
          title="Human Handoffs"
          value="23"
          icon={<PhoneCall className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
          subtitle="Routed to sales team"
        />
      </div>

      {/* Interactive Two-Column Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chat Sessions List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Recent Live Conversations
            </h3>
            <span className="text-[11px] text-slate-400">Click to inspect multi-turn dialogue</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sampleConversations.map(chat => {
              const isSelected = activeChat.id === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-brand-50/70 border-l-4 border-brand-600 dark:bg-brand-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {chat.customerName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {chat.messages[chat.messages.length - 1].time}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 truncate">
                    {chat.messages[chat.messages.length - 1].text}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {chat.vertical}
                    </span>
                    <Badge
                      variant={
                        chat.status === 'RESOLVED_CONVERTED'
                          ? 'success'
                          : chat.status === 'HANDOFF_TO_HUMAN'
                          ? 'warning'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {chat.intent}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat Multi-turn Inspector */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[520px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-sm">
                {(activeChat.customerName || 'U').charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {activeChat.customerName}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeChat.phone} • {activeChat.vertical}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedLeadId(activeChat.leadId)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <span>Lead Journey</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
            {activeChat.messages.map((m, idx) => {
              const isBot = m.sender === 'bot';
              return (
                <div key={idx} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-md rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      isBot
                        ? 'bg-white border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-tl-sm'
                        : 'bg-brand-600 text-white rounded-tr-sm'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {isBot ? (
                        <>
                          <Bot className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                          <span className="font-bold text-[10px] text-brand-600 dark:text-brand-400 uppercase">
                            AI WhatsApp Bot
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="h-3.5 w-3.5 text-white/80" />
                          <span className="font-bold text-[10px] text-white/80 uppercase">
                            Customer
                          </span>
                        </>
                      )}
                      <span className="text-[10px] opacity-60 ml-auto">{m.time}</span>
                    </div>
                    <p>{m.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Test Reply Input */}
          <form onSubmit={handleSendTestReply} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Test reply as AI Bot agent..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <Button size="sm" type="submit" variant="primary">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
