import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CommunityPost, CommunityPostType } from '../types';
import {
  Hash, ShoppingBag, Newspaper, GitBranch, Sparkles, ChevronDown,
  Search, Bell, Pin, Users, Plus, Settings, Mic, MicOff,
  ThumbsUp, MessageSquare, Send, Code, Menu, X, CornerDownRight,
  ChevronRight, Bot
} from 'lucide-react';
import { generateEnhancementTips } from '../services/geminiService';
import { Link } from 'react-router-dom';

// ── Types & constants ────────────────────────────────────────────────────────

interface CommunityViewProps {
  posts: CommunityPost[];
  onUpvotePost: (postId: string) => void;
  onAddReply: (postId: string, replyText: string) => void;
  onOpenNewPost: () => void;
  searchQuery: string;
}

const USER_COLORS = [
  '#00FF41', '#00E5FF', '#FFB000', '#FF6B6B', '#C084FC',
  '#34D399', '#F472B6', '#60A5FA', '#FB923C', '#A3E635',
];

function userColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return USER_COLORS[h % USER_COLORS.length];
}

function fmt(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtDate(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── Hub rail data ────────────────────────────────────────────────────────────

interface Hub { id: string; label: string; icon: React.ReactNode; route?: string; }

const HUBS: Hub[] = [
  { id: 'general', label: 'General', icon: <Bot className="w-5 h-5" /> },
  { id: 'models',    label: 'Models',    icon: <Sparkles className="w-5 h-5" />,  route: '/models'   },
  { id: 'tools',     label: 'Tools',     icon: <ShoppingBag className="w-5 h-5" />, route: '/'       },
  { id: 'workflows', label: 'Workflows', icon: <GitBranch className="w-5 h-5" />, route: '/workflows' },
  { id: 'news',      label: 'News',      icon: <Newspaper className="w-5 h-5" />, route: '/news'    },
];

// ── Channel sidebar data ─────────────────────────────────────────────────────

interface Channel { id: string; name: string; type: CommunityPostType | 'All'; }

const CHANNEL_GROUPS: { label: string; channels: Channel[] }[] = [
  {
    label: 'General',
    channels: [
      { id: 'ch-all',       name: 'all-discussions',    type: 'All'              },
      { id: 'ch-showcase',  name: 'showcases',           type: 'Showcase'         },
    ],
  },
  {
    label: 'Technical',
    channels: [
      { id: 'ch-reviews',   name: 'model-reviews',      type: 'Model Review'     },
      { id: 'ch-tips',      name: 'enhancement-tips',   type: 'Enhancement Tip'  },
    ],
  },
  {
    label: 'Support',
    channels: [
      { id: 'ch-support',   name: 'support-requests',   type: 'Support Request'  },
    ],
  },
];

// ── Mock members ─────────────────────────────────────────────────────────────

const MEMBERS = [
  { handle: 'quant_vance',      role: 'Engineer',     online: true  },
  { handle: 'lex_architect',    role: 'Contributor',  online: true  },
  { handle: 'neural_kim',       role: 'Moderator',    online: true  },
  { handle: 'prompt_wizard',    role: 'Member',       online: true  },
  { handle: 'inference_dev',    role: 'Member',       online: false },
  { handle: 'data_alchemist',   role: 'Member',       online: false },
  { handle: 'model_smith',      role: 'Member',       online: false },
];

// ── Mention renderer ─────────────────────────────────────────────────────────

function renderContent(text: string): React.ReactNode[] {
  return text.split(/(@\w+)/g).map((chunk, i) =>
    chunk.startsWith('@') ? (
      <span
        key={i}
        className="inline-block bg-[#00FF41]/15 text-[#00FF41] px-1.5 py-0.5 rounded font-semibold text-[0.82em] mx-0.5"
      >
        {chunk}
      </span>
    ) : <span key={i}>{chunk}</span>
  );
}

// ── Message component ─────────────────────────────────────────────────────────

interface MessageProps {
  post: CommunityPost;
  isFirst: boolean;
  onUpvote: (id: string) => void;
  onExpand: (id: string | null) => void;
  expanded: boolean;
  onAddReply: (id: string, text: string) => void;
  aiFeedback?: { loading: boolean; text: string | null };
  onAiFeedback: (post: CommunityPost) => void;
}

const Message: React.FC<MessageProps> = ({
  post, isFirst, onUpvote, onExpand, expanded, onAddReply, aiFeedback, onAiFeedback,
}) => {
  const [reply, setReply] = useState('');
  const color = userColor(post.author.handle);

  const sendReply = () => {
    if (!reply.trim()) return;
    onAddReply(post.id, reply);
    setReply('');
  };

  return (
    <div className={`group px-4 py-0.5 hover:bg-white/[0.02] transition-colors ${isFirst ? 'mt-4' : ''}`}>
      {isFirst ? (
        /* First in a consecutive run — show avatar + name */
        <div className="flex gap-3">
          <img src={post.author.avatar} alt={post.author.handle}
            className="w-10 h-10 rounded-full mt-0.5 shrink-0 object-cover" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="font-semibold text-sm leading-none" style={{ color }}>
                @{post.author.handle}
              </span>
              <span className="text-[10px] text-[#555] font-mono">{post.createdAt}</span>
              <span className="text-[9px] bg-[#1a1a1e] border border-[#2a2a2a] text-[#888] px-1.5 py-0.5 rounded font-mono uppercase">
                {post.type}
              </span>
            </div>
            <MessageBody
              post={post} onUpvote={onUpvote} onExpand={onExpand}
              expanded={expanded} onAddReply={onAddReply} aiFeedback={aiFeedback}
              onAiFeedback={onAiFeedback} reply={reply} setReply={setReply} sendReply={sendReply}
            />
          </div>
        </div>
      ) : (
        /* Collapsed follow-up — body only */
        <div className="pl-[52px]">
          <MessageBody
            post={post} onUpvote={onUpvote} onExpand={onExpand}
            expanded={expanded} onAddReply={onAddReply} aiFeedback={aiFeedback}
            onAiFeedback={onAiFeedback} reply={reply} setReply={setReply} sendReply={sendReply}
          />
        </div>
      )}
    </div>
  );
};

interface MessageBodyProps {
  post: CommunityPost;
  onUpvote: (id: string) => void;
  onExpand: (id: string | null) => void;
  expanded: boolean;
  onAddReply: (id: string, text: string) => void;
  aiFeedback?: { loading: boolean; text: string | null };
  onAiFeedback: (post: CommunityPost) => void;
  reply: string;
  setReply: (v: string) => void;
  sendReply: () => void;
}

const MessageBody: React.FC<MessageBodyProps> = ({
  post, onUpvote, onExpand, expanded, onAddReply,
  aiFeedback, onAiFeedback, reply, setReply, sendReply,
}) => (
  <div>
    {/* Title */}
    <p className="text-sm font-bold text-white mb-0.5">{post.title}</p>
    {/* Content */}
    <p className="text-sm text-[#c8c8c8] leading-relaxed whitespace-pre-line">
      {renderContent(post.content)}
    </p>

    {/* Target model tag */}
    {post.targetModelName && (
      <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono bg-[#0f1510] border border-[#00FF41]/25 text-[#00FF41] px-2 py-0.5 rounded">
        <Code className="w-3 h-3" /> {post.targetModelName}
      </div>
    )}

    {/* Code snippet */}
    {post.codeSnippet && (
      <pre className="mt-2 bg-[#0a0a0c] border border-[#2a2a2a] text-[11px] font-mono text-[#c8c8c8] p-3 rounded overflow-x-auto">
        {post.codeSnippet}
      </pre>
    )}

    {/* Tags */}
    <div className="flex flex-wrap gap-1 mt-1.5">
      {post.tags.map(t => (
        <span key={t} className="text-[9px] font-mono text-[#555] hover:text-[#888] cursor-pointer">#{t}</span>
      ))}
    </div>

    {/* AI feedback */}
    {aiFeedback?.loading && (
      <div className="mt-2 text-[11px] font-mono text-[#00FF41] animate-pulse flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 animate-spin" /> Analyzing...
      </div>
    )}
    {aiFeedback?.text && (
      <div className="mt-2 bg-[#080a08] border border-[#00FF41]/30 rounded p-3 text-xs font-mono text-[#c8c8c8] whitespace-pre-line">
        <span className="text-[#00FF41] font-bold block mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> AI Architect Review
        </span>
        {aiFeedback.text}
      </div>
    )}

    {/* Action row */}
    <div className="flex items-center gap-3 mt-2">
      <button onClick={() => onUpvote(post.id)}
        className={`flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded transition-all ${
          post.hasUpvoted
            ? 'bg-[#00FF41]/20 text-[#00FF41] font-bold'
            : 'text-[#666] hover:text-white hover:bg-white/10'
        }`}>
        <ThumbsUp className="w-3.5 h-3.5" /> {post.upvotes}
      </button>
      <button onClick={() => onExpand(expanded ? null : post.id)}
        className="flex items-center gap-1.5 text-[11px] text-[#666] hover:text-white transition-colors">
        <MessageSquare className="w-3.5 h-3.5" /> {post.replies.length} replies
      </button>
      <button onClick={() => onAiFeedback(post)}
        className="flex items-center gap-1 text-[10px] text-[#555] hover:text-[#00FF41] transition-colors font-mono ml-auto">
        <Sparkles className="w-3 h-3" /> AI Review
      </button>
    </div>

    {/* Thread replies */}
    {expanded && (
      <div className="mt-3 border-l-2 border-[#2a2a2a] pl-4 space-y-3">
        {post.replies.map(rep => (
          <div key={rep.id} className="flex gap-2">
            <img src={rep.author.avatar} alt={rep.author.handle}
              className="w-7 h-7 rounded-full shrink-0 object-cover mt-0.5" />
            <div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[11px] font-semibold" style={{ color: userColor(rep.author.handle) }}>
                  @{rep.author.handle}
                </span>
                <span className="text-[9px] text-[#555] font-mono">{rep.createdAt}</span>
              </div>
              <p className="text-xs text-[#aaa] leading-relaxed">{renderContent(rep.content)}</p>
            </div>
          </div>
        ))}

        {/* Reply input */}
        <div className="flex items-center gap-2 bg-[#1a1a1e] border border-[#2a2a2a] rounded p-2">
          <input
            className="flex-1 bg-transparent text-xs text-white placeholder-[#555] focus:outline-none"
            placeholder="Reply to thread…"
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendReply()}
          />
          <button onClick={sendReply} className="text-[#555] hover:text-[#00FF41] transition-colors">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts, onUpvotePost, onAddReply, onOpenNewPost, searchQuery,
}) => {
  const [activeHub,        setActiveHub]        = useState('general');
  const [activeChannel,    setActiveChannel]    = useState<Channel>(CHANNEL_GROUPS[0].channels[0]);
  const [collapsedGroups,  setCollapsedGroups]  = useState<Set<string>>(new Set());
  const [expandedPost,     setExpandedPost]     = useState<string | null>(null);
  const [showMembers,      setShowMembers]      = useState(true);
  const [showSidebar,      setShowSidebar]      = useState(false);
  const [composerText,     setComposerText]     = useState('');
  const [aiFeedbackMap,    setAiFeedbackMap]    = useState<Record<string, { loading: boolean; text: string | null }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* Filter posts by active channel */
  const visible = posts.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesType = activeChannel.type === 'All' || p.type === activeChannel.type;
    const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  /* Scroll to bottom when channel changes */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannel.id]);

  /* Collapse toggle */
  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  /* AI feedback */
  const handleAiFeedback = useCallback(async (post: CommunityPost) => {
    setAiFeedbackMap(prev => ({ ...prev, [post.id]: { loading: true, text: null } }));
    const text = await generateEnhancementTips(post.title, post.content, post.codeSnippet);
    setAiFeedbackMap(prev => ({ ...prev, [post.id]: { loading: false, text } }));
  }, []);

  /* Composer submit — creates new post stub */
  const handleComposerSend = () => {
    if (!composerText.trim()) return;
    onOpenNewPost();
    setComposerText('');
  };

  /* Members */
  const online  = MEMBERS.filter(m => m.online);
  const offline = MEMBERS.filter(m => !m.online);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#080809] min-h-0">

      {/* ── 1. Hub rail ─────────────────────────────────────────────────── */}
      <div className="w-[72px] shrink-0 bg-[#060607] flex flex-col items-center pt-3 pb-3 gap-2 overflow-y-auto border-r border-[#111]">
        {HUBS.map(hub => {
          const isActive = activeHub === hub.id;
          const Wrapper: React.ElementType = hub.route && !isActive ? Link : 'button';
          const wrapperProps: any = hub.route && !isActive
            ? { to: hub.route }
            : { onClick: () => setActiveHub(hub.id) };

          return (
            <div key={hub.id} className="relative group/hub flex items-center justify-center">
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 w-1 h-8 bg-white rounded-r-full -translate-x-1" />
              )}
              <Wrapper
                {...wrapperProps}
                title={hub.label}
                className={`flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'w-12 h-12 rounded-2xl bg-[#00FF41] text-black'
                    : 'w-12 h-12 rounded-full bg-[#1a1a1e] text-[#888] hover:rounded-2xl hover:bg-[#2a2a2e] hover:text-white'
                }`}
              >
                {hub.icon}
              </Wrapper>
              {/* Tooltip */}
              <div className="absolute left-[68px] px-2 py-1 bg-[#18191c] text-white text-xs font-bold rounded
                shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover/hub:opacity-100 transition-opacity z-50">
                {hub.label}
              </div>
            </div>
          );
        })}

        {/* Divider */}
        <div className="w-8 h-px bg-[#2a2a2a] my-1" />

        {/* New post button */}
        <div className="relative group/hub flex items-center justify-center">
          <button
            onClick={onOpenNewPost}
            title="New Post"
            className="w-12 h-12 rounded-full bg-[#1a1a1e] text-[#00FF41] hover:rounded-2xl hover:bg-[#00FF41] hover:text-black transition-all duration-200 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="absolute left-[68px] px-2 py-1 bg-[#18191c] text-white text-xs font-bold rounded
            shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover/hub:opacity-100 transition-opacity z-50">
            New Post
          </div>
        </div>
      </div>

      {/* ── 2. Channel sidebar (desktop always visible, mobile drawer) ───── */}
      <>
        {/* Mobile overlay */}
        {showSidebar && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setShowSidebar(false)} />
        )}

        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative top-0 left-0 bottom-0 z-40
          w-60 shrink-0 bg-[#0e0f10] flex flex-col border-r border-[#1a1a1e]
          transition-transform duration-200
        `}>
          {/* Sidebar header */}
          <div className="px-4 h-12 flex items-center justify-between border-b border-[#1a1a1e] shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Bin Bag Community</span>
              <ChevronDown className="w-4 h-4 text-[#555]" />
            </div>
            <button onClick={() => setShowSidebar(false)} className="md:hidden text-[#555] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick links */}
          <div className="px-2 py-2 border-b border-[#1a1a1e] shrink-0">
            <button
              onClick={onOpenNewPost}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[#aaa] text-xs hover:bg-white/5 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Post
            </button>
            <button
              onClick={() => setShowMembers(v => !v)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[#aaa] text-xs hover:bg-white/5 hover:text-white transition-colors"
            >
              <Users className="w-3.5 h-3.5" /> Members
            </button>
          </div>

          {/* Channel groups */}
          <div className="flex-1 overflow-y-auto py-2 min-h-0">
            {CHANNEL_GROUPS.map(group => {
              const collapsed = collapsedGroups.has(group.label);
              return (
                <div key={group.label} className="mb-1">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#555] hover:text-[#aaa] transition-colors"
                  >
                    <ChevronRight className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
                    {group.label}
                  </button>
                  {!collapsed && group.channels.map(ch => {
                    const isActive = activeChannel.id === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => { setActiveChannel(ch); setShowSidebar(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded mx-1 text-sm transition-colors ${
                          isActive
                            ? 'bg-white/10 text-white font-semibold'
                            : 'text-[#666] hover:bg-white/5 hover:text-[#bbb]'
                        }`}
                      >
                        <Hash className="w-4 h-4 shrink-0" />
                        <span className="truncate text-xs">{ch.name}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* User strip */}
          <div className="px-2 py-2 bg-[#09090a] border-t border-[#1a1a1e] flex items-center gap-2 shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1e] flex items-center justify-center text-[#00FF41] font-bold text-xs shrink-0">
                YU
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00FF41] border-2 border-[#09090a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white truncate">You</p>
              <p className="text-[9px] text-[#555]">Online</p>
            </div>
            <button title="Settings" className="text-[#555] hover:text-white transition-colors">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </>

      {/* ── 3. Message / thread view ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Channel header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-[#1a1a1e] bg-[#080809] shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setShowSidebar(true)} className="md:hidden text-[#555] hover:text-white mr-1">
              <Menu className="w-5 h-5" />
            </button>
            <Hash className="w-5 h-5 text-[#555]" />
            <span className="font-bold text-white text-sm">{activeChannel.name}</span>
          </div>
          <div className="flex items-center gap-3 text-[#555]">
            <button title="Search" className="hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
            <button title="Notifications" className="hover:text-white transition-colors"><Bell className="w-4 h-4" /></button>
            <button title="Pinned" className="hover:text-white transition-colors"><Pin className="w-4 h-4" /></button>
            <button
              title="Member List"
              onClick={() => setShowMembers(v => !v)}
              className={`transition-colors ${showMembers ? 'text-white' : 'hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-2">
          {/* Channel welcome header */}
          <div className="px-6 pt-10 pb-4 border-b border-[#1a1a1e] mb-2">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1e] flex items-center justify-center mb-3">
              <Hash className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome to #{activeChannel.name}</h2>
            <p className="text-sm text-[#666]">
              This is the beginning of the <strong className="text-[#aaa]">#{activeChannel.name}</strong> channel.
              Share your work, ask questions, and engage with the community.
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="px-6 py-8 text-center text-[#555] text-sm">No posts yet. Be the first!</div>
          ) : (
            visible.map((post, idx) => {
              const prevPost = visible[idx - 1];
              /* Collapse if same author within same day */
              const isFirst = !prevPost || prevPost.author.handle !== post.author.handle;
              /* Date divider */
              const showDateDivider = !prevPost || fmtDate(prevPost.createdAt) !== fmtDate(post.createdAt);

              return (
                <React.Fragment key={post.id}>
                  {showDateDivider && (
                    <div className="flex items-center gap-3 px-4 my-4">
                      <div className="flex-1 h-px bg-[#1e1e1e]" />
                      <span className="text-[10px] font-semibold text-[#555] whitespace-nowrap px-2">
                        {fmtDate(post.createdAt)}
                      </span>
                      <div className="flex-1 h-px bg-[#1e1e1e]" />
                    </div>
                  )}
                  <Message
                    post={post}
                    isFirst={isFirst}
                    onUpvote={onUpvotePost}
                    onExpand={setExpandedPost}
                    expanded={expandedPost === post.id}
                    onAddReply={onAddReply}
                    aiFeedback={aiFeedbackMap[post.id]}
                    onAiFeedback={handleAiFeedback}
                  />
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="px-4 pb-4 pt-2 shrink-0">
          <div className="flex items-center gap-2 bg-[#1a1a1e] border border-[#2a2a2a] rounded-lg px-3 py-2 focus-within:border-[#444] transition-colors">
            <button onClick={onOpenNewPost} title="New post" className="text-[#555] hover:text-white transition-colors shrink-0">
              <Plus className="w-5 h-5" />
            </button>
            <input
              className="flex-1 bg-transparent text-sm text-white placeholder-[#555] focus:outline-none"
              placeholder={`Message #${activeChannel.name}`}
              value={composerText}
              onChange={e => setComposerText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComposerSend()}
            />
            <button
              onClick={handleComposerSend}
              className={`shrink-0 transition-colors ${composerText.trim() ? 'text-[#00FF41] hover:text-white' : 'text-[#444]'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Member sidebar ────────────────────────────────────────────── */}
      {showMembers && (
        <div className="w-60 shrink-0 bg-[#0e0f10] border-l border-[#1a1a1e] flex flex-col overflow-y-auto hidden lg:flex">
          {/* Online */}
          <div className="px-4 pt-5 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#555] mb-2">
              Online — {online.length}
            </p>
            <div className="space-y-1">
              {online.map(m => (
                <div key={m.handle} className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-white/5 cursor-pointer group">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center"
                      style={{ boxShadow: `0 0 0 2px ${userColor(m.handle)}40` }}>
                      <span className="text-[11px] font-bold" style={{ color: userColor(m.handle) }}>
                        {m.handle[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00FF41] border-2 border-[#0e0f10]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#ddd] truncate group-hover:text-white">@{m.handle}</p>
                    <p className="text-[9px] text-[#555] truncate">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offline */}
          <div className="px-4 pt-3 pb-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#444] mb-2">
              Offline — {offline.length}
            </p>
            <div className="space-y-1">
              {offline.map(m => (
                <div key={m.handle} className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-white/5 cursor-pointer group opacity-50">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center">
                      <span className="text-[11px] font-bold text-[#555]">
                        {m.handle[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#555] border-2 border-[#0e0f10]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#666] truncate">@{m.handle}</p>
                    <p className="text-[9px] text-[#444] truncate">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};