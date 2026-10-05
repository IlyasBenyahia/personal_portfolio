'use client';

import {
  NextIntlClientProvider,
  useLocale,
  useTranslations,
  type AbstractIntlMessages,
} from 'next-intl';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { ZelligeTile } from '@/components/zellige/geometry';
import type { Pillar, SkillGroup } from '@/content/types';
import { localize } from '@/content/types';
import type { Locale } from '@/i18n/locales';
import { createGame, type GameController } from '@/game/engine';
import { buildLevel } from '@/game/level';
import { readColors } from '@/game/sprites';
import type { GameResult, Item } from '@/game/types';
import { track } from '@/lib/analytics';

type Phase = 'intro' | 'playing' | 'paused' | 'ended';
const BEST_KEY = 'shipit:best';
const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW']);

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value: number) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    /* storage unavailable: the best score lasts for this visit */
  }
}

interface Props {
  tile: ZelligeTile;
  skills: SkillGroup[];
  onClose: () => void;
}

/**
 * The "Ship It!" game in a modal dialog. Loaded on demand (dynamic import),
 * with its own translations so message formatting stays in this chunk.
 */
export default function GameDialogWithMessages({
  messages,
  locale,
  ...props
}: Props & { messages: AbstractIntlMessages; locale: Locale }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <GameDialog {...props} />
    </NextIntlClientProvider>
  );
}

function GameDialog({ tile, skills, onClose }: Props) {
  const t = useTranslations('Game');
  const tPillar = useTranslations('Hero.pillars');
  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameController | null>(null);

  const [phase, setPhase] = useState<Phase>('intro');
  const [calm, setCalm] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [zone, setZone] = useState(0);
  const [best, setBest] = useState(0);
  const [toast, setToast] = useState<Item | null>(null);
  const [announce, setAnnounce] = useState('');
  const [result, setResult] = useState<(GameResult & { newBest: boolean }) | null>(null);

  const zoneOrder: Pillar[] = ['design', 'develop', 'grow'];

  // Open as a modal, lock page scroll, default to calm mode for reduced motion.
  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync with browser state */
    setBest(readBest());
    setCalm(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      document.documentElement.style.overflow = '';
      gameRef.current?.destroy();
    };
  }, []);

  const pause = useCallback(() => {
    if (!gameRef.current?.running) return;
    gameRef.current.pause();
    setPhase('paused');
    setAnnounce(t('paused'));
  }, [t]);

  const resume = useCallback(() => {
    gameRef.current?.resume();
    setPhase('playing');
    stageRef.current?.focus();
  }, []);

  // Auto-pause when the tab is hidden; keep the canvas sharp on resize.
  useEffect(() => {
    const onVisibility = () => document.hidden && pause();
    document.addEventListener('visibilitychange', onVisibility);
    const ro = new ResizeObserver(() => gameRef.current?.resize());
    if (stageRef.current) ro.observe(stageRef.current);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
    };
  }, [pause]);

  function start() {
    gameRef.current?.destroy();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const byPillar = Object.fromEntries(
      skills.map((g) => [g.pillar, g.items.map((i) => localize(i, locale as 'fr' | 'en'))]),
    ) as Record<Pillar, string[]>;
    const zoneNames = Object.fromEntries(zoneOrder.map((p) => [p, tPillar(p)])) as Record<
      Pillar,
      string
    >;

    setScore(0);
    setCombo(1);
    setResult(null);
    gameRef.current = createGame({
      canvas: canvasRef.current!,
      level: buildLevel(byPillar),
      tile,
      colors: readColors(),
      zoneNames,
      finishLabel: t('finish'),
      calm,
      reducedMotion,
      callbacks: {
        onScore: (s, c) => {
          setScore(s);
          setCombo(c);
        },
        onCollect: (item) => {
          setToast(item);
          setAnnounce(t('collected', { skill: item.label, pillar: tPillar(item.pillar) }));
        },
        onZone: (z) => {
          setZone(z);
          setAnnounce(t('zoneEntered', { n: z + 1, name: tPillar(zoneOrder[z]!) }));
        },
        onHit: (reason) => setAnnounce(reason === 'fall' ? t('hitFall') : t('hitObstacle')),
        onProgress: (ratio) => {
          if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
        },
        onEnd: (r) => {
          const previous = readBest();
          const newBest = !r.skipped && r.score > previous;
          if (newBest) {
            saveBest(r.score);
            setBest(r.score);
          }
          setResult({ ...r, newBest });
          setPhase('ended');
          track(
            r.skipped ? { name: 'game_skip' } : { name: 'game_complete', data: { score: r.score } },
          );
        },
      },
    });
    setPhase('playing');
    gameRef.current.start();
    stageRef.current?.focus();
  }

  // Collected-skill card disappears after a moment.
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(id);
  }, [toast]);

  function onKeyDown(e: KeyboardEvent) {
    if (phase !== 'playing' && phase !== 'paused') return;
    if (JUMP_KEYS.has(e.code) && phase === 'playing') {
      e.preventDefault();
      if (!e.repeat) gameRef.current?.press();
    } else if (e.code === 'KeyP') {
      e.preventDefault();
      if (phase === 'playing') pause();
      else resume();
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (JUMP_KEYS.has(e.code)) gameRef.current?.release();
  }

  function goTo(hash: string) {
    dialogRef.current?.close();
    window.location.hash = hash;
  }

  const button =
    'rounded-full px-5 py-2.5 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
  const primary = `${button} bg-accent-strong text-on-accent hover:brightness-110`;
  const secondary = `${button} border border-fg/30 hover:border-fg`;
  const total = skills.reduce((n, g) => n + g.items.length, 0);

  return (
    <dialog
      ref={dialogRef}
      aria-label={t('dialogLabel')}
      onClose={onClose}
      onCancel={(e) => {
        // Esc pauses a running game instead of closing it.
        if (phase === 'playing') {
          e.preventDefault();
          pause();
        }
      }}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className="m-auto max-h-none w-full max-w-none bg-bg p-0 text-fg backdrop:bg-black/60 max-sm:h-full sm:h-fit sm:max-h-[calc(100svh-2rem)] sm:w-[min(100%-2rem,1100px)] sm:rounded-2xl sm:border sm:border-line"
    >
      <div className="flex h-full flex-col max-sm:justify-center">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-2xl font-semibold">{t('title')}</h2>
            <p className="hidden font-mono text-xs text-muted sm:block">{t('tagline')}</p>
          </div>
          <div className="flex items-center gap-2">
            {(phase === 'playing' || phase === 'paused') && (
              <>
                <button
                  type="button"
                  onClick={phase === 'playing' ? pause : resume}
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-xs hover:border-fg"
                >
                  {phase === 'playing' ? t('pause') : t('resume')}
                </button>
                <button
                  type="button"
                  onClick={() => gameRef.current?.skip()}
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-xs hover:border-fg"
                >
                  {t('skip')}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="grid size-9 place-items-center rounded-full border border-line hover:border-fg"
            >
              <span className="sr-only">{t('close')}</span>
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </header>

        {/* HUD */}
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 font-mono text-xs sm:px-6">
          <div className="flex gap-2">
            <dt className="text-muted">{t('zone', { n: zone + 1 })}</dt>
            <dd className="font-semibold">{tPillar(zoneOrder[zone]!)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">{t('score')}</dt>
            <dd className="font-semibold tabular-nums">
              {score}
              {combo > 1 && <span className="ml-2 text-accent">{t('combo', { n: combo })}</span>}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">{t('best')}</dt>
            <dd className="tabular-nums">{best}</dd>
          </div>
        </dl>
        <div className="h-1 bg-line" aria-hidden="true" title={t('progress')}>
          <div ref={progressRef} className="h-full origin-left scale-x-0 bg-accent-strong" />
        </div>

        <div
          ref={stageRef}
          tabIndex={-1}
          className="relative aspect-video w-full touch-none select-none focus:outline-none max-sm:aspect-[4/3]"
          onPointerDown={(e) => {
            if (phase !== 'playing' || (e.target as Element).closest('button')) return;
            gameRef.current?.press();
          }}
          onPointerUp={() => gameRef.current?.release()}
          onPointerCancel={() => gameRef.current?.release()}
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={t('canvasLabel')}
            className="absolute inset-0 h-full w-full"
          />

          {toast && (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-xl border border-line bg-bg/95 px-4 py-2 text-center shadow-lg"
            >
              <span className="block font-mono text-[11px] text-muted uppercase">
                {tPillar(toast.pillar)}
              </span>
              <span className="font-display text-lg font-semibold">{toast.label}</span>
            </p>
          )}

          {phase === 'intro' && (
            <div className="absolute inset-0 overflow-y-auto bg-bg/92 p-5 sm:p-10">
              <p className="max-w-2xl text-base sm:text-lg">{t('intro')}</p>
              <h3 className="mt-5 font-display text-xl font-semibold">{t('howTo')}</h3>
              <ul className="mt-2 max-w-2xl list-disc space-y-1 pl-5 text-sm text-muted sm:text-base">
                <li>{t('keys')}</li>
                <li>{t('touch')}</li>
                <li>{t('rules')}</li>
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button type="button" onClick={start} className={primary}>
                  {t('start')}
                </button>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={calm}
                    onChange={(e) => setCalm(e.target.checked)}
                    className="size-4 accent-[var(--accent-strong)]"
                  />
                  {t('calm')}
                </label>
              </div>
            </div>
          )}

          {phase === 'paused' && (
            <div className="absolute inset-0 grid place-items-center bg-bg/85">
              <div className="text-center">
                <p className="font-display text-3xl font-semibold">{t('paused')}</p>
                <div className="mt-5 flex justify-center gap-3">
                  <button type="button" onClick={resume} className={primary}>
                    {t('resume')}
                  </button>
                  <button
                    type="button"
                    onClick={() => gameRef.current?.skip()}
                    className={secondary}
                  >
                    {t('skip')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === 'ended' && result && (
            <div className="absolute inset-0 overflow-y-auto bg-bg/95 p-5 sm:p-10">
              <h3 className="font-display text-3xl font-semibold sm:text-4xl">
                {result.skipped ? t('endSkipped') : t('endTitle')}
              </h3>
              <p className="mt-3 font-mono text-sm">
                {t('endScore', { score: result.score })} · {t('endBest', { best })}
                {result.newBest && <span className="ml-2 text-accent">{t('newBest')}</span>}
              </p>
              <p className="mt-2">{t('endCollected', { count: result.collected.length, total })}</p>
              <ul className="mt-4 flex max-w-3xl flex-wrap gap-1.5">
                {result.collected.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-full border border-line px-2.5 py-0.5 text-xs"
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">{t('endText')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => goTo('projects')} className={primary}>
                  {t('seeProjects')}
                </button>
                <button type="button" onClick={() => goTo('contact')} className={secondary}>
                  {t('contact')}
                </button>
                <button
                  type="button"
                  onClick={start}
                  className={`${button} text-muted hover:text-fg`}
                >
                  {t('replay')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Big jump button for touch screens */}
        {phase === 'playing' && (
          <div className="flex justify-center p-4 pointer-fine:hidden">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                gameRef.current?.press();
              }}
              onPointerUp={() => gameRef.current?.release()}
              className="w-full max-w-xs rounded-full bg-fg py-4 font-medium text-bg"
            >
              {t('jump')}
            </button>
          </div>
        )}

        <p className="sr-only" aria-live="polite" role="status">
          {announce}
        </p>
      </div>
    </dialog>
  );
}
