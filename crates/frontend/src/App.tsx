import React, { useState, useEffect } from 'react';
import { MarketplaceAsset, CommunityPost, DirectoryItem, NewsItem, VaultPurchase } from './types';
import { INITIAL_ASSETS, INITIAL_POSTS, INITIAL_DIRECTORY, INITIAL_NEWS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { NewsTicker } from './components/NewsTicker';
import { MarketplaceView } from './components/MarketplaceView';
import { CommunityView } from './components/CommunityView';
import { DirectoryView } from './components/DirectoryView';
import { NewsView } from './components/NewsView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { VaultModal } from './components/VaultModal';
import { ListAssetModal } from './components/ListAssetModal';
import { NewPostModal } from './components/NewPostModal';
import { NewsArticleModal } from './components/NewsArticleModal';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'marketplace' | 'community' | 'directory' | 'news'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');



  // Local Storage Data Persistent State
  const [assets, setAssets] = useState<MarketplaceAsset[]>(() => {
    const saved = localStorage.getItem('nn_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('nn_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [directory] = useState<DirectoryItem[]>(INITIAL_DIRECTORY);

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('nn_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  const [vault, setVault] = useState<VaultPurchase[]>(() => {
    const saved = localStorage.getItem('nn_vault');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals state
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<MarketplaceAsset | null>(null);
  const [selectedAssetForBuy, setSelectedAssetForBuy] = useState<MarketplaceAsset | null>(null);
  const [selectedNewsForModal, setSelectedNewsForModal] = useState<NewsItem | null>(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isListAssetOpen, setIsListAssetOpen] = useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nn_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('nn_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('nn_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('nn_vault', JSON.stringify(vault));
  }, [vault]);

  // Handlers
  const handleAddVaultPurchase = (purchase: VaultPurchase) => {
    setVault(prev => [purchase, ...prev]);
  };

  const handleAddAsset = (newAsset: MarketplaceAsset) => {
    setAssets(prev => [newAsset, ...prev]);
  };

  const handleAddPost = (newPost: CommunityPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleUpvotePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasUpvoted = p.hasUpvoted;
        return {
          ...p,
          hasUpvoted: !hasUpvoted,
          upvotes: hasUpvoted ? p.upvotes - 1 : p.upvotes + 1,
        };
      }
      return p;
    }));
  };

  const handleAddReply = (postId: string, replyText: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newReply = {
          id: `rep-${Date.now()}`,
          author: {
            name: 'CURRENT BUILDER',
            handle: 'neural_builder',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
          content: replyText,
          createdAt: 'Just now',
          upvotes: 1,
        };
        return {
          ...p,
          replies: [...p.replies, newReply],
          repliesCount: p.repliesCount + 1,
        };
      }
      return p;
    }));
  };

  const handleToggleBookmarkNews = (newsId: string) => {
    setNews(prev => prev.map(n => {
      if (n.id === newsId) {
        return { ...n, bookmarked: !n.bookmarked };
      }
      return n;
    }));
  };

  return (
    <div className="w-full h-full bg-[#0A0A0B] text-[#E2E2E2] flex flex-col overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vaultCount={vault.length}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenListAsset={() => setIsListAssetOpen(true)}
        onOpenNewPost={() => setIsNewPostOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Daily AI News Ticker Bar */}
      <NewsTicker
        news={news}
        onSelectNews={(item) => setSelectedNewsForModal(item)}
      />

      {/* Main Container Views */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'marketplace' && (
          <MarketplaceView
            assets={assets}
            onSelectAsset={(asset) => setSelectedAssetForDetail(asset)}
            onQuickBuy={(asset) => setSelectedAssetForBuy(asset)}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView
            posts={posts}
            onUpvotePost={handleUpvotePost}
            onAddReply={handleAddReply}
            onOpenNewPost={() => setIsNewPostOpen(true)}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView
            items={directory}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'news' && (
          <NewsView
            news={news}
            onToggleBookmark={handleToggleBookmarkNews}
            onSelectNews={(item) => setSelectedNewsForModal(item)}
            searchQuery={searchQuery}
          />
        )}
      </main>

      {/* Footer Status Bar */}
      <Footer />

      {/* Interactive Modals */}
      <AssetDetailModal
        asset={selectedAssetForDetail}
        onClose={() => setSelectedAssetForDetail(null)}
        onBuy={(asset) => {
          setSelectedAssetForDetail(null);
          setSelectedAssetForBuy(asset);
        }}
      />

      <CheckoutModal
        asset={selectedAssetForBuy}
        onClose={() => setSelectedAssetForBuy(null)}
        onCompletePurchase={handleAddVaultPurchase}
      />

      {isVaultOpen && (
        <VaultModal
          purchases={vault}
          onClose={() => setIsVaultOpen(false)}
        />
      )}

      {isListAssetOpen && (
        <ListAssetModal
          onClose={() => setIsListAssetOpen(false)}
          onAddAsset={handleAddAsset}
        />
      )}

      {isNewPostOpen && (
        <NewPostModal
          onClose={() => setIsNewPostOpen(false)}
          onAddPost={handleAddPost}
        />
      )}

      <NewsArticleModal
        news={selectedNewsForModal}
        onClose={() => setSelectedNewsForModal(null)}
        onToggleBookmark={handleToggleBookmarkNews}
      />

    </div>
  );
}
