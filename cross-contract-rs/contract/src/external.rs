use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, ext_contract, log, PromiseResult};

pub const TGAS: u64 = 1_000_000_000_000;
pub const NO_DEPOSIT: u128 = 0;
pub const XCC_SUCCESS: u64 = 1;

// Interface of this contract, for callbacks
#[ext_contract(this_contract)]
trait Callbacks {
  fn donate_callback(&mut self, donor: AccountId, amount: u128) -> i32;
  fn total_staked_callback(&mut self) -> u128;
}

// Validator interface, for cross-contract calls
#[ext_contract(validator_contract)]
trait Validator {
  #[payable]
  fn deposit_and_stake(&mut self) -> bool;
  fn get_account(&self, account_id: AccountId) -> PoolInfo;
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct User {
  pub staked_balance: U128,
  pub unstaked_balance: U128,
  pub available: bool,
}

// Aux functions to interact with the validator
pub fn did_promise_succeed() -> bool {
  if env::promise_results_count() != 1 {
    log!("Expected a result on the callback");
    return false;
  }

  match env::promise_result(0) {
    PromiseResult::Successful(_) => true,
    _ => false,
  }
}
