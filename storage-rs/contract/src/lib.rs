pub mod storage;
pub mod vector;
pub mod map;
pub mod set;
pub mod tree;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, PanicOnDefault};
use near_sdk::collections::{LookupMap, Vector, UnorderedSet, TreeMap};

// Constants
const ONE_NEAR: u128 = 1_000_000_000_000_000_000_000_000;

// Contract Structure
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
  pub vector: Vector<i32>,
  pub map: LookupMap<String, i32>,
  pub set: UnorderedSet<i32>,
  pub tree: TreeMap<String, i32>,
  pub demo_u128: u128,
  pub demo_string: String,
}

#[near_bindgen]
impl Contract {
  #[init]
  #[private]
  pub fn new(demo_string: String) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    Self {
      vector: Vector::new(b"vec-uid-1".to_vec()),
      map: LookupMap::new(b"map-uid-1".to_vec()),
      set: UnorderedSet::new(b"set-uid-1".to_vec()),
      tree: TreeMap::new(b"tree-uid-1".to_vec()),
      demo_u128: ONE_NEAR,
      demo_string: demo_string
    }
  }
}