pub mod iterable_map;
pub mod lookup_map;
pub mod nested;
pub mod iterable_set;
pub mod lookup_set;
pub mod vector;

use near_sdk::near;
use near_sdk::store::{IterableMap, IterableSet, LookupMap, LookupSet, Vector};
use near_sdk::BorshStorageKey;

#[near]
#[derive(BorshStorageKey)]
pub enum Prefix {
    Root,
    Vector,
    LookupSet,
    IterableSet,
    LookupMap,
    IterableMap,
    Nested(String),
}

// Define the contract structure
#[near(contract_state)]
pub struct StorageExample {
    pub vector: Vector<i32>,
    pub lookup_set: LookupSet<i32>,
    pub iterable_set: IterableSet<i32>,
    pub lookup_map: LookupMap<String, i32>,
    pub iterable_map: IterableMap<String, i32>,
    pub nested: LookupMap<String, Vector<i32>>,
}

// Define the default, which automatically initializes the contract
impl Default for StorageExample {
    fn default() -> Self {
        Self {
            vector: Vector::new(Prefix::Vector),
            lookup_set: LookupSet::new(Prefix::LookupSet),
            iterable_set: IterableSet::new(Prefix::IterableSet),
            lookup_map: LookupMap::new(Prefix::LookupMap),
            iterable_map: IterableMap::new(Prefix::IterableMap),
            nested: LookupMap::new(Prefix::Root),
        }
    }
}
