import React, { useState } from 'react';
import { CommunityPost, CommunityPostType } from '../types';
import { ThumbsUp, MessageSquare, Sparkles, Terminal, Code, HelpCircle, Eye, ShieldCheck, CornerDownRight } from 'lucide-react';
import { generateEnhancementTips } from '../services/geminiService';

interface CommunityViewProps {
  posts: CommunityPost[];
  onUpvotePost: (postId: string) => void;
  onAddReply: (postId: string, replyText: string) => void;
  onOpenNewPost: () => void;
  searchQuery: string;
}

const POST_TYPES: Array<{ label: string; value: CommunityPostType | 'All' }> = [
  { label: 'All Discussions', value: 'All' },
  { label: 'Model Reviews', value: 'Model Review' },
  { label: 'Enhancement Tips', value: 'Enhancement Tip' },
  { label: 'Support Requests', value: 'Support Request' },
  { label: 'Showcases', value: 'Showcase' },
];

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  onUpvotePost,
  onAddReply,
  onOpenNewPost,
  searchQuery,
}) => {
  const [selectedType, setSelectedType] = useState<CommunityPostType | 'All'>('All');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  
  // AI Feedback state per post
  const [aiFeedbackMap, setAiFeedbackMap] = useState<Record<string, { loading: boolean; text: string | null }>>({});

  const filteredPosts = posts.filter(post => {
    const matchesType = selectedType === 'All' || post.type === selectedType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      post.tags.some(t => t.toLowerCase().includes(q)) ||
      (post.targetModelName && post.targetModelName.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  const handleGenerateAiFeedback = async (post: CommunityPost) => {
    setAiFeedbackMap(prev => ({ ...prev, [post.id]: { loading: true, text: null } }));
    const resultText = await generateEnhancementTips(post.title, post.content, post.codeSnippet);
    setAiFeedbackMap(prev => ({ ...prev, [post.id]: { loading: false, text: resultText } }));
  };

  const handleSendReply = (postId: string) => {
    if (!replyInput.trim()) return;
    onAddReply(postId, replyInput);
    setReplyInput('');
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto">
      
      {/* Section Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FF41] mb-2 block">OPEN REVIEW & ENHANCEMENT NETWORK</span>
          <h1 className="text-3xl sm:text-4xl font-serif italic mb-2 text-white">Collective Brain</h1>
          <p className="text-[#888888] text-sm max-w-xl">
            A peer community for ML engineers and prompt architects to submit model weights, fine-tunes, and workflows for code review, enhancement tips, and technical support.
          </p>
        </div>

        <button
          onClick={onOpenNewPost}
          className="bg-white hover:bg-neutral-200 text-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2"
        >
          <Code className="w-4 h-4 text-black" />
          <span>Submit Model For Review</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {POST_TYPES.map(pt => (
          <button
            key={pt.value}
            onClick={() => setSelectedType(pt.value)}
            className={`px-3 py-1.5 uppercase tracking-wider text-[11px] font-semibold transition-all border ${
              selectedType === pt.value
                ? 'bg-white text-black border-white'
                : 'bg-[#121214] text-[#888888] border-[#262626] hover:text-white hover:border-[#555]'
            }`}
          >
            {pt.label}
          </button>
        ))}
      </div>

      {/* Posts List matching theme spec */}
      <div className="space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="bg-[#121214] border border-[#262626] p-12 text-center my-8">
            <HelpCircle className="w-8 h-8 text-[#555] mx-auto mb-3" />
            <p className="text-white font-medium text-sm">No community discussions found matching your filter.</p>
            <p className="text-[#888888] text-xs mt-1">Be the first to submit a model for community review!</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const feedbackState = aiFeedbackMap[post.id];
            const isExpanded = activeThreadId === post.id;

            return (
              <div
                key={post.id}
                className="bg-[#121214] border border-[#262626] hover:border-[#383838] p-6 transition-all"
              >
                {/* Author Bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#262626]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">@{post.author.handle}</span>
                        <span className="text-[10px] bg-[#0A0A0B] border border-[#262626] text-[#888888] px-2 py-0.2 font-mono">
                          {post.author.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#555] font-mono">{post.createdAt}</span>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase tracking-widest text-[#00FF41] font-mono font-bold bg-[#0D0D0E] border border-[#262626] px-2.5 py-1">
                    {post.type}
                  </span>
                </div>

                {/* Post Title */}
                <h2 className="text-lg font-semibold text-white mb-2 leading-snug">
                  {post.title}
                </h2>

                {/* Target Model Tag if present */}
                {post.targetModelName && (
                  <div className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-mono text-[#00FF41] bg-[#0A0A0B] border border-[#262626] px-2 py-0.5">
                    <Terminal className="w-3 h-3" />
                    <span>Target: {post.targetModelName}</span>
                  </div>
                )}

                {/* Post Content */}
                <p className="text-xs text-[#E2E2E2] mb-4 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Optional Code Snippet */}
                {post.codeSnippet && (
                  <div className="mb-4 bg-[#080809] border border-[#262626] p-3 text-xs font-mono text-[#00FF41] overflow-x-auto relative rounded-xs">
                    <div className="text-[9px] uppercase tracking-wider text-[#555] mb-1 font-sans border-b border-[#1a1a1d] pb-1 flex justify-between">
                      <span>Code / Architecture Snippet</span>
                      <span>UTF-8</span>
                    </div>
                    <pre className="text-[11px] leading-relaxed text-[#E2E2E2] font-mono">
                      {post.codeSnippet}
                    </pre>
                  </div>
                )}

                {/* Post Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {post.tags.map(t => (
                    <span key={t} className="text-[9px] bg-[#0A0A0B] border border-[#262626] text-[#888888] px-2 py-0.5 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* AI Review Trigger Output Box if generated */}
                {feedbackState?.loading && (
                  <div className="mb-4 bg-[#0A0A0B] border border-[#00FF41] p-4 text-xs font-mono text-[#00FF41] animate-pulse">
                    <Sparkles className="w-4 h-4 inline mr-2 animate-spin text-[#00FF41]" />
                    Analyzing model architecture & synthesizing optimization tips...
                  </div>
                )}

                {feedbackState?.text && (
                  <div className="mb-4 bg-[#080809] border border-[#00FF41] p-4 text-xs font-mono text-[#E2E2E2] rounded-xs relative">
                    <div className="flex items-center justify-between border-b border-[#262626] pb-2 mb-2">
                      <span className="text-[10px] font-bold text-[#00FF41] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Architect Automated Enhancement Analysis
                      </span>
                      <span className="text-[9px] text-[#555]">Gemini-2.5-Flash</span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-line text-[#E2E2E2]">
                      {feedbackState.text}
                    </p>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1d] text-xs">
                  <div className="flex items-center gap-4">
                    {/* Upvote Button */}
                    <button
                      onClick={() => onUpvotePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1 border transition-colors ${
                        post.hasUpvoted
                          ? 'bg-[#00FF41] text-black border-[#00FF41] font-bold'
                          : 'bg-[#0D0D0E] text-white border-[#262626] hover:border-[#555]'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.upvotes} Upvotes</span>
                    </button>

                    {/* Replies Toggle */}
                    <button
                      onClick={() => setActiveThreadId(isExpanded ? null : post.id)}
                      className="flex items-center gap-1.5 text-xs text-[#888888] hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.replies.length} Replies</span>
                    </button>
                  </div>

                  {/* AI Enhancement Review Button */}
                  <button
                    onClick={() => handleGenerateAiFeedback(post)}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-mono text-[#00FF41] hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Review</span>
                  </button>
                </div>

                {/* Thread Replies Section */}
                {isExpanded && (
                  <div className="mt-6 pt-5 border-t border-[#262626] bg-[#0A0A0B] p-4 rounded-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-[#00FF41]" />
                      <span>Discussion Thread ({post.replies.length})</span>
                    </h4>

                    {/* Replies List */}
                    <div className="space-y-3 mb-4">
                      {post.replies.length === 0 ? (
                        <p className="text-xs text-[#555] italic">No replies yet. Start the conversation below.</p>
                      ) : (
                        post.replies.map(rep => (
                          <div key={rep.id} className="bg-[#121214] border border-[#262626] p-3 text-xs">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <img
                                  src={rep.author.avatar}
                                  alt={rep.author.name}
                                  className="w-5 h-5 rounded-full"
                                />
                                <span className="font-bold text-white text-[11px]">@{rep.author.handle}</span>
                              </div>
                              <span className="text-[9px] text-[#555] font-mono">{rep.createdAt}</span>
                            </div>
                            <p className="text-xs text-[#888888] leading-relaxed">{rep.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Reply Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        placeholder="Add your review, tip, or feedback..."
                        className="flex-1 bg-[#121214] border border-[#262626] text-xs text-white p-2 focus:outline-none focus:border-[#555]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendReply(post.id);
                        }}
                      />
                      <button
                        onClick={() => handleSendReply(post.id)}
                        className="bg-white hover:bg-neutral-200 text-black px-4 text-xs font-bold uppercase tracking-wider"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
