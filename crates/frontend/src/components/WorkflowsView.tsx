import React, { useState, useEffect } from 'react';
import { GitBranch, Star, Clock, ArrowUpRight, Activity } from 'lucide-react';

interface Repo {
  id: number;
  fullName: string;
  owner: string;
  description: string;
  stars: number;
  topics: string[];
  url: string;
  createdAt: string;
  pushedAt: string;
  status: string;
}

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#0f0f11] border border-[#222] p-4 flex flex-col gap-3 hover:bg-[#151518] hover:border-[#3a3a3a] transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <GitBranch className="w-3.5 h-3.5 text-[#555] shrink-0" />
          <span className="text-sm font-bold text-[#ccc] truncate group-hover:text-white transition-colors">
            {repo.fullName}
          </span>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-[#444] group-hover:text-[#00FF41] shrink-0 transition-colors" />
      </div>
      {repo.description && (
        <p className="text-xs text-[#777] line-clamp-2 leading-relaxed">{repo.description}</p>
      )}
      <div className="flex items-center gap-3 mt-auto">
        <div className="flex items-center gap-1 text-[11px] text-[#888]">
          <Star className="w-3 h-3 text-[#FFB000]" />
          {repo.stars.toLocaleString()}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#666]">
          <Clock className="w-3 h-3" />
          {new Date(repo.pushedAt || repo.createdAt).toLocaleDateString()}
        </div>
        {repo.topics.slice(0, 2).map(t => (
          <span key={t} className="text-[9px] font-mono text-[#444] bg-[#1a1a1e] px-1.5 py-0.5 border border-[#2a2a2a]">
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}

export const WorkflowsView: React.FC = () => {
  const [newRepos, setNewRepos] = useState<Repo[]>([]);
  const [starredRepos, setStarredRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [newRes, estRes] = await Promise.all([
          fetch('/api/listings/workflows?status=new'),
          fetch('/api/listings/workflows?status=established')
        ]);
        const newData = await newRes.json();
        const estData = await estRes.json();
        if (Array.isArray(newData)) setNewRepos(newData);
        if (Array.isArray(estData)) setStarredRepos(estData);
      } catch (e) {
        console.error('Failed to load workflows:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        <div className="border-b border-[#262626] pb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tighter">
            <GitBranch className="text-[#00FF41] w-6 h-6" />
            AI Workflow Repositories
          </h1>
          <p className="text-sm text-[#888] mt-1">
            Curated GitHub repos for AI agents, LLM orchestration, and agentic frameworks — auto-updated every 8 hours.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-[#555] py-20 animate-pulse">Loading AI workflow repos...</div>
        ) : (
          <>
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFB000]" />
                <h2 className="text-base font-bold text-white uppercase tracking-widest">New (Last 30 Days)</h2>
                <span className="text-xs font-mono text-[#555] ml-auto">{newRepos.length} repos</span>
              </div>
              {newRepos.length === 0 ? (
                <p className="text-sm text-[#444] italic">No new repos yet — agent will populate on first run.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {newRepos.slice(0, 12).map(r => <RepoCard key={r.id} repo={r} />)}
                </div>
              )}
            </section>

            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00E5FF]" />
                <h2 className="text-base font-bold text-white uppercase tracking-widest">Most Starred</h2>
                <span className="text-xs font-mono text-[#555] ml-auto">{starredRepos.length} repos</span>
              </div>
              {starredRepos.length === 0 ? (
                <p className="text-sm text-[#444] italic">No repos yet — agent will populate on first run.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {starredRepos.slice(0, 18).map(r => <RepoCard key={r.id} repo={r} />)}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};