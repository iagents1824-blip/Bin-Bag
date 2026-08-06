use leptos::prelude::*;

#[component]
pub fn Footer() -> impl IntoView {
    let year = chrono::Utc::now().format("%Y").to_string();

    view! {
        <footer class="bg-white py-12 border-t border-slate-100 mt-auto">
            <div class="max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div class="flex gap-4">
                        <div class="text-slate-400 text-xl">"⚡"</div>
                        <div>
                            <h5 class="text-sm font-bold">"Ultra Latency"</h5>
                            <p class="text-xs text-slate-400">"Under 1ms globally"</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="text-slate-400 text-xl">"🔒"</div>
                        <div>
                            <h5 class="text-sm font-bold">"Secure Checkout"</h5>
                            <p class="text-xs text-slate-400">"100% Encrypted"</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="text-slate-400 text-xl">"☁️"</div>
                        <div>
                            <h5 class="text-sm font-bold">"Global Sync"</h5>
                            <p class="text-xs text-slate-400">"Multi-region active"</p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="text-slate-400 text-xl">"💬"</div>
                        <div>
                            <h5 class="text-sm font-bold">"Human Support"</h5>
                            <p class="text-xs text-slate-400">"No bots, real experts"</p>
                        </div>
                    </div>
                </div>
                
                <div class="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p class="text-xs text-slate-400">
                        {format!("© {} Bin Bag. All rights reserved.", year)}
                    </p>
                    <div class="flex gap-6 text-xs text-slate-400">
                        <a href="#" class="hover:text-slate-900 transition-colors">"Terms of Service"</a>
                        <a href="#" class="hover:text-slate-900 transition-colors">"Privacy Policy"</a>
                        <a href="#" class="hover:text-slate-900 transition-colors">"Cookie Settings"</a>
                    </div>
                </div>
            </div>
        </footer>
    }
}
