use leptos::prelude::*;
use leptos_router::hooks::use_params_map;
use crate::server_fns::auth::get_user_profile;
use crate::server_fns::listings::list_listings;
use crate::components::listing_card::ListingCard;
use crate::components::role_badge::RoleBadge;

#[component]
pub fn ProfilePage() -> impl IntoView {
    let params = use_params_map();
    let username = move || params.get().get("username").unwrap_or_default();

    let profile_resource = Resource::new(
        move || username(),
        |uname| async move { get_user_profile(uname).await },
    );

    let listings_resource = Resource::new(
        move || username(),
        |uname| async move {
            if let Ok(profile) = get_user_profile(uname).await {
                list_listings(None, None, None, Some(profile.id.to_string()), None, Some(50)).await
            } else {
                Err(ServerFnError::new("Profile not found"))
            }
        },
    );

    view! {
        <div class="container mt-8 mb-8 animate-fade-in">
            <Suspense fallback=move || view! { <div class="text-center py-10 text-tertiary">"Loading profile..."</div> }>
                {move || profile_resource.get().map(|res| match res {
                    Ok(profile) => {
                        view! {
                            <div>
                                <div class="profile-header card p-8 mb-8 animate-fade-in-up flex flex-col md:flex-row items-center md:items-start gap-8">
                                    <div class="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-4xl font-bold text-white overflow-hidden shadow-xl border-4 border-border">
                                        {if let Some(avatar) = profile.avatar_url.clone() {
                                            view! { <img src=avatar class="w-full h-full object-cover" /> }.into_any()
                                        } else {
                                            view! { {profile.username.chars().next().unwrap_or('?').to_uppercase().to_string()} }.into_any()
                                        }}
                                    </div>
                                    <div class="text-center md:text-left flex-1">
                                        <div class="flex flex-col md:flex-row items-center gap-4 mb-2">
                                            <h1 class="text-3xl font-bold">{profile.display_name.clone().unwrap_or(profile.username.clone())}</h1>
                                            <RoleBadge role=profile.role.clone() />
                                        </div>
                                        <div class="text-secondary mb-4">{format!("@{}", profile.username)}</div>
                                        {if let Some(bio) = profile.bio.clone() {
                                            view! { <p class="text-secondary max-w-2xl">{bio}</p> }.into_any()
                                        } else {
                                            view! { <p class="text-tertiary italic">"No bio provided."</p> }.into_any()
                                        }}
                                    </div>
                                </div>

                                <div class="section-header mb-6">
                                    <h2 class="section-title">"Listings"</h2>
                                </div>
                                
                                <Suspense fallback=move || view! { <div class="text-center py-10 text-tertiary">"Loading listings..."</div> }>
                                    {move || listings_resource.get().map(|l_res| match l_res {
                                        Ok(data) => {
                                            if data.items.is_empty() {
                                                view! { <div class="text-secondary card p-8 text-center">"This user has no active listings."</div> }.into_any()
                                            } else {
                                                view! {
                                                    <div class="grid grid-listings stagger-children">
                                                        <For each=move || data.items.clone() key=|listing| listing.id.clone() let:listing>
                                                            <ListingCard listing=listing />
                                                        </For>
                                                    </div>
                                                }.into_any()
                                            }
                                        },
                                        Err(e) => view! { <div class="alert alert-error">{e.to_string()}</div> }.into_any(),
                                    })}
                                </Suspense>
                            </div>
                        }.into_any()
                    },
                    Err(e) => view! { <div class="alert alert-error text-center py-10">{e.to_string()}</div> }.into_any(),
                })}
            </Suspense>
        </div>
    }
}
