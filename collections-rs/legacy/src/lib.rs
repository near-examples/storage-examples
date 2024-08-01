pub mod lazy;
pub mod lookup_map;
pub mod lookup_set;
pub mod nested;
pub mod tree;
pub mod unordered_map;
pub mod unordered_set;
pub mod vector;

use near_sdk::collections::{
    LazyOption, LookupMap, LookupSet, TreeMap, UnorderedMap, UnorderedSet, Vector,
};
use near_sdk::{near, PanicOnDefault};
use near_sdk::BorshStorageKey;

const LARGE_VALUE: u8 = 0;

#[near]
#[derive(BorshStorageKey)]
pub enum Prefix {
    Root,
    Vector,
    LookupSet,
    UnorderedSet,
    LookupMap,
    UnorderedMap,
    TreeMap,
    Nested(String),
    LazyOption,
}

// Define the contract structure
#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct StorageExample {
    pub vector: Vector<i32>,
    pub lookup_set: LookupSet<i32>,
    pub unordered_set: UnorderedSet<i32>,
    pub lookup_map: LookupMap<String, i32>,
    pub unordered_map: UnorderedMap<String, i32>,
    pub tree_map: TreeMap<String, i32>,
    pub nested: LookupMap<String, Vector<i32>>,
    pub lazy_option: LazyOption<u8>,
}

// collections cannot have a default implementation
#[near]
impl StorageExample {
    #[init]
    pub fn init() -> Self {
        Self {
            vector: Vector::new(Prefix::Vector),
            lookup_set: LookupSet::new(Prefix::LookupSet),
            unordered_set: UnorderedSet::new(Prefix::UnorderedSet),
            lookup_map: LookupMap::new(Prefix::LookupMap),
            unordered_map: UnorderedMap::new(Prefix::UnorderedMap),
            tree_map: TreeMap::new(Prefix::TreeMap),
            nested: LookupMap::new(Prefix::Root),
            lazy_option: LazyOption::new(Prefix::LazyOption, Some(&LARGE_VALUE)),
        }
    }
}
