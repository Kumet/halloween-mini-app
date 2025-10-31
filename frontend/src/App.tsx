import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './components/Card';
import Button from './components/Button';
import ResultBadge from './components/ResultBadge';
import { callTrick, callStory } from './lib/api';
import type { StoryResponse, TrickResponse } from './lib/api';

export default function App() {
  const [name, setName] = useState('');
  const [seed, setSeed] = useState<number | ''>('');
  const [trick, setTrick] = useState<TrickResponse | null>(null);

  const [mode, setMode] = useState<'horror'|'gag'|'kids'>('horror');
  const [hero, setHero] = useState('あなた');
  const [length, setLength] = useState<'short'|'medium'>('short');
  const [story, setStory] = useState<StoryResponse | null>(null);

  const doTrick = async () => {
    const s = seed === '' ? undefined : Number(seed);
    const res = await callTrick(name || undefined, s);
    setTrick(res);
  };

  const doStory = async () => {
    const s = seed === '' ? undefined : Number(seed);
    const res = await callStory({ mode, hero_name: hero || 'あなた', length, seed: s });
    setStory(res);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="text-center space-y-2">
        <motion.h1 initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="text-3xl font-bold">
          🎃 Halloween Mini Apps
        </motion.h1>
        <p className="text-zinc-400">React + FastAPI（ローカル環境で即動作）</p>
      </header>

      <Card>
        <h2 className="text-xl font-semibold mb-3">Trick or Treat API</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input className="rounded-lg bg-zinc-800 px-3 py-2" placeholder="名前（任意）" value={name} onChange={e => setName(e.target.value)} />
          <input
            className="rounded-lg bg-zinc-800 px-3 py-2"
            placeholder="seed（任意、整数）"
            value={seed}
            onChange={e => {
              const value = e.target.value
              setSeed(value === '' ? '' : Number(value))
            }}
          />
          <Button onClick={doTrick}>Trick or Treat!</Button>
        </div>
        {trick && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-4 space-y-2">
            <ResultBadge kind={trick.result} />
            <div className="text-zinc-300">{trick.message}</div>
            <pre className="text-xs text-zinc-500 bg-zinc-950/50 rounded-xl p-3 overflow-auto">{JSON.stringify(trick.payload, null, 2)}</pre>
          </motion.div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-3">Halloween Story API</h2>
        <div className="grid md:grid-cols-5 gap-3 items-center">
          <select
            className="rounded-lg bg-zinc-800 px-3 py-2"
            value={mode}
            onChange={e => setMode(e.target.value as 'horror' | 'gag' | 'kids')}
          >
            <option value="horror">horror</option>
            <option value="gag">gag</option>
            <option value="kids">kids</option>
          </select>
          <select
            className="rounded-lg bg-zinc-800 px-3 py-2"
            value={length}
            onChange={e => setLength(e.target.value as 'short' | 'medium')}
          >
            <option value="short">short</option>
            <option value="medium">medium</option>
          </select>
          <input className="rounded-lg bg-zinc-800 px-3 py-2" placeholder="主人公名" value={hero} onChange={e => setHero(e.target.value)} />
          <input
            className="rounded-lg bg-zinc-800 px-3 py-2"
            placeholder="seed（任意）"
            value={seed}
            onChange={e => {
              const value = e.target.value
              setSeed(value === '' ? '' : Number(value))
            }}
          />
          <Button onClick={doStory}>生成する</Button>
        </div>
        {story && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-4 space-y-2">
            <div className="text-lg font-semibold">{story.title}</div>
            <p className="whitespace-pre-wrap text-zinc-300">{story.story}</p>
          </motion.div>
        )}
      </Card>

      <footer className="text-center text-xs text-zinc-500 pt-4">Happy Halloween 👻</footer>
    </div>
  );
}
