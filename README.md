# Rust Storage Examples

Runnable examples of persistent collections in `near_sdk::store`:

- `Vector`
- `LookupMap` and `IterableMap`
- `LookupSet` and `IterableSet`
- Nested collections with distinct storage prefixes and explicit cleanup

The contract is in [`collections-rs/store`](collections-rs/store). Collection modules include unit tests, and the integration suite deploys the contract to a local Sandbox and checks each collection across calls. See the [collections guide](https://docs.near.org/smart-contracts/anatomy/collections) for explanations of storage prefixes and collection selection.

## Requirements

Install [rustup](https://rustup.rs/). The repository pins Rust 1.97.1 and uses NEAR SDK 5.29.1. Install the contract build tool:

```bash
cargo install cargo-near --version 0.21.1 --locked --no-default-features
```

## Build

```bash
cd collections-rs/store
cargo near build non-reproducible-wasm --locked
```

The build command prints the path to the generated Wasm artifact.

## Test

```bash
cd collections-rs
cargo test --locked
```

Tests build the contract from source and use local Sandbox accounts. They do not require a funded public-network account or a frontend.
