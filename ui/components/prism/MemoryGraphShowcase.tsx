import React, { useEffect, useMemo, useState } from 'react'
import { FileCode2, GitBranch, Layers, Sparkles } from 'lucide-react'

type NodeKind = 'file' | 'symbol' | 'session' | 'task'

interface GraphNode {
  id: string
  kind: NodeKind
  label: string
  x: number
  y: number
  size: number
}

interface DatalogEntry {
  id: string
  session: string
  model: string
  summary: string
  delta: string
  time: string
}

const NODE_COLORS: Record<NodeKind, string> = {
  file: '#34d399',
  symbol: '#a78bfa',
  session: '#fbbf24',
  task: '#fb7185',
}

const NODE_LABELS: Record<NodeKind, string> = {
  file: 'Files',
  symbol: 'Symbols',
  session: 'Sessions',
  task: 'Tasks',
}

const INITIAL_NODES: GraphNode[] = [
  { id: 'f1', kind: 'file', label: 'auth.ts', x: 38, y: 42, size: 14 },
  { id: 'f2', kind: 'file', label: 'api/routes', x: 52, y: 58, size: 10 },
  { id: 's1', kind: 'symbol', label: 'validateSession', x: 44, y: 50, size: 18 },
  { id: 's2', kind: 'symbol', label: 'UserStore', x: 58, y: 38, size: 12 },
  { id: 'sess1', kind: 'session', label: 'Claude #12', x: 32, y: 55, size: 11 },
  { id: 'sess2', kind: 'session', label: 'GPT #8', x: 62, y: 52, size: 13 },
  { id: 't1', kind: 'task', label: 'API hardening', x: 48, y: 35, size: 16 },
  { id: 't2', kind: 'task', label: 'Refactor auth', x: 55, y: 62, size: 9 },
]

const EDGES: Array<[string, string]> = [
  ['f1', 's1'],
  ['s1', 's2'],
  ['s1', 't2'],
  ['sess1', 's1'],
  ['sess2', 's2'],
  ['t1', 'f2'],
  ['t1', 'sess2'],
  ['f2', 's2'],
]

const DATALOG: DatalogEntry[] = [
  {
    id: '1',
    session: 'Claude #12',
    model: 'claude-code',
    summary: 'Indexed auth.ts + 4 dependents',
    delta: '+12 graph nodes · vision.md synced',
    time: '2m ago',
  },
  {
    id: '2',
    session: 'GPT #8',
    model: 'openai',
    summary: 'Warm-started from ledger continuity',
    delta: '+3 tasks linked · RTK scrubbed 41% tokens',
    time: '18m ago',
  },
  {
    id: '3',
    session: 'Gemini #5',
    model: 'gemini-cli',
    summary: '/catchup pulled 2 commits since last run',
    delta: '+6 symbols · active task updated',
    time: '1h ago',
  },
  {
    id: '4',
    session: 'Claude #11',
    model: 'claude-code',
    summary: 'Pipeline completed: index → compile → route',
    delta: '+1 file lock released · ledger entry #847',
    time: '3h ago',
  },
  {
    id: '5',
    session: 'Local #2',
    model: 'local-model',
    summary: 'Repository memory persisted to datalog',
    delta: '+8 cross-session facts · graph warm cache',
    time: 'Yesterday',
  },
]

function nodeById(nodes: GraphNode[], id: string): GraphNode | undefined {
  return nodes.find((n) => n.id === id)
}

export function MemoryGraphShowcase() {
  const [pulseId, setPulseId] = useState(INITIAL_NODES[2].id)
  const [activeLog, setActiveLog] = useState(0)
  const nodes = useMemo(() => INITIAL_NODES, [])

  useEffect(() => {
    const pulseTimer = window.setInterval(() => {
      setPulseId((prev) => {
        const idx = nodes.findIndex((n) => n.id === prev)
        return nodes[(idx + 1) % nodes.length].id
      })
    }, 2200)
    const logTimer = window.setInterval(() => {
      setActiveLog((i) => (i + 1) % DATALOG.length)
    }, 3200)
    return () => {
      window.clearInterval(pulseTimer)
      window.clearInterval(logTimer)
    }
  }, [nodes])

  return (
    <section className="border-t border-neutral-200/80 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            Repository Memory
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Context that compounds — across every model
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
            PRISM maps your codebase into a living memory graph. Every session writes to a shared datalog so the
            next chat — on any provider — starts warm, not from zero.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-[#0c0d10] shadow-2xl">
          <div className="flex min-h-[420px] flex-col lg:flex-row">
            {/* Graph — 70% */}
            <div className="relative flex-[7] border-b border-neutral-800 lg:border-b-0 lg:border-r">
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-[12px] text-neutral-400">
                <Layers className="h-3.5 w-3.5" />
                <span>Live memory graph</span>
              </div>

              <svg viewBox="0 0 100 100" className="h-full min-h-[320px] w-full" aria-hidden>
                <defs>
                  <radialGradient id="graphGlow" cx="50%" cy="45%" r="55%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#0c0d10" stopOpacity="0" />
                  </radialGradient>
                  {Object.entries(NODE_COLORS).map(([kind, color]) => (
                    <filter key={kind} id={`glow-${kind}`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="1.2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  ))}
                </defs>

                <rect width="100" height="100" fill="url(#graphGlow)" />

                {/* Wireframe sphere */}
                {[22, 30, 38].map((r, i) => (
                  <ellipse
                    key={`lat-${r}`}
                    cx="50"
                    cy="48"
                    rx={r}
                    ry={r * 0.38}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="0.15"
                    opacity={0.5 + i * 0.15}
                  />
                ))}
                {[0, 30, 60, 90, 120, 150].map((deg) => {
                  const rad = (deg * Math.PI) / 180
                  return (
                    <ellipse
                      key={`lon-${deg}`}
                      cx="50"
                      cy="48"
                      rx={Math.abs(Math.cos(rad)) * 36 + 2}
                      ry="38"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="0.12"
                      transform={`rotate(${deg} 50 48)`}
                    />
                  )
                })}

                {/* Edges */}
                {EDGES.map(([a, b]) => {
                  const na = nodeById(nodes, a)
                  const nb = nodeById(nodes, b)
                  if (!na || !nb) return null
                  return (
                    <line
                      key={`${a}-${b}`}
                      x1={na.x}
                      y1={na.y}
                      x2={nb.x}
                      y2={nb.y}
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="0.2"
                      className="memory-edge"
                    />
                  )
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const active = node.id === pulseId
                  const color = NODE_COLORS[node.kind]
                  return (
                    <g key={node.id}>
                      {active && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.size * 0.55}
                          fill={color}
                          opacity="0.25"
                          className="memory-pulse"
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size * 0.22}
                        fill={color}
                        filter={`url(#glow-${node.kind})`}
                        opacity={active ? 1 : 0.75}
                      />
                    </g>
                  )
                })}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-3">
                {(Object.keys(NODE_COLORS) as NodeKind[]).map((kind) => (
                  <div key={kind} className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: NODE_COLORS[kind] }} />
                    {NODE_LABELS[kind]}
                  </div>
                ))}
              </div>
            </div>

            {/* Datalog — 30% */}
            <div className="flex flex-[3] flex-col bg-[#0a0b0e]">
              <div className="border-b border-neutral-800 px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] font-medium text-neutral-300">
                  <GitBranch className="h-3.5 w-3.5 text-violet-400" />
                  Session datalog
                </div>
                <p className="mt-0.5 text-[11px] text-neutral-500">Cross-model updates to repository memory</p>
              </div>

              <div className="flex-1 overflow-hidden p-3">
                <ul className="space-y-2">
                  {DATALOG.map((entry, i) => {
                    const active = i === activeLog
                    return (
                      <li
                        key={entry.id}
                        className={`rounded-lg border px-3 py-2.5 transition-all duration-500 ${
                          active
                            ? 'border-violet-500/40 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                            : 'border-neutral-800/80 bg-neutral-900/40 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-medium text-neutral-200">{entry.session}</span>
                          <span className="shrink-0 text-[10px] text-neutral-500">{entry.time}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-neutral-400">{entry.summary}</p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400/90">
                          <FileCode2 className="h-3 w-3" />
                          {entry.delta}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-neutral-200/80 bg-white/80 px-6 py-5 backdrop-blur-sm">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
            <div>
              <p className="text-[14px] leading-relaxed text-neutral-700">
                Like a persistent brain for your repository, PRISM memory learns from every agent run — which files
                matter, which symbols connect, and what changed since your last session. New chats don&apos;t start cold:
                they inherit the graph index, ledger continuity, and vision context automatically.
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
                That warm start is what makes cross-model handoffs work. Switch from Claude to GPT to Gemini without
                re-explaining your codebase — each model gets the same compiled context, so performance stays high
                even when providers change.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes memoryPulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes edgeFade {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.35; }
        }
        .memory-pulse {
          transform-origin: center;
          transform-box: fill-box;
          animation: memoryPulse 2.2s ease-out infinite;
        }
        .memory-edge {
          animation: edgeFade 2.2s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
