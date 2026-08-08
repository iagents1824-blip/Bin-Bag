import React, { useState } from 'react';
import { CommunityPost, CommunityPostType } from '../types';
import { X, Code, Sparkles, MessageSquare } from 'lucide-react';

interface NewPostModalProps {
  onClose: () => void;
  onAddPost: (post: CommunityPost) => void;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({ onClose, onAddPost }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CommunityPostType>('Model Review');
  const [targetModelName, setTargetModelName] = useState('');
  const [content, setContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [tagsInput, setTagsInput] = useState('CodeReview, Llama3, FineTune');
  const [handle, setHandle] = useState('ml_engineer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      title,
      author: {
        name: handle.toUpperCase(),
        handle,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'AI Contributor',
      },
      type,
      content,
      codeSnippet: codeSnippet.trim() || undefined,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      upvotes: 1,
      hasUpvoted: true,
      repliesCount: 0,
      createdAt: 'Just now',
      replies: [],
      targetModelName: targetModelName.trim() || undefined,
    };

    onAddPost(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D0D0E] border border-[#262626] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#262626] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#00FF41]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              SUBMIT MODEL FOR COMMUNITY REVIEW & TIPS
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-[#888888] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-mono flex-1">
          
          <div>
            <label className="text-[10px] text-[#888888] uppercase block mb-1">Post Title / Question *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Seeking peer review on 4-bit Llama-3.3 70B quantization loss"
              className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#888888] uppercase block mb-1">Topic Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CommunityPostType)}
                className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
              >
                <option value="Model Review">Model Review</option>
                <option value="Enhancement Tip">Enhancement Tip</option>
                <option value="Support Request">Support Request</option>
                <option value="Showcase">Showcase</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#888888] uppercase block mb-1">Target Model Name (Optional)</label>
              <input
                type="text"
                value={targetModelName}
                onChange={(e) => setTargetModelName(e.target.value)}
                placeholder="e.g. Llama-3.3-70B, DeepSeek-R1"
                className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase block mb-1">Discussion / Model Description *</label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detail your architecture, benchmark perplexity scores, or support question..."
              className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase block mb-1">Code / Config Snippet (Optional)</label>
            <textarea
              rows={3}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Paste Modelfile, Python orchestration, or system prompt..."
              className="w-full bg-[#0A0A0B] border border-[#262626] text-[#00FF41] p-2.5 focus:outline-none focus:border-[#555]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase block mb-1">Tags (Comma Separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#262626] text-white p-2.5 focus:outline-none focus:border-[#555]"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#262626]">
            <button
              type="submit"
              className="w-full bg-white hover:bg-neutral-200 text-black font-sans font-bold text-xs py-3 uppercase tracking-wider transition-colors"
            >
              Post Discussion To Community
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
