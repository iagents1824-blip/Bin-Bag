use leptos::prelude::*;
use bin_bag_core::models::review::ReviewWithBuyer;
use crate::components::star_rating::StarRating;

#[component]
pub fn ReviewCard(review: ReviewWithBuyer) -> impl IntoView {
    let date_str = review.review.created_at.format("%b %d, %Y").to_string();

    view! {
        <div class="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-sm font-semibold text-blue-400">
                        {review.buyer_username.chars().next().unwrap_or('?').to_uppercase().to_string()}
                    </div>
                    <span class="font-medium text-gray-200">{review.buyer_username}</span>
                </div>
                <span class="text-xs text-gray-400">{date_str}</span>
            </div>
            <div class="mb-2">
                <StarRating rating=review.review.rating as f64 />
            </div>
            <p class="text-gray-300 text-sm leading-relaxed">{review.review.comment}</p>
        </div>
    }
}
