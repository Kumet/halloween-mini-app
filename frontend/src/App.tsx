import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Card from './components/Card';
import Button from './components/Button';
import ResultBadge from './components/ResultBadge';
import HistoryTimeline from './components/HistoryTimeline';
import { callTrick, callStory, fetchHistory } from './lib/api';
import type { HistoryEntry, StoryResponse, TrickResponse } from './lib/api';

export default function App() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [name, setName] = useState('');
  const [seed, setSeed] = useState<number | ''>('');
  const [trick, setTrick] = useState<TrickResponse | null>(null);

  const [mode, setMode] = useState<'horror'|'gag'|'kids'>('horror');
  const [hero, setHero] = useState(t('placeholders.heroDefault'));
  const [length, setLength] = useState<'short'|'medium'>('short');
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const loadHistory = async () => {
    const entries = await fetchHistory();
    setHistory(entries);
  };

  useEffect(() => {
    loadHistory().catch(() => {
      // 初回読み込みで失敗しても UI 全体には影響しないため握りつぶす
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('lang');
    if (stored && stored !== language) {
      setLanguage(stored);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lang', language);
    }
  }, [language, i18n]);

  useEffect(() => {
    setHero((current) => {
      const defaults = ['あなた', 'You'];
      if (current.trim().length === 0 || defaults.includes(current)) {
        return t('placeholders.heroDefault');
      }
      return current;
    });
  }, [language, t]);

  const doTrick = async () => {
    const s = seed === '' ? undefined : Number(seed);
    const res = await callTrick(name || undefined, s);
    setTrick(res);
    loadHistory().catch(() => {});
  };

  const doStory = async () => {
    const s = seed === '' ? undefined : Number(seed);
    const heroName = hero || t('placeholders.heroDefault');
    const res = await callStory({ mode, hero_name: heroName, length, seed: s });
    setStory(res);
    loadHistory().catch(() => {});
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.2), transparent 55%), radial-gradient(circle at 80% 30%, rgba(147, 51, 234, 0.25), transparent 55%), radial-gradient(circle at 50% 80%, rgba(34, 197, 94, 0.2), transparent 60%)',
        }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.7, 0.5], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.main
        className="relative mx-auto max-w-4xl p-6 space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <header className="space-y-4">
          <div className="flex justify-end">
            <label className="flex items-center gap-2 text-xs text-zinc-500">
              {t('languageLabel')}
              <select
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-100 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>
          <div className="text-center space-y-2">
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold">
              {t('title')}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-zinc-400">
              {t('subtitle')}
            </motion.p>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <h2 className="mb-3 text-xl font-semibold">{t('sections.trick')}</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                className="rounded-lg bg-zinc-800 px-3 py-2"
                placeholder={t('placeholders.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="rounded-lg bg-zinc-800 px-3 py-2"
                placeholder={t('placeholders.seedNumber')}
                value={seed}
                onChange={(e) => {
                  const value = e.target.value;
                  setSeed(value === '' ? '' : Number(value));
                }}
              />
              <Button data-testid="trick-button" onClick={doTrick}>
                {t('buttons.trick')}
              </Button>
            </div>
            {trick && (
              <motion.div data-testid="trick-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
                <ResultBadge kind={trick.result} />
                <div className="text-zinc-300">{trick.message}</div>
                <pre className="overflow-auto rounded-xl bg-zinc-950/50 p-3 text-xs text-zinc-500">
                  {JSON.stringify(trick.payload, null, 2)}
                </pre>
              </motion.div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <h2 className="mb-3 text-xl font-semibold">{t('sections.story')}</h2>
            <div className="grid items-center gap-3 md:grid-cols-5">
              <select
                data-testid="mode-select"
                className="rounded-lg bg-zinc-800 px-3 py-2"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'horror' | 'gag' | 'kids')}
              >
                <option value="horror">horror</option>
                <option value="gag">gag</option>
                <option value="kids">kids</option>
              </select>
              <select
                data-testid="length-select"
                className="rounded-lg bg-zinc-800 px-3 py-2"
                value={length}
                onChange={(e) => setLength(e.target.value as 'short' | 'medium')}
              >
                <option value="short">short</option>
                <option value="medium">medium</option>
              </select>
              <input
                className="rounded-lg bg-zinc-800 px-3 py-2"
                placeholder={t('placeholders.hero')}
                value={hero}
                onChange={(e) => setHero(e.target.value)}
              />
              <input
                className="rounded-lg bg-zinc-800 px-3 py-2"
                placeholder={t('placeholders.seed')}
                value={seed}
                onChange={(e) => {
                  const value = e.target.value;
                  setSeed(value === '' ? '' : Number(value));
                }}
              />
              <Button data-testid="story-button" onClick={doStory}>
                {t('buttons.story')}
              </Button>
            </div>
            {story && (
              <motion.div data-testid="story-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
                <div className="text-lg font-semibold">{story.title}</div>
                <p className="whitespace-pre-wrap text-zinc-300">{story.story}</p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <h2 className="mb-3 text-xl font-semibold">{t('sections.history')}</h2>
            <HistoryTimeline entries={history} />
          </Card>
        </motion.div>

        <motion.footer
          className="pt-4 text-center text-xs text-zinc-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {t('footer')}
        </motion.footer>
      </motion.main>
    </div>
  );
}
