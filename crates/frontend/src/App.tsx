import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MarketplaceAsset, CommunityPost, DirectoryItem, NewsItem, VaultPurchase } from './types';
import { INITIAL_ASSETS, INITIAL_POSTS, INITIAL_DIRECTORY, INITIAL_NEWS } from './data/mockData';

import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ExploreView } from './components/explore/ExploreView';
import { MarketplaceView } from './components/MarketplaceView';
import { ModelsView } from './components/ModelsView';
import { WorkflowsView } from './components/WorkflowsView';
import { CommunityView } from './components/CommunityView';
import { DirectoryView } from './components/DirectoryView';
import { NewsView } from './components/NewsView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { VaultModal } from './components/VaultModal';
import { ListAssetModal } from './components/ListAssetModal';
import { NewPostModal } from './components/NewPostModal';
import { NewsArticleModal } from './components/NewsArticleModal';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const [assets, setAssets] = useState<MarketplaceAsset[]>(() => {
    const saved = localStorage.getItem('nn_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  useEffect(() => {
    fetch('/api/listings')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setAssets([...d, ...INITIAL_ASSETS]); })
      .catch(() => {});
    fetch('/api/news')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setNews([...d, ...INITIAL_NEWS]); })
      .catch(() => {});
  }, []);

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('nn_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  const [directory] = useState<DirectoryItem[]>(INITIAL_DIRECTORY);
  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('nn_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  // Vault / Collections state
  const [vault, setVault] = useState<VaultPurchase[]>(() => {
    const saved = localStorage.getItem('nn_vault');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<MarketplaceAsset | null>(null);
  const [selectedAssetForBuy, setSelectedAssetForBuy] = useState<MarketplaceAsset | null>(null);
  const [selectedNewsForModal, setSelectedNewsForModal] = useState<NewsItem | null>(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isListAssetOpen, setIsListAssetOpen] = useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  useEffect(() => { localStorage.setItem('nn_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('nn_posts',  JSON.stringify(posts));  }, [posts]);
  useEffect(() => { localStorage.setItem('nn_news',   JSON.stringify(news));   }, [news]);
  useEffect(() => { localStorage.setItem('nn_vault',  JSON.stringify(vault));  }, [vault]);

  const handleAddAsset = (a: MarketplaceAsset) => setAssets(p => [a, ...p]);
  const handleAddPost  = (p: CommunityPost)    => setPosts(prev => [p, ...prev]);
  
  // Collections handlers
  const handleAddVault    = (v: VaultPurchase) => setVault(p => [v, ...p.filter(item => item.id !== v.id)]);
  const handleRemoveVault = (id: string)        => setVault(p => p.filter(item => item.id !== id));

  const handleUpvotePost = (id: string) =>
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, hasUpvoted: !p.hasUpvoted, upvotes: p.hasUpvoted ? p.upvotes - 1 : p.upvotes + 1 }
      : p));

  const handleAddReply = (postId: string, text: string) =>
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      replies: [...p.replies, {
        id: `rep-${Date.now()}`,
        author: { name: 'You', handle: 'you', avatar: '' },
        content: text, createdAt: 'Just now', upvotes: 1,
      }],
      repliesCount: p.repliesCount + 1,
    } : p));

  const handleToggleBookmark = (id: string) =>
    setNews(prev => prev.map(n => n.id === id ? { ...n, bookmarked: !n.bookmarked } : n));

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F0EFE9] flex font-sans">
        <Sidebar vaultCount={vault.length} onOpenVault={() => setIsVaultOpen(true)} />

        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <div className="px-4 pt-3">
            <TopBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onToggleListAsset={() => setIsListAssetOpen(true)}
            />
          </div>

          <main className="flex-1 overflow-hidden flex">
            <Routes>
              <Route path="/"        element={<ExploreView searchQuery={searchQuery} />} />
              <Route path="/explore" element={<ExploreView searchQuery={searchQuery} />} />

              <Route path="/marketplace" element={
                <MarketplaceView
                  assets={assets}
                  onSelectAsset={a => setSelectedAssetForDetail(a)}
                  onQuickBuy={a => setSelectedAssetForBuy(a)}
                  searchQuery={searchQuery}
                />
              } />

              <Route path="/models"    element={<div className="flex-1 overflow-hidden flex"><ModelsView /></div>} />
              <Route path="/workflows" element={<div className="flex-1 overflow-hidden flex"><WorkflowsView /></div>} />

              <Route path="/community" element={
                <div className="flex-1 overflow-hidden flex">
                  <CommunityView
                    posts={posts}
                    onUpvotePost={handleUpvotePost}
                    onAddReply={handleAddReply}
                    onOpenNewPost={() => setIsNewPostOpen(true)}
                    searchQuery={searchQuery}
                  />
                </div>
              } />

              <Route path="/directory" element={<DirectoryView items={directory} searchQuery={searchQuery} />} />

              <Route path="/news" element={
                <div className="flex-1 overflow-hidden flex">
                  <NewsView
                    news={news}
                    onToggleBookmark={handleToggleBookmark}
                    onSelectNews={item => setSelectedNewsForModal(item)}
                    searchQuery={searchQuery}
                  />
                </div>
              } />

              <Route path="*" element={
                <div className="flex flex-col items-center justify-center flex-1 text-center">
                  <h1 className="text-5xl font-black text-[#0A0A0A] mb-3">404</h1>
                  <p className="text-gray-400 text-sm">This page doesn't exist yet.</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </div>

      <AssetDetailModal
        asset={selectedAssetForDetail}
        onClose={() => setSelectedAssetForDetail(null)}
        onBuy={a => { setSelectedAssetForDetail(null); setSelectedAssetForBuy(a); }}
      />
      <CheckoutModal
        asset={selectedAssetForBuy}
        onClose={() => setSelectedAssetForBuy(null)}
        onCompletePurchase={handleAddVault}
      />
      {isVaultOpen && (
        <VaultModal
          purchases={vault}
          onClose={() => setIsVaultOpen(false)}
          onRemovePurchase={handleRemoveVault}
          onAddPurchase={handleAddVault}
        />
      )}
      {isListAssetOpen && <ListAssetModal onClose={() => setIsListAssetOpen(false)} onAddAsset={handleAddAsset} />}
      {isNewPostOpen   && <NewPostModal   onClose={() => setIsNewPostOpen(false)}   onAddPost={handleAddPost} />}
      <NewsArticleModal
        news={selectedNewsForModal}
        onClose={() => setSelectedNewsForModal(null)}
        onToggleBookmark={handleToggleBookmark}
      />
    </BrowserRouter>
  );
}