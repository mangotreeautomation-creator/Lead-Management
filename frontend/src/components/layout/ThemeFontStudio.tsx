'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTION_THEMES, PRODUCTION_FONTS, ColorThemeOption, TypographyFontOption } from '../../data/themeConfig';
import { Palette, Type, Check, ChevronDown, X, Sparkles } from 'lucide-react';

export const ThemeFontStudio: React.FC = () => {
  const { activeThemeId, setActiveThemeId, activeFontId, setActiveFontId } = useApp();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isFontOpen, setIsFontOpen] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const fontRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
      if (fontRef.current && !fontRef.current.contains(e.target as Node)) {
        setIsFontOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentTheme = PRODUCTION_THEMES.find(t => t.id === activeThemeId) || PRODUCTION_THEMES[0];
  const currentFont = PRODUCTION_FONTS.find(f => f.id === activeFontId) || PRODUCTION_FONTS[0];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* 1. COLOR THEME PALETTE PICKER BUTTON & FLYOUT */}
      <div className="relative" ref={themeRef}>
        <button
          onClick={() => {
            setIsThemeOpen(prev => !prev);
            setIsFontOpen(false);
          }}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-all ${
            isThemeOpen
              ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
          }`}
          title="Select from 10 Production Color Themes"
        >
          {/* Swatch preview dots */}
          <div className="flex items-center -space-x-1 shrink-0">
            <span
              className="h-3 w-3 rounded-full border border-black/40 shadow-sm"
              style={{ backgroundColor: currentTheme.bg }}
            />
            <span
              className="h-3 w-3 rounded-full border border-black/40 shadow-sm"
              style={{ backgroundColor: currentTheme.card }}
            />
            <span
              className="h-3 w-3 rounded-full border border-black/40 shadow-sm ring-1 ring-white/30"
              style={{ backgroundColor: currentTheme.accent }}
            />
          </div>

          <Palette className="h-3.5 w-3.5 text-zinc-400 hidden xs:block" />

          <span className="hidden sm:inline font-semibold text-[11px] max-w-[85px] truncate">
            {currentTheme.name.split(' ')[0]}
          </span>

          <span className="rounded bg-zinc-800 px-1 py-0.2 text-[9px] font-mono text-zinc-400 hidden md:inline">
            {PRODUCTION_THEMES.length}
          </span>

          <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform ${isThemeOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* THEME SELECTOR POPOVER */}
        {isThemeOpen && (
          <div className="absolute right-0 mt-2 w-[340px] sm:w-[460px] md:w-[540px] max-h-[85vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-[#0d0f17]/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    Theme Color Studio
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                      {PRODUCTION_THEMES.length} Live Palettes
                    </span>
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Production calibrated for Vedic Astrological, Fintech & OLED operations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsThemeOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRODUCTION_THEMES.map(theme => {
                const isActive = theme.id === activeThemeId;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setActiveThemeId(theme.id);
                    }}
                    className={`group relative flex flex-col justify-between rounded-xl p-3 text-left transition-all border ${
                      isActive
                        ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/50'
                        : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    {/* Top Row: Color Swatches & Status */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {/* 3-color palette pill */}
                        <div className="flex items-center rounded-full p-0.5 border border-zinc-700 bg-zinc-950/80 shadow-inner">
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: theme.bg }}
                            title={`Background: ${theme.bg}`}
                          />
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/40 -ml-1 shadow-sm"
                            style={{ backgroundColor: theme.card }}
                            title={`Surface: ${theme.card}`}
                          />
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/40 -ml-1 shadow-sm ring-1 ring-white/20"
                            style={{ backgroundColor: theme.accent }}
                            title={`Accent: ${theme.accent}`}
                          />
                        </div>

                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {theme.category}
                        </span>
                      </div>

                      {isActive ? (
                        <div className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                          <Check className="h-3 w-3" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[9px] font-mono text-zinc-500">
                          {theme.badge}
                        </span>
                      )}
                    </div>

                    {/* Middle: Theme Name */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                          {theme.name}
                        </span>
                        {theme.isLight && (
                          <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[8px] font-bold text-amber-300">
                            LIGHT
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight">
                        {theme.subtitle}
                      </p>
                    </div>

                    {/* Bottom: Accent Preview Bar */}
                    <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-zinc-800/60">
                      <div
                        className="h-1.5 w-full rounded-full transition-all"
                        style={{
                          background: `linear-gradient(90deg, ${theme.bg} 0%, ${theme.card} 40%, ${theme.accent} 100%)`
                        }}
                      />
                      <span
                        className="h-2 w-2 rounded-full shrink-0 animate-pulse"
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="mt-3.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-400" />
                Live dynamic re-render across all dashboard cards & tables
              </span>
              <span className="font-mono text-zinc-500">CSS [data-theme]</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. TYPOGRAPHY FONT PICKER BUTTON & FLYOUT */}
      <div className="relative" ref={fontRef}>
        <button
          onClick={() => {
            setIsFontOpen(prev => !prev);
            setIsThemeOpen(false);
          }}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2 sm:px-2.5 py-1.5 text-xs font-medium transition-all ${
            isFontOpen
              ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
          }`}
          title="Select from 10 Production Typography Fonts"
        >
          <Type className="h-3.5 w-3.5 text-indigo-400" />

          <span
            className="hidden sm:inline font-semibold text-[11px] max-w-[85px] truncate"
            style={{ fontFamily: currentFont.fontFamily }}
          >
            {currentFont.name}
          </span>

          <span className="rounded bg-zinc-800 px-1 py-0.2 text-[9px] font-mono text-indigo-300 hidden md:inline">
            Font
          </span>

          <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform ${isFontOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* FONT SELECTOR POPOVER (10 PRODUCTION FONTS) */}
        {isFontOpen && (
          <div className="absolute right-0 mt-2 w-[340px] sm:w-[480px] md:w-[580px] max-h-[85vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-[#0d0f17]/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Type className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    Typography Engine Studio
                    <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-bold text-indigo-300 uppercase tracking-widest">
                      10 Live Fonts
                    </span>
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    High-legibility enterprise typography with real-time UI application
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFontOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Fonts List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRODUCTION_FONTS.map(font => {
                const isActive = font.id === activeFontId;
                return (
                  <button
                    key={font.id}
                    onClick={() => {
                      setActiveFontId(font.id);
                    }}
                    className={`group relative flex flex-col justify-between rounded-xl p-3 text-left transition-all border ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50'
                        : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    {/* Top: Name & Active Indicator */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors"
                          style={{ fontFamily: font.fontFamily }}
                        >
                          {font.name}
                        </span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[8px] font-mono text-zinc-400">
                          {font.category}
                        </span>
                      </div>

                      {isActive ? (
                        <div className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                          <Check className="h-3 w-3" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-mono text-zinc-500">
                          {font.weightSupport.split(',').length} weights
                        </span>
                      )}
                    </div>

                    {/* Specimen Live Preview */}
                    <div
                      className="my-1.5 rounded-lg bg-zinc-950/70 p-2 border border-zinc-800/60 transition-colors group-hover:border-zinc-700"
                      style={{ fontFamily: font.fontFamily }}
                    >
                      <p className="text-[11px] font-semibold text-zinc-200 truncate">
                        {font.previewText}
                      </p>
                      <p className="text-[9px] text-zinc-400 mt-0.5 font-normal truncate">
                        ₹3,80,746 Gross • 4,592 Leads • 2.14% CTR
                      </p>
                    </div>

                    {/* Bottom: Description */}
                    <p className="text-[9px] text-zinc-400 leading-tight">
                      {font.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="mt-3.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                Instantly changes typography for all headers, tables, numbers & text
              </span>
              <span className="font-mono text-zinc-500">CSS [data-font]</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
