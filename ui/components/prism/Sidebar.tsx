import React, { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
  FolderTree,
  Plus,
  Search,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Project } from '../../hooks/useWorkspaceState'

interface SidebarProps {
  activeProject: Project | null
  projects: Project[]
  repoFiles: string[]
  restorationMessage: string | null
  activeTaskTitle: string | null
  onSelectProject: (id: string) => void
  onConnectProject: () => void
}

interface TreeNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children: TreeNode[]
}

/** Build a nested folder/file tree from a flat list of relative POSIX paths. */
function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode = { name: '', path: '', type: 'folder', children: [] }

  for (const p of paths) {
    const parts = p.split('/').filter(Boolean)
    let cursor = root
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1
      const path = parts.slice(0, index + 1).join('/')
      let next = cursor.children.find(
        (c) => c.name === part && c.type === (isFile ? 'file' : 'folder')
      )
      if (!next) {
        next = { name: part, path, type: isFile ? 'file' : 'folder', children: [] }
        cursor.children.push(next)
      }
      cursor = next
    })
  }

  const sort = (node: TreeNode): void => {
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    node.children.forEach(sort)
  }
  sort(root)
  return root.children
}

function FileTreeNode({
  node,
  depth,
  forceOpen,
  selectedPath,
  onSelect,
}: {
  node: TreeNode
  depth: number
  forceOpen: boolean
  selectedPath: string | null
  onSelect: (path: string) => void
}) {
  const [open, setOpen] = useState(depth === 0)
  const expanded = forceOpen || open
  const indent = depth * 12 + 8

  if (node.type === 'file') {
    const active = selectedPath === node.path
    return (
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        title={node.path}
        style={{ paddingLeft: `${indent + 14}px` }}
        className={cn(
          'flex w-full items-center gap-1.5 rounded py-1 pr-2 text-left font-mono text-[11px] transition-colors',
          active
            ? 'bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100'
            : 'text-neutral-700 hover:bg-neutral-200/70 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
        )}
      >
        <FileCode2 className="h-3 w-3 shrink-0 text-neutral-500 dark:text-neutral-400" />
        <span className="truncate">{node.name}</span>
      </button>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={node.path}
        style={{ paddingLeft: `${indent}px` }}
        className="flex w-full items-center gap-1 rounded py-1 pr-2 text-left font-mono text-[11px] text-neutral-700 transition-colors hover:bg-neutral-200/70 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
      >
        <ChevronRight
          className={cn('h-3 w-3 shrink-0 transition-transform', expanded && 'rotate-90')}
        />
        {expanded ? (
          <FolderOpen className="h-3 w-3 shrink-0 text-violet-500 dark:text-violet-400" />
        ) : (
          <Folder className="h-3 w-3 shrink-0 text-violet-500 dark:text-violet-400" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {expanded &&
        node.children.map((child) => (
          <FileTreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            forceOpen={forceOpen}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        ))}
    </div>
  )
}

export function Sidebar({
  activeProject,
  projects,
  repoFiles,
  restorationMessage,
  activeTaskTitle,
  onSelectProject,
  onConnectProject,
}: SidebarProps) {
  const [explorerOpen, setExplorerOpen] = useState(true)
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  const tree = useMemo(() => {
    const term = search.trim().toLowerCase()
    const files = term ? repoFiles.filter((f) => f.toLowerCase().includes(term)) : repoFiles
    return buildTree(files)
  }, [repoFiles, search])

  const searching = search.trim().length > 0

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-r border-neutral-300/60 bg-[#f3f3f3] dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative border-b border-neutral-300/80 p-2 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setProjectMenuOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-neutral-200/70 dark:hover:bg-neutral-800"
        >
          <FolderOpen className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-400" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-medium text-neutral-800 dark:text-neutral-100">
              {activeProject?.name || 'No project'}
            </div>
            {activeProject?.repoPath && (
              <div className="truncate font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                {activeProject.repoPath}
              </div>
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
        </button>

        {projectMenuOpen && (
          <div className="absolute left-2 right-2 top-full z-40 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelectProject(p.id)
                  setProjectMenuOpen(false)
                }}
                className={cn(
                  'block w-full truncate px-3 py-2 text-left text-[12px] text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700',
                  p.id === activeProject?.id &&
                    'bg-violet-50 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100'
                )}
              >
                {p.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setProjectMenuOpen(false)
                onConnectProject()
              }}
              className="flex w-full items-center gap-2 border-t border-neutral-100 px-3 py-2 text-[12px] text-violet-700 hover:bg-violet-50 dark:border-neutral-700 dark:text-violet-300 dark:hover:bg-neutral-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Connect repository…
            </button>
          </div>
        )}
      </div>

      {(restorationMessage || activeTaskTitle) && (
        <div className="border-b border-neutral-300/60 px-3 py-2 dark:border-neutral-800">
          {restorationMessage && (
            <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {restorationMessage}
            </p>
          )}
          {activeTaskTitle && (
            <p className="mt-1 text-[11px] text-neutral-600 dark:text-neutral-300">
              Task: <span className="font-medium">{activeTaskTitle}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <button
          type="button"
          onClick={() => setExplorerOpen((v) => !v)}
          className="flex w-full items-center gap-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 hover:bg-neutral-200/50 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {explorerOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <FolderTree className="h-3.5 w-3.5" />
          Explorer
        </button>

        {explorerOpen && (
          <div className="px-2 pb-3">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter files…"
                className="w-full rounded border border-neutral-200 bg-white py-1 pl-7 pr-2 text-[11px] text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-violet-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </div>

            {tree.length === 0 ? (
              <p className="px-2 py-4 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
                {activeProject
                  ? searching
                    ? 'No files match your filter.'
                    : 'No files indexed yet. Run a prompt to index the repo.'
                  : 'Connect a repository to browse files.'}
              </p>
            ) : (
              <div className="space-y-0.5">
                {tree.map((node) => (
                  <FileTreeNode
                    key={node.path}
                    node={node}
                    depth={0}
                    forceOpen={searching}
                    selectedPath={selectedPath}
                    onSelect={setSelectedPath}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
