pub mod map;
pub mod nested;
pub mod vector;
pub mod set;
pub mod lazy;
pub mod tree;

use near_sdk::collections::{LazyOption, LookupMap, LookupSet, TreeMap, Vector};
use near_sdk::near;
use near_sdk::BorshStorageKey;

const LARGE_VALUE: u8 = 0;

#[near]
#[derive(BorshStorageKey)]
pub enum Prefix {
    Vector,
    LookupMap,
    LookupSet,
    LazyOption,
    TreeMap,
    Root,
    Nested(String),
}

// Define the contract structure
#[near(contract_state)]
pub struct StorageExample {
    pub vector: Vector<i32>,
    pub lookup_map: LookupMap<String, i32>,
    pub lookup_set: LookupSet<i32>,
    pub tree_map: TreeMap<String, i32>,
    pub nested: LookupMap<String, Vector<i32>>,
    pub lazy_option: LazyOption<u8>,
}

// Define the default, which automatically initializes the contract
impl Default for StorageExample {
    fn default() -> Self {
        Self {
            vector: Vector::new(Prefix::Vector),
            lookup_map: LookupMap::new(Prefix::LookupMap),
            lookup_set: LookupSet::new(Prefix::LookupSet),
            tree_map: TreeMap::new(Prefix::TreeMap),
            nested: LookupMap::new(Prefix::Root),
            lazy_option: LazyOption::new(Prefix::LazyOption, Some(&LARGE_VALUE)),
        }
    }
}
