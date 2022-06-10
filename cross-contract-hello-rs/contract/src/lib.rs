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
  pub fn query_greeting(&self) -> Promise {
    // Make sure there is enough GAS to execute the callback
    assert!(env::prepaid_gas() >= Gas::from(20*TGAS), "Please attach at least 20 TGAS");

    // Create a promise to call HelloNEAR.get_greeting()
    let promise = hello_near::ext(self.hello_account.clone())
      .with_static_gas(Gas(5*TGAS))
      .get_greeting();

    // Create a promise to callback query_greeting_callback
    return promise.then(
      Self::ext(env::current_account_id())
      .with_static_gas(Gas(5*TGAS))
      .query_greeting_callback()
    );
  }

  #[private] // Public - but only callable by env::current_account_id()
  pub fn query_greeting_callback(&self) -> String {
    if !external::did_promise_succeed() {
      log!("There was an error contacting Hello NEAR");
      return "".to_string();
    }

    // Get response, return "" if failed
    let greeting: String = match env::promise_result(0) {
      PromiseResult::Successful(value) => near_sdk::serde_json::from_slice::<String>(&value).unwrap(),
      _ => { log!("There was an error contacting Hello NEAR"); return "".to_string(); },
    };

    return greeting;
  }

  // Public - change external greeting
  pub fn change_greeting(&mut self, new_greeting: String) -> Promise {
    // Make sure there is enough GAS to execute the callback
    assert!(env::prepaid_gas() >= Gas::from(20*TGAS), "Please attach at least 20 TGAS");

    // Create a promise to call HelloNEAR.set_greeting(message:string)
    let promise = hello_near::ext(self.hello_account.clone())
      .with_static_gas(Gas(5*TGAS))
      .set_greeting(new_greeting);

    // Create a callback change_greeting_callback
    return promise.then(
      Self::ext(env::current_account_id())
      .with_static_gas(Gas(10*TGAS))
      .change_greeting_callback()
    );
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
