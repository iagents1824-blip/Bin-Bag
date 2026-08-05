//! Bin Bag — Library Entry Point
//!
//! Declares modules and provides the WASM hydration entry point.

#![recursion_limit = "512"]

pub mod app;
pub mod components;
pub mod pages;
pub mod routes;
pub mod server_fns;
pub mod state;

#[cfg(feature = "hydrate")]
#[wasm_bindgen::prelude::wasm_bindgen]
pub fn hydrate() {
    console_error_panic_hook::set_once();
    leptos::mount::hydrate_body(app::App);
}
