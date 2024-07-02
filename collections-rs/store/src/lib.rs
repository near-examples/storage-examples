pub mod map;
pub mod vector;
pub mod set;
pub mod nested;

use near_sdk::near;
use near_sdk::store::{LookupMap, LookupSet, Vector};
use near_sdk::BorshStorageKey;

#[near]
#[derive(BorshStorageKey)]
pub enum Prefix {
    Vector,
    LookupMap,
    LookupSet,
    Root,
    Nested(String),
}

// Define the contract structure
#[near(contract_state)]
pub struct StorageExample {
    pub vector: Vector<i32>,
    pub lookup_map: LookupMap<String, i32>,
    pub lookup_set: LookupSet<i32>,
    pub nested: LookupMap<String, Vector<i32>>,
}

// Define the default, which automatically initializes the contract
impl Default for StorageExample {
    fn default() -> Self {
        Self {
            vector: Vector::new(Prefix::Vector),
            lookup_map: LookupMap::new(Prefix::LookupMap),
            lookup_set: LookupSet::new(Prefix::LookupSet),
            nested: LookupMap::new(Prefix::Root),
        }
    }
}
