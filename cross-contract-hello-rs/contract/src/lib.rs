use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, log, near_bindgen, AccountId, Gas, Promise, PromiseResult, PanicOnDefault};

pub mod external;
pub use crate::external::*;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
  pub hello_account: AccountId
}

#[near_bindgen]
impl Contract {
  #[init]
  #[private] // Public - but only callable by env::current_account_id()
  pub fn new(hello_account: AccountId) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    Self {
      hello_account: hello_account
    }
  }

  // Public - query external greeting
  pub fn query_greeting(&self) -> Promise{
    assert!(env::prepaid_gas() >= Gas::from(20*TGAS), "Please attach at least 20 TGAS");

    let promise = hello_near::get_greeting(
      self.hello_account.clone(),
      NO_DEPOSIT,
      Gas::from(5*TGAS)
    );

    return promise.then(this_contract::query_greeting_callback(
      env::current_account_id(),
      NO_DEPOSIT,
      Gas::from(5*TGAS),
    ));
  }

  #[private]
  pub fn query_greeting_callback(&self) -> String {
    if !external::did_promise_succeed() {
      log!("There was an error contacting Hello NEAR");
      return "".to_string();
    }

    // Get response, return 0 if failed
    let greeting: String = match env::promise_result(0) {
      PromiseResult::Successful(value) => near_sdk::serde_json::from_slice::<String>(&value).unwrap(),
      _ => { log!("There was an error contacting Hello NEAR"); return "".to_string(); },
    };

    return greeting;
  }


  #[payable] // Public - People can attach money
  pub fn change_greeting(&mut self, new_greeting: String) -> Promise {
    assert!(env::prepaid_gas() >= Gas::from(20*TGAS), "Please attach at least 20 TGAS");

    let promise = hello_near::set_greeting(
      new_greeting,
      self.hello_account.clone(),
      NO_DEPOSIT,
      Gas::from(5*TGAS)
    );

    // Create a callback, needs 10 Tgas
    return promise.then(this_contract::change_greeting_callback(
        env::current_account_id(),
        NO_DEPOSIT,
        Gas::from(10*TGAS),
    ));
  }

  #[private]
  pub fn change_greeting_callback(&mut self) -> bool {
    if external::did_promise_succeed(){
      // `set_greeting` succeeded
      return true;
    }else{
      // it failed
      return false;
    }
  }
}


#[cfg(test)]
mod tests {
    use super::*;

    const HELLO_NEAR: &str = "beneficiary";

    #[test]
    fn initializes() {
        let beneficiary: AccountId = HELLO_NEAR.parse().unwrap();
        let contract = Contract::new(beneficiary);
        assert_eq!(contract.hello_account, HELLO_NEAR.parse().unwrap())
    }
}
