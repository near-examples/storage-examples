use near_sdk::{env, ext_contract, log, PromiseResult};

pub const TGAS: u64 = 1_000_000_000_000;
pub const NO_DEPOSIT: u128 = 0;
pub const XCC_SUCCESS: u64 = 1;

// Interface of this contract, for callbacks
#[ext_contract(this_contract)]
trait Callbacks {
  fn query_greeting_callback(&mut self) -> String;
  fn change_greeting_callback(&mut self) -> bool;
}

// Validator interface, for cross-contract calls
#[ext_contract(hello_near)]
trait HelloNear {
  #[payable]
  fn get_greeting(&mut self) -> String;
  fn set_greeting(&self, message: String);
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
