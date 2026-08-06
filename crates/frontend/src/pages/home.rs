use leptos::prelude::*;
use crate::components::listing_card::ListingCard;
use crate::server_fns::listings::list_listings;

#[component]
pub fn HomePage() -> impl IntoView {
    let (category, set_category) = signal("All".to_string());

    let listings_resource = Resource::new(
        move || category.get(),
        |cat| async move {
            let cat_filter = if cat == "All" { None } else { Some(cat) };
            list_listings(None, cat_filter, None, None, None, Some(8)).await
        },
    );

    view! {
        <div class="bg-white text-slate-900 antialiased">
            
            <header class="relative overflow-hidden bg-[#F9FAFB] lg:min-h-[600px]">
                <div class="max-w-7xl mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
                    <div class="z-10">
                        <span class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block">"System Status: Optimal"</span>
                        <h1 class="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                            "Master Your "<br/><span class="text-slate-400">"AI Workflow."</span>
                        </h1>
                        <p class="text-slate-500 text-lg mb-10 max-w-md leading-relaxed">
                            "Ultra-secure model processing at the edge. Scale your AI infrastructure with zero-latency storage and neural networks."
                        </p>
                        <div class="flex gap-4">
                            <a href="/listings" class="bg-slate-900 text-white px-8 py-4 font-medium hover:bg-slate-800 transition-all flex items-center gap-2">
                                "Get Started"
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </a>
                            <a href="/docs" class="border border-slate-200 px-8 py-4 font-medium hover:bg-white transition-all">"Explore Documentation"</a>
                        </div>
                        
                        <div class="mt-12 flex items-center gap-3 grayscale opacity-50">
                            <div class="flex -space-x-2">
                                <div class="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                                <div class="w-8 h-8 rounded-full bg-slate-400 border-2 border-white"></div>
                                <div class="w-8 h-8 rounded-full bg-slate-500 border-2 border-white"></div>
                            </div>
                            <span class="text-xs text-slate-500">"Trusted by 50,000+ AI Engineers"</span>
                        </div>
                    </div>

                    
                    <div class="relative h-[400px] lg:h-[600px] flex items-center justify-center">
                        <div class="absolute w-[80%] h-[80%] bg-slate-100 rounded-[4rem] rotate-6"></div>
                        
                        <div class="relative z-10 w-64 h-80 bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col p-6">
                           <div class="w-full h-32 bg-slate-50 rounded-lg mb-4 animate-pulse"></div>
                           <div class="h-4 w-3/4 bg-slate-100 rounded mb-2"></div>
                           <div class="h-4 w-1/2 bg-slate-100 rounded"></div>
                           <div class="mt-auto h-10 w-full bg-slate-900 rounded"></div>
                        </div>

                        <div class="absolute top-10 right-10 bg-white p-3 rounded-xl shadow-lg border border-slate-50 flex gap-3 items-center">
                            <div class="w-10 h-10 bg-blue-50 rounded text-blue-600 flex items-center justify-center">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-width="2"/></svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase">"Latency"</p>
                                <p class="text-sm font-bold">"0.42ms"</p>
                            </div>
                        </div>

                        <div class="absolute bottom-20 left-0 bg-white p-4 rounded-xl shadow-lg border border-slate-50 w-48">
                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">"Model Cluster"</p>
                            <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div class="h-full bg-slate-900 w-2/3"></div>
                            </div>
                            <p class="text-[10px] mt-2 text-right">"64.2B / 100B Params"</p>
                        </div>
                    </div>
                </div>
            </header>

            
            <section class="max-w-7xl mx-auto px-4 py-12 border-b border-slate-100">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-width="1.5"/></svg></div>
                        <div><h4 class="text-sm font-semibold">"End-to-End"</h4><p class="text-xs text-slate-400">"AES-256 Encryption"</p></div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-width="1.5"/></svg></div>
                        <div><h4 class="text-sm font-semibold">"Instant Scaling"</h4><p class="text-xs text-slate-400">"On-demand resources"</p></div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="1.5"/></svg></div>
                        <div><h4 class="text-sm font-semibold">"Auto Backups"</h4><p class="text-xs text-slate-400">"30-day recovery"</p></div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" stroke-width="1.5"/></svg></div>
                        <div><h4 class="text-sm font-semibold">"Dev Support"</h4><p class="text-xs text-slate-400">"24/7 API assistance"</p></div>
                    </div>
                </div>
            </section>

            
            <section class="max-w-7xl mx-auto px-4 py-16">
                <div class="flex justify-between items-end mb-10">
                    <h2 class="text-2xl font-bold">"Asset Categories"</h2>
                    <a href="/listings" class="text-sm font-medium border-b border-slate-900 pb-1">"View All Assets →"</a>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div class="group cursor-pointer" on:click=move |_| set_category.set("Model".to_string())>
                        <div class="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
                            <div class="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                                <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" stroke-width="1"/></svg>
                            </div>
                        </div>
                        <h3 class="font-bold text-sm">"AI Models"</h3>
                        <p class="text-xs text-slate-400 mt-1">"Browse →"</p>
                    </div>
                    <div class="group cursor-pointer" on:click=move |_| set_category.set("Chatbot".to_string())>
                        <div class="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
                            <div class="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                                <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" stroke-width="1"/></svg>
                            </div>
                        </div>
                        <h3 class="font-bold text-sm">"Chatbots"</h3>
                        <p class="text-xs text-slate-400 mt-1">"Browse →"</p>
                    </div>
                    <div class="group cursor-pointer" on:click=move |_| set_category.set("Dataset".to_string())>
                        <div class="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
                            <div class="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                                <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="1"/></svg>
                            </div>
                        </div>
                        <h3 class="font-bold text-sm">"Datasets"</h3>
                        <p class="text-xs text-slate-400 mt-1">"Browse →"</p>
                    </div>
                    <div class="group cursor-pointer" on:click=move |_| set_category.set("Workflow".to_string())>
                        <div class="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
                            <div class="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                                <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="1"/></svg>
                            </div>
                        </div>
                        <h3 class="font-bold text-sm">"Workflows"</h3>
                        <p class="text-xs text-slate-400 mt-1">"Browse →"</p>
                    </div>
                    <div class="group cursor-pointer" on:click=move |_| set_category.set("Prompt".to_string())>
                        <div class="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
                            <div class="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                                <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" stroke-width="1"/></svg>
                            </div>
                        </div>
                        <h3 class="font-bold text-sm">"Prompts"</h3>
                        <p class="text-xs text-slate-400 mt-1">"Browse →"</p>
                    </div>
                </div>
            </section>

            
            <section class="bg-[#fdfdfd] py-16">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="flex justify-between items-end mb-10">
                        <h2 class="text-2xl font-bold">
                            "Latest " 
                            {move || if category.get() == "All" { "Assets".to_string() } else { format!("{}s", category.get()) }}
                        </h2>
                        <div class="flex gap-2">
                            <a href="/listings" class="h-10 px-4 border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors text-sm font-bold">
                                "View All →"
                            </a>
                        </div>
                    </div>

                    <Suspense fallback=move || view! { <div class="py-20 text-center text-slate-400 font-bold tracking-widest uppercase">"Loading Network..."</div> }>
                        {move || listings_resource.get().map(|result| match result {
                            Ok(data) => {
                                if data.items.is_empty() {
                                    view! { <div class="py-20 text-center text-slate-400">"No assets found in this category."</div> }.into_any()
                                } else {
                                    view! {
                                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                            <For
                                                each=move || data.items.clone()
                                                key=|listing| listing.id.clone()
                                                let:listing
                                            >
                                                <ListingCard listing=listing />
                                            </For>
                                        </div>
                                    }.into_any()
                                }
                            },
                            Err(e) => view! { <div class="text-red-500 py-20">{format!("Error loading assets: {}", e)}</div> }.into_any(),
                        })}
                    </Suspense>
                </div>
            </section>

            
            <section class="max-w-7xl mx-auto px-4 py-16">
                <h2 class="text-2xl font-bold mb-10">"Enterprise Solutions"</h2>
                <div class="grid lg:grid-cols-3 gap-8">
                    <div class="flex bg-slate-50 p-6 gap-6 items-center">
                        <div class="w-1/3 aspect-square bg-white flex items-center justify-center shadow-sm">
                            <svg class="w-12 h-12 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/></svg>
                        </div>
                        <div class="w-2/3">
                            <h3 class="font-bold mb-1">"Data Warehouse Pro"</h3>
                            <p class="text-xs text-slate-400 mb-3">"Infinite scaling for massive datasets."</p>
                            <span class="font-bold text-lg">"$2,499"</span>
                            <button class="block mt-4 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors">"Inquire Now"</button>
                        </div>
                    </div>

                    <div class="flex bg-slate-50 p-6 gap-6 items-center">
                        <div class="w-1/3 aspect-square bg-white flex items-center justify-center shadow-sm">
                            <svg class="w-12 h-12 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                        </div>
                        <div class="w-2/3">
                            <h3 class="font-bold mb-1">"Vault Encryption"</h3>
                            <p class="text-xs text-slate-400 mb-3">"Hardware-grade security module."</p>
                            <span class="font-bold text-lg">"$899"</span>
                            <button class="block mt-4 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors">"Add to Stack"</button>
                        </div>
                    </div>

                    <div class="flex bg-slate-50 p-6 gap-6 items-center">
                        <div class="w-1/3 aspect-square bg-white flex items-center justify-center shadow-sm">
                            <svg class="w-12 h-12 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44a.97.97 0 01-.97 0l-7.9-4.44c-.32-.17-.53-.5-.53-.88v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.33-.13.5-.13.17 0 .34.04.5.13l7.9 4.44c.32.17.53.5.53.88v9z"/></svg>
                        </div>
                        <div class="w-2/3">
                            <h3 class="font-bold mb-1">"Neural Compute Node"</h3>
                            <p class="text-xs text-slate-400 mb-3">"AI-optimized inference engines."</p>
                            <span class="font-bold text-lg">"$1,200"</span>
                            <button class="block mt-4 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors">"Provision"</button>
                        </div>
                    </div>
                </div>
            </section>

            
            <section class="max-w-7xl mx-auto px-4 pb-24">
                <div class="grid lg:grid-cols-2 gap-px bg-slate-100 overflow-hidden shadow-2xl">
                    <div class="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-12 lg:p-20 relative">
                        <span class="inline-block px-3 py-1 bg-blue-600 text-[10px] font-bold uppercase tracking-widest mb-6">"Flash Sale"</span>
                        <h2 class="text-4xl lg:text-5xl font-bold mb-6">"Infrastructure Upgrade: Up to 70% Off"</h2>
                        <div class="flex gap-8 mb-10">
                            <div><span class="text-3xl font-bold">"02"</span><p class="text-[10px] text-slate-400 uppercase tracking-widest">"Days"</p></div>
                            <div><span class="text-3xl font-bold">"15"</span><p class="text-[10px] text-slate-400 uppercase tracking-widest">"Hours"</p></div>
                            <div><span class="text-3xl font-bold">"45"</span><p class="text-[10px] text-slate-400 uppercase tracking-widest">"Mins"</p></div>
                            <div><span class="text-3xl font-bold">"30"</span><p class="text-[10px] text-slate-400 uppercase tracking-widest">"Secs"</p></div>
                        </div>
                        <button class="bg-white text-slate-900 px-8 py-4 font-bold text-sm hover:bg-slate-100 transition-all uppercase tracking-widest">"Redeem Offer Now"</button>
                        
                        <div class="absolute -right-20 -bottom-20 w-64 h-64 border-[32px] border-white/5 rounded-full"></div>
                    </div>

                    <div class="bg-white p-12 lg:p-20 flex flex-col justify-center">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">"New Release"</span>
                        <h2 class="text-3xl font-bold mb-6">"The 2025 Security Protocol"</h2>
                        <p class="text-slate-500 mb-8 max-w-sm leading-relaxed">"Introducing the latest trends in decentralized data management and quantum-safe encryption layers."</p>
                        <div class="flex items-center gap-4">
                            <button class="bg-slate-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">"Learn More"</button>
                            <a href="#" class="text-xs font-bold uppercase tracking-widest border-b border-slate-900 hover:text-slate-500 transition-colors">"View Whitepaper"</a>
                        </div>
                        <div class="mt-12 w-full h-24 border-l-4 border-slate-900 flex items-center px-6 bg-slate-50">
                            <div class="flex gap-1">
                                <div class="w-1 h-8 bg-slate-300"></div>
                                <div class="w-1 h-12 bg-slate-900"></div>
                                <div class="w-1 h-6 bg-slate-400"></div>
                                <div class="w-1 h-16 bg-slate-900"></div>
                                <div class="w-1 h-10 bg-slate-200"></div>
                            </div>
                            <span class="ml-4 text-[10px] font-mono text-slate-400 uppercase">"Binary Stream Verification Active"</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    }
}
