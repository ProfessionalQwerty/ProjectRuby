import React, { useEffect, useState } from 'react'
import { GitBranch } from 'lucide-react'
import { ModelLogo } from '../ui/ModelLogo'

interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  w: number
  group: 'auth' | 'api' | 'store'
}

interface GraphEdge {
  from: string
  to: string
}

interface DatalogEntry {
  id: string
  session: string
  model: string
  summary: string
  delta: string
  time: string
}

/** Hand-placed import graph — mirrors how PRISM indexes a real repo */
const GRAPH_NODES: GraphNode[] = [
  { id: 'routes', label: 'routes.ts', x: 28, y: 36, w: 72, group: 'api' },
  { id: 'handlers', label: 'handlers.ts', x: 28, y: 88, w: 76, group: 'api' },
  { id: 'middleware', label: 'middleware.ts', x: 148, y: 62, w: 88, group: 'auth' },
  { id: 'session', label: 'session.ts', x: 148, y: 128, w: 76, group: 'auth' },
  { id: 'user-store', label: 'user-store.ts', x: 268, y: 96, w: 88, group: 'store' },
  { id: 'types', label: 'types.ts', x: 268, y: 158, w: 64, group: 'store' },
]

const GRAPH_EDGES: GraphEdge[] = [
  { from: 'routes', to: 'middleware' },
  { from: 'handlers', to: 'middleware' },
  { from: 'middleware', to: 'session' },
  { from: 'middleware', to: 'user-store' },
  { from: 'session', to: 'types' },
  { from: 'user-store', to: 'types' },
]

const GROUP_STYLES: Record<GraphNode['group'], { fill: string; stroke: string; label: string }> = {
  api: { fill: '#f5f3ff', stroke: '#c4b5fd', label: '#6d28d9' },
  auth: { fill: '#eff6ff', stroke: '#93c5fd', label: '#1d4ed8' },
  store: { fill: '#f0fdf4', stroke: '#86efac', label: '#15803d' },
}

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

function nodeById(id: string): GraphNode | undefined {
  return GRAPH_NODES.find((n) => n.id === id)
}

function edgePath(from: GraphNode, to: GraphNode): string {
  const x1 = from.x + from.w
  const y1 = from.y + 14
  const x2 = to.x
  const y2 = to.y + 14
  const mx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
}

function CodeGraph({ activeId }: { activeId: string }) {
  return (
    <svg viewBox="0 0 360 200" className="h-full min-h-[240px] w-full" aria-label="Repository import graph">
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#a3a3a3" />
        </marker>
      </defs>

      {/* Group labels */}
      <text x="28" y="18" className="fill-neutral-400 text-[9px] font-medium" style={{ fontSize: 9 }}>
        api/
      </text>
      <text x="148" y="18" className="fill-neutral-400 text-[9px] font-medium" style={{ fontSize: 9 }}>
        auth/
      </text>
      <text x="268" y="18" className="fill-neutral-400 text-[9px] font-medium" style={{ fontSize: 9 }}>
        store/ · lib/
      </text>

      {/* Edges */}
      {GRAPH_EDGES.map(({ from, to }) => {
        const a = nodeById(from)
        const b = nodeById(to)
        if (!a || !b) return null
        const highlighted = activeId === from || activeId === to
        return (
          <path
            key={`${from}-${to}`}
            d={edgePath(a, b)}
            fill="none"
            stroke={highlighted ? '#818cf8' : '#d4d4d4'}
            strokeWidth={highlighted ? 1.5 : 1}
            markerEnd="url(#arrow)"
            opacity={highlighted ? 1 : 0.85}
          />
        )
      })}

      {/* Nodes */}
      {GRAPH_NODES.map((node) => {
        const style = GROUP_STYLES[node.group]
        const active = node.id === activeId
        return (
          <g key={node.id}>
            {active && (
              <rect
                x={node.x - 3}
                y={node.y - 3}
                width={node.w + 6}
                height={34}
                rx={8}
                fill="none"
                stroke="#6366f1"
                strokeWidth={1.5}
                opacity={0.6}
                className="graph-active-ring"
              />
            )}
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={28}
              rx={6}
              fill={style.fill}
              stroke={active ? '#6366f1' : style.stroke}
              strokeWidth={active ? 1.5 : 1}
            />
            <text
              x={node.x + 8}
              y={node.y + 18}
              fill={style.label}
              style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 500 }}
            >
              {node.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function MemoryGraphShowcase({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const compact = variant === 'compact'
  const [activeNode, setActiveNode] = useState('middleware')
  const [activeLog, setActiveLog] = useState(0)

  useEffect(() => {
    const nodeTimer = window.setInterval(() => {
      setActiveNode((prev) => {
        const idx = GRAPH_NODES.findIndex((n) => n.id === prev)
        return GRAPH_NODES[(idx + 1) % GRAPH_NODES.length].id
      })
    }, 2800)
    const logTimer = window.setInterval(() => {
      setActiveLog((i) => (i + 1) % DATALOG.length)
    }, 3200)
    return () => {
      window.clearInterval(nodeTimer)
      window.clearInterval(logTimer)
    }
  }, [])

  return (
    <section className={compact ? 'py-16' : 'border-t border-neutral-200/80 py-24'}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            Repository Memory
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            One memory. Every model.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-600">
            Six months in PRISM, and the graph of every decision, build, and fix is yours — not locked in
            Claude’s or GPT’s session memory. Agents document each change in the ledger so the next model
            inherits a complete architectural record.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {/* Graph — 70% */}
          <div className="flex flex-[7] flex-col rounded-xl border border-neutral-200/80 bg-neutral-50/90 p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-neutral-600">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Import graph · src/
            </div>
            <div className="flex-1 rounded-lg border border-neutral-200/60 bg-white p-3">
              <CodeGraph activeId={activeNode} />
            </div>
            <p className="mt-3 text-[11px] text-neutral-500">
              Nodes and edges persist across sessions — re-indexed incrementally on each agent run.
            </p>
          </div>

          {/* Datalog — 30% */}
          <div className="flex flex-[3] flex-col rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm">
            <div className="mb-3 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-[12px] font-medium text-neutral-800">
                <GitBranch className="h-3.5 w-3.5 text-violet-500" />
                Session datalog
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-500">Cross-model updates to repository memory</p>
            </div>

            <ul className="flex-1 space-y-2 overflow-hidden">
              {DATALOG.map((entry, i) => {
                const active = i === activeLog
                return (
                  <li
                    key={entry.id}
                    className={`rounded-lg border px-3 py-2.5 transition-all duration-500 ${
                      active
                        ? 'border-violet-200 bg-violet-50/80'
                        : 'border-neutral-200 bg-neutral-50/50 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <ModelLogo provider={entry.model} size={16} />
                        <span className="truncate text-[12px] font-medium text-neutral-800">{entry.session}</span>
                      </div>
                      <span className="shrink-0 text-[10px] text-neutral-400">{entry.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-neutral-600">{entry.summary}</p>
                    <p className="mt-1 text-[10px] text-blue-600">{entry.delta}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {!compact && (
          <p className="mx-auto mt-8 max-w-2xl text-center text-[15px] leading-relaxed text-neutral-600">
            Like a persistent brain for your repository, PRISM memory learns from every agent run — which files matter,
            which symbols connect, and what changed since your last session. New chats don&apos;t start cold: they inherit
            the graph index, ledger continuity, and vision context automatically. That warm start is what makes
            cross-model handoffs work — switch providers without re-explaining your codebase.
          </p>
        )}
      </div>

      <style>{`
        @keyframes graphRing {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        .graph-active-ring {
          animation: graphRing 2.8s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
