import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CommunityPost, CommunityPostType } from '../types';
import {
  Hash, ShoppingBag, Newspaper, GitBranch, Sparkles, ChevronDown,
  Search, Bell, Pin, Users, Plus, Settings, ThumbsUp, MessageSquare,
  Send, Code, Menu, X, ChevronRight, Bot
} from 'lucide-react';
import { generateEnhancementTips } from '../services/geminiService';
import { Link } from 'react-router-dom';

interface CommunityViewProps {
  posts: CommunityPost[];
  onUpvotePost: (postId: string) => void;
  onAddReply: (postId: string, replyText: string) => void;
  onOpenNewPost: () => void;
  searchQuery: string;
}

const USER_COLORS = [
  '#4F46E5', '#2563EB', '#059669', '#D97706', '#DC2626',
  '#7C3AED', '#DB2777', '#0284C7', '#EA580C', '#65A30D',
];

function userColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return USER_COLORS[h % USER_COLORS.length];
}

function fmtDate(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface Hub { id: string; label: string; icon: React.ReactNode; route?: string; }

const HUBS: Hub[] = [
  { id: 'general', label: 'General', icon: <Bot className="w-5 h-5" /> },
  { id: 'models',    label: 'Models',    icon: <Sparkles className="w-5 h-5" />,  route: '/models'   },
  { id: 'tools',     label: 'Tools',     icon: <ShoppingBag className="w-5 h-5" />, route: '/'       },
  { id: 'workflows', label: 'Workflows', icon: <GitBranch className="w-5 h-5" />, route: '/workflows' },
  { id: 'news',      label: 'News',      icon: <Newspaper className="w-5 h-5" />, route: '/news'    },
];

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

const MEMBERS = [
  { handle: 'quant_vance',      role: 'Engineer',     online: true  },
  { handle: 'lex_architect',    role: 'Contributor',  online: true  },
  { handle: 'neural_kim',       role: 'Moderator',    online: true  },
  { handle: 'prompt_wizard',    role: 'Member',       online: true  },
  { handle: 'inference_dev',    role: 'Member',       online: false },
  { handle: 'data_alchemist',   role: 'Member',       online: false },
  { handle: 'model_smith',      role: 'Member',       online: false },
];

function renderContent(text: string): React.ReactNode[] {
  return text.split(/(@\w+)/g).map((chunk, i) =>
    chunk.startsWith('@') ? (
      <span
        key={i}
        className="inline-block bg-indigo-50 text-[#4F46E5] font-semibold px-1.5 py-0.5 rounded text-[0.85em] mx-0.5"
      >
        {chunk}
      </span>
    ) : <span key={i}>{chunk}</span>
  );
}

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
    <div className={`group px-4 py-2 hover:bg-gray-50/80 transition-colors ${isFirst ? 'mt-3' : ''}`}>
      {isFirst ? (
        <div className="flex gap-3">
          <img src={post.author.avatar} alt={post.author.handle}
            className="w-10 h-10 rounded-full mt-0.5 shrink-0 object-cover border border-gray-200" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-bold text-sm leading-none" style={{ color }}>
                @{post.author.handle}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">{post.createdAt}</span>
              <span className="text-[9px] bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold uppercase">
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
    <p className="text-sm font-bold text-[#0A0A0A] mb-1">{post.title}</p>
    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
      {renderContent(post.content)}
    </p>

    {post.targetModelName && (
      <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 border border-indigo-200 text-[#4F46E5] px-2.5 py-0.5 rounded-full">
        <Code className="w-3 h-3" /> {post.targetModelName}
      </div>
    )}

    {post.codeSnippet && (
      <pre className="mt-2 bg-gray-900 text-gray-100 border border-gray-800 text-xs font-mono p-3 rounded-xl overflow-x-auto">
        {post.codeSnippet}
      </pre>
    )}

    <div className="flex flex-wrap gap-1.5 mt-2">
      {post.tags.map(t => (
        <span key={t} className="text-[10px] bg-gray-100 border border-gray-200 text-gray-600 font-medium px-2 py-0.5 rounded-full cursor-pointer hover:bg-gray-200">
          #{t}
        </span>
      ))}
    </div>

    {aiFeedback?.loading && (
      <div className="mt-2 text-xs font-semibold text-[#4F46E5] animate-pulse flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 animate-spin" /> AI Architect is reviewing...
      </div>
    )}
    {aiFeedback?.text && (
      <div className="mt-2 bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 text-xs text-gray-800 whitespace-pre-line">
        <span className="text-[#4F46E5] font-bold block mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> AI Architect Review
        </span>
        {aiFeedback.text}
      </div>
    )}

    <div className="flex items-center gap-3 mt-3">
      <button onClick={() => onUpvote(post.id)}
        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl transition-all ${
          post.hasUpvoted
            ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-200'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}>
        <ThumbsUp className="w-3.5 h-3.5" /> {post.upvotes}
      </button>
      <button onClick={() => onExpand(expanded ? null : post.id)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <MessageSquare className="w-3.5 h-3.5" /> {post.replies.length} replies
      </button>
      <button onClick={() => onAiFeedback(post)}
        className="flex items-center gap-1 text-xs font-bold text-[#4F46E5] hover:text-indigo-800 transition-colors ml-auto">
        <Sparkles className="w-3.5 h-3.5" /> AI Review
      </button>
    </div>

    {expanded && (
      <div className="mt-3 border-l-2 border-gray-200 pl-4 space-y-3">
        {post.replies.map(rep => (
          <div key={rep.id} className="flex gap-2">
            <img src={rep.author.avatar} alt={rep.author.handle}
              className="w-7 h-7 rounded-full shrink-0 object-cover mt-0.5 border border-gray-200" />
            <div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-xs font-bold" style={{ color: userColor(rep.author.handle) }}>
                  @{rep.author.handle}
                </span>
                <span className="text-[10px] text-gray-400">{rep.createdAt}</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{renderContent(rep.content)}</p>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2">
          <input
            className="flex-1 bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
            placeholder="Reply to thread…"
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendReply()}
          />
          <button onClick={sendReply} className="text-gray-400 hover:text-[#4F46E5] transition-colors">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )}
  </div>
);

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

  const visible = posts.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesType = activeChannel.type === 'All' || p.type === activeChannel.type;
    const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannel.id]);

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const handleAiFeedback = useCallback(async (post: CommunityPost) => {
    setAiFeedbackMap(prev => ({ ...prev, [post.id]: { loading: true, text: null } }));
    const text = await generateEnhancementTips(post.title, post.content, post.codeSnippet);
    setAiFeedbackMap(prev => ({ ...prev, [post.id]: { loading: false, text } }));
  }, []);

  const handleComposerSend = () => {
    if (!composerText.trim()) return;
    onOpenNewPost();
    setComposerText('');
  };

  const online  = MEMBERS.filter(m => m.online);
  const offline = MEMBERS.filter(m => !m.online);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F0EFE9] text-[#0A0A0A] min-h-0">

      {/* ── 1. Hub rail ─────────────────────────────────────────────────── */}
      <div className="w-[72px] shrink-0 bg-white border-r border-gray-200/80 flex flex-col items-center pt-4 pb-4 gap-3 overflow-y-auto">
        {HUBS.map(hub => {
          const isActive = activeHub === hub.id;
          const Wrapper: React.ElementType = hub.route && !isActive ? Link : 'button';
          const wrapperProps: any = hub.route && !isActive
            ? { to: hub.route }
            : { onClick: () => setActiveHub(hub.id) };

          return (
            <div key={hub.id} className="relative group/hub flex items-center justify-center">
              {isActive && (
                <span className="absolute left-0 w-1 h-8 bg-[#0A0A0A] rounded-r-full -translate-x-1" />
              )}
              <Wrapper
                {...wrapperProps}
                title={hub.label}
                className={`flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'w-12 h-12 rounded-2xl bg-[#0A0A0A] text-white shadow-sm'
                    : 'w-12 h-12 rounded-full bg-gray-100 text-gray-500 hover:rounded-2xl hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {hub.icon}
              </Wrapper>
              <div className="absolute left-[72px] px-2.5 py-1 bg-[#0A0A0A] text-white text-xs font-bold rounded-xl shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover/hub:opacity-100 transition-opacity z-50">
                {hub.label}
              </div>
            </div>
          );
        })}

        <div className="w-8 h-px bg-gray-200 my-1" />

        <div className="relative group/hub flex items-center justify-center">
          <button
            onClick={onOpenNewPost}
            title="New Post"
            className="w-12 h-12 rounded-full bg-indigo-50 text-[#4F46E5] hover:rounded-2xl hover:bg-[#4F46E5] hover:text-white transition-all duration-200 flex items-center justify-center border border-indigo-200"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="absolute left-[72px] px-2.5 py-1 bg-[#0A0A0A] text-white text-xs font-bold rounded-xl shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover/hub:opacity-100 transition-opacity z-50">
            New Post
          </div>
        </div>
      </div>

      {/* ── 2. Channel sidebar ─────────────────────────────────────────── */}
      <>
        {showSidebar && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden" onClick={() => setShowSidebar(false)} />
        )}

        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative top-0 left-0 bottom-0 z-40
          w-60 shrink-0 bg-gray-50/70 border-r border-gray-200/80 flex flex-col
          transition-transform duration-200
        `}>
          <div className="px-4 h-14 flex items-center justify-between border-b border-gray-200/80 shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0A0A0A] text-sm">Community Forum</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-400 hover:text-gray-900">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-3 border-b border-gray-200/80 shrink-0 space-y-1">
            <button
              onClick={onOpenNewPost}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 text-xs font-semibold hover:bg-white hover:shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 text-[#4F46E5]" /> Create Post
            </button>
            <button
              onClick={() => setShowMembers(v => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 text-xs font-semibold hover:bg-white hover:shadow-xs transition-all"
            >
              <Users className="w-4 h-4 text-gray-400" /> Member Directory
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 min-h-0 px-2 space-y-3">
            {CHANNEL_GROUPS.map(group => {
              const collapsed = collapsedGroups.has(group.label);
              return (
                <div key={group.label}>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-colors"
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
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#0A0A0A] text-white shadow-xs'
                            : 'text-gray-600 hover:bg-white hover:text-gray-900'
                        }`}
                      >
                        <Hash className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span className="truncate">{ch.name}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="px-3 py-3 bg-white border-t border-gray-200/80 flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                YU
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">You</p>
              <p className="text-[10px] text-gray-400">Online</p>
            </div>
            <button title="Settings" className="text-gray-400 hover:text-gray-700 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </>

      {/* ── 3. Message feed ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white">

        <div className="h-14 px-6 flex items-center justify-between border-b border-gray-200/80 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(true)} className="md:hidden text-gray-400 hover:text-gray-900 mr-1">
              <Menu className="w-5 h-5" />
            </button>
            <Hash className="w-5 h-5 text-[#4F46E5]" />
            <span className="font-bold text-[#0A0A0A] text-sm">{activeChannel.name}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <button title="Search" className="hover:text-gray-900 transition-colors"><Search className="w-4 h-4" /></button>
            <button title="Notifications" className="hover:text-gray-900 transition-colors"><Bell className="w-4 h-4" /></button>
            <button title="Pinned" className="hover:text-gray-900 transition-colors"><Pin className="w-4 h-4" /></button>
            <button
              title="Member List"
              onClick={() => setShowMembers(v => !v)}
              className={`transition-colors ${showMembers ? 'text-[#0A0A0A]' : 'hover:text-gray-900'}`}
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pb-4">
          <div className="px-6 pt-8 pb-6 border-b border-gray-100 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
              <Hash className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <h2 className="text-2xl font-black text-[#0A0A0A] mb-1">Welcome to #{activeChannel.name}</h2>
            <p className="text-xs text-gray-500 max-w-xl">
              This is the official discussion feed for <strong className="text-gray-800">#{activeChannel.name}</strong>.
              Post questions, share code snippets, and review community models.
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm font-medium">No posts in this channel yet.</div>
          ) : (
            visible.map((post, idx) => {
              const prevPost = visible[idx - 1];
              const isFirst = !prevPost || prevPost.author.handle !== post.author.handle;
              const showDateDivider = !prevPost || fmtDate(prevPost.createdAt) !== fmtDate(post.createdAt);

              return (
                <React.Fragment key={post.id}>
                  {showDateDivider && (
                    <div className="flex items-center gap-3 px-4 my-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap px-2 uppercase tracking-wider">
                        {fmtDate(post.createdAt)}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
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

        <div className="px-4 pb-4 pt-2 shrink-0 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#4F46E5] focus-within:bg-white transition-all shadow-xs">
            <button onClick={onOpenNewPost} title="New post" className="text-gray-400 hover:text-gray-800 transition-colors shrink-0">
              <Plus className="w-5 h-5 text-[#4F46E5]" />
            </button>
            <input
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              placeholder={`Message #${activeChannel.name}…`}
              value={composerText}
              onChange={e => setComposerText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComposerSend()}
            />
            <button
              onClick={handleComposerSend}
              className={`shrink-0 transition-colors ${composerText.trim() ? 'text-[#4F46E5] hover:text-indigo-800' : 'text-gray-300'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Member sidebar ────────────────────────────────────────────── */}
      {showMembers && (
        <div className="w-60 shrink-0 bg-gray-50/70 border-l border-gray-200/80 flex flex-col overflow-y-auto hidden lg:flex">
          <div className="px-4 pt-5 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Online — {online.length}
            </p>
            <div className="space-y-1">
              {online.map(m => (
                <div key={m.handle} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white transition-colors cursor-pointer group">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <span className="text-xs font-bold" style={{ color: userColor(m.handle) }}>
                        {m.handle[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate group-hover:text-[#4F46E5]">@{m.handle}</p>
                    <p className="text-[10px] text-gray-400 truncate">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 pt-3 pb-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Offline — {offline.length}
            </p>
            <div className="space-y-1">
              {offline.map(m => (
                <div key={m.handle} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white transition-colors cursor-pointer group opacity-60">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-400">
                        {m.handle[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 truncate">@{m.handle}</p>
                    <p className="text-[10px] text-gray-400 truncate">{m.role}</p>
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