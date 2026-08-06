//! Bin Bag — Root Application Component
//!
//! Sets up the router, global layout, and auth context.

use leptos::prelude::*;
use leptos_meta::*;
use leptos_router::{
    components::{Route, Router, Routes},
    path,
};

use crate::components::{footer::Footer, navbar::Navbar};
use crate::pages::{
    home::HomePage, listing_browse::ListingBrowse, listing_create::ListingCreate,
    listing_detail::ListingDetail, listing_edit::ListingEdit, login::LoginPage,
    profile::ProfilePage, settings::SettingsPage, signup::SignupPage,
    seller_dashboard::SellerDashboardPage, buyer_orders::BuyerOrdersPage,
    community_browse::CommunityBrowse, thread_create::ThreadCreatePage,
    thread_detail::ThreadDetailPage,
    news_digest::NewsDigestPage, news_archive::NewsArchivePage,
    trending_leaderboard::TrendingLeaderboardPage,
    search::SearchPage, admin::AdminPage, expert_apply::ExpertApplyPage,
};
use crate::server_fns::auth::get_current_user;
use bin_bag_core::models::user::PublicUser;

/// Auth context signal — holds the currently authenticated user (if any).
#[derive(Clone, Debug)]
pub struct AuthContext {
    pub user: ReadSignal<Option<PublicUser>>,
    pub set_user: WriteSignal<Option<PublicUser>>,
}

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();

    // Auth state
    let (user, set_user) = signal(Option::<PublicUser>::None);
    provide_context(AuthContext {
        user,
        set_user,
    });

    // Fetch current user on mount
    let user_resource = Resource::new(move || (), move |_| async move {
        get_current_user().await.ok().flatten()
    });

    Effect::new(move || {
        if let Some(u) = user_resource.get() {
            set_user.set(u);
        }
    });

    view! {
        <Meta name="description" content="Bin Bag — The AI marketplace for models, chatbots, assistants, workflows, prompts, and datasets."/>
        <Meta name="theme-color" content="#0a0b10"/>
        <Title text="Bin Bag — AI Marketplace"/>
        <Stylesheet href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"/>
        <Stylesheet id="leptos" href="/pkg/bin-bag.css"/>

        <crate::components::preloader::Preloader/>

        <Router>
            <div class="page-wrapper min-h-screen flex flex-col bg-white text-slate-900 antialiased">
                <Navbar/>
                <main class="page-content flex-grow">
                    <Routes fallback=|| view! {
                        <div class="max-w-7xl mx-auto px-4 py-20 text-center">
                            <div class="text-4xl mb-4">"🔍"</div>
                            <h2 class="text-2xl font-bold mb-2">"Page Not Found"</h2>
                            <p class="text-slate-500 mb-6">"The page you're looking for doesn't exist."</p>
                            <a href="/" class="bg-slate-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">"Go Home"</a>
                        </div>
                    }>
                        <Route path=path!("/") view=HomePage/>
                        <Route path=path!("/login") view=LoginPage/>
                        <Route path=path!("/signup") view=SignupPage/>
                        <Route path=path!("/listings") view=ListingBrowse/>
                        <Route path=path!("/listings/new") view=ListingCreate/>
                        <Route path=path!("/listings/:id") view=ListingDetail/>
                        <Route path=path!("/listings/:id/edit") view=ListingEdit/>
                        <Route path=path!("/u/:username") view=ProfilePage/>
                        <Route path=path!("/settings") view=SettingsPage/>
                        <Route path=path!("/dashboard") view=SellerDashboardPage/>
                        <Route path=path!("/orders") view=BuyerOrdersPage/>
                        <Route path=path!("/community") view=CommunityBrowse/>
                        <Route path=path!("/community/new") view=ThreadCreatePage/>
                        <Route path=path!("/community/:id") view=ThreadDetailPage/>
                        <Route path=path!("/news") view=NewsDigestPage/>
                        <Route path=path!("/news/archive") view=NewsArchivePage/>
                        <Route path=path!("/trending") view=TrendingLeaderboardPage/>
                        <Route path=path!("/search") view=SearchPage/>
                        <Route path=path!("/admin") view=AdminPage/>
                        <Route path=path!("/apply-expert") view=ExpertApplyPage/>
                    </Routes>
                </main>
                <Footer/>
            </div>
        </Router>
    }
}
