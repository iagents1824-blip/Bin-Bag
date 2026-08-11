import React, { useState, useEffect } from 'react';
import { GitBranch, Star, Clock, ArrowUpRight, Activity, Plus, Check } from 'lucide-react';

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

interface WorkflowsViewProps {
  onAddToCollection?: (item: { title: string; category: string; url?: string; key?: string; price?: number }) => void;
}

function RepoCard({ repo, onSave }: { repo: Repo; onSave?: () => void }) {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:shadow-md hover:border-gray-300 transition-all group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <GitBranch className="w-4 h-4 text-[#4F46E5] shrink-0" />
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[#0A0A0A] truncate hover:text-[#4F46E5] transition-colors"
            >
              {repo.fullName}
            </a>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSave}
              title="Save to Collection"
              className={`p-1.5 rounded-full border transition-all ${
                saved
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-[#0A0A0A] hover:text-white'
              }`}
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
            <a href={repo.url} target="_blank" rel="noopener noreferrer">
              <ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-[#4F46E5] transition-colors" />
            </a>
          </div>
        </div>
        {repo.description && (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{repo.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            {repo.stars.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {new Date(repo.pushedAt || repo.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex gap-1">
          {repo.topics.slice(0, 2).map(t => (
            <span key={t} className="text-[9px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({ onAddToCollection }) => {
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

  const handleSaveRepo = (repo: Repo) => {
    onAddToCollection?.({
      title: repo.fullName,
      category: 'GitHub Workflow Repo',
      url: repo.url,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0EFE9] text-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-xl text-[#4F46E5]">
              <GitBranch className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight">AI Workflow Repositories</h1>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            Curated GitHub repos for AI agents, LLM orchestration, and agentic frameworks — automatically updated every 8 hours.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20 font-medium animate-pulse">Loading AI workflow repos...</div>
        ) : (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-bold text-[#0A0A0A] uppercase tracking-wider">New (Last 30 Days)</h2>
                <span className="text-xs font-semibold text-gray-400 ml-auto">{newRepos.length} repos</span>
              </div>
              {newRepos.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No new repos yet — backend agent populates daily.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newRepos.slice(0, 12).map(r => (
                    <RepoCard key={r.id} repo={r} onSave={() => handleSaveRepo(r)} />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <h2 className="text-base font-bold text-[#0A0A0A] uppercase tracking-wider">Most Starred Repos</h2>
                <span className="text-xs font-semibold text-gray-400 ml-auto">{starredRepos.length} repos</span>
              </div>
              {starredRepos.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No repos yet — backend agent populates daily.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {starredRepos.slice(0, 18).map(r => (
                    <RepoCard key={r.id} repo={r} onSave={() => handleSaveRepo(r)} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};