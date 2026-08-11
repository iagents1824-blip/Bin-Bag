import React, { useState } from 'react';
import { CommunityPost, CommunityPostType } from '../types';
import { X, Send, Sparkles } from 'lucide-react';

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
  const [tags, setTags] = useState('LLM, Optimization');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      title,
      type,
      targetModelName: targetModelName || undefined,
      content,
      codeSnippet: codeSnippet || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      author: {
        name: 'You',
        handle: 'you',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        role: 'Member',
      },
      upvotes: 1,
      hasUpvoted: true,
      repliesCount: 0,
      createdAt: 'Just now',
      replies: [],
    };

    onAddPost(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-gray-200 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#0A0A0A] max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] block mb-1">
              COMMUNITY DISCUSSIONS
            </span>
            <h2 className="text-xl font-black text-[#0A0A0A]">Create Forum Post</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Post Title *</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Fine-tuning Llama-3.3 on financial disclosures"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Post Category</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Model Review">Model Review</option>
                <option value="Enhancement Tip">Enhancement Tip</option>
                <option value="Showcase">Showcase</option>
                <option value="Support Request">Support Request</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Target Model Name</label>
              <input
                value={targetModelName}
                onChange={e => setTargetModelName(e.target.value)}
                placeholder="e.g. Claude-3.5-Sonnet"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Content *</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your findings, benchmarks, or question..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Code Snippet (Optional)</label>
            <textarea
              rows={2}
              value={codeSnippet}
              onChange={e => setCodeSnippet(e.target.value)}
              placeholder="Python/JS code..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Llama-3, Fine-tune, Benchmarks"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#0A0A0A] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Post to Forum</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};