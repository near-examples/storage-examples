use near_sdk::collections::Vector;
use near_sdk::{env, log, near_bindgen, AccountId, Gas, Promise, PromiseResult, Balance};

pub mod model;
pub use crate::model::*;

pub mod external;
pub use crate::external::*;

#[near_bindgen]
impl Contract {
  #[init]
  #[private] // Public - but only callable by env::current_account_id()
  pub fn new(beneficiary: AccountId, stake_pool: AccountId) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    Self {
      beneficiary: beneficiary,
      stake_pool: stake_pool,
      donations: Vector::new(b"vec-uid-1".to_vec()),
    }
  }

  #[payable] // Public - People can attach money
  pub fn donate(&mut self) -> Promise {
    assert!(env::prepaid_gas() >= Gas::from(45*TGAS), "Please attach at least 45 TGAS");
  
    // Get who is calling the method, and how much NEAR they attached
    let donor: AccountId = env::predecessor_account_id();
    let amount: Balance = env::attached_deposit();

    // Stake donation in a pool, needs 30TGAS
    let deposit: u128 = amount - STORAGE_COST;

    let promise = validator_contract::deposit_and_stake(
      self.stake_pool.clone(),
      deposit,
      Gas::from(30*TGAS)
    );

    // Create a callback, needs 10 Tgas
    return promise.then(this_contract::donate_callback(
        donor.clone(),
        amount,
        env::current_account_id(),
        NO_DEPOSIT,
        Gas::from(10*TGAS),
    ));
  }

  #[private]
  pub fn donate_callback(&mut self, donor: AccountId, amount: Balance) -> u64 {
    if external::did_promise_succeed(){
      // `deposit_and_stake` succeeded - Record the donation
      let donation_number: u64 = self.add_donation(donor.clone(), amount);
      log!("Thank you {}! donation number: {}", donor.clone(), donation_number);
      return donation_number;
    }else{
      // it failed - The deposit came back to us and we must return it
      log!("There was an error, returning {} to @{}", amount, &donor);
      Promise::new(donor).transfer(amount);
      return 0;
    }
  }

  // Public - total_staked
  pub fn total_staked(&self) -> Promise{
    assert!(env::prepaid_gas() >= Gas::from(15*TGAS), "Please attach at least 15 TGAS");

    let promise = validator_contract::get_account(
      env::current_account_id(),
      self.stake_pool.clone(),
      NO_DEPOSIT,
      Gas::from(5*TGAS)
    );

    return promise.then(this_contract::total_staked_callback(
      env::current_account_id(),
      NO_DEPOSIT,
      Gas::from(5*TGAS),
    ));
  }

  #[private]
  pub fn total_staked_callback(&self) -> u128 {
    if !external::did_promise_succeed() {
      log!("There was an error in `get_account`");
      return 0;
    }

    // Get response, return 0 if failed
    let user_info: User = match env::promise_result(0) {
      PromiseResult::Successful(value) => near_sdk::serde_json::from_slice::<User>(&value).unwrap(),
      _ => { log!("Validator returned wrong information"); return 0; },
    };

    return u128::from(user_info.staked_balance);
  }

  // Public - get donation by number
  pub fn get_donation_by_number(&self, donation_number: u64) -> Donation {
    match self.donations.get(donation_number - 1) {
      None => panic!("Error: Invalid donation number"),
      Some(value) => value,
    }
  }

  // Private - Add donation
  fn add_donation(&mut self, donor: AccountId, amount: Balance) -> u64 {
    let donation: Donation = Donation { donor, amount };
    self.donations.push(&donation);
    return self.donations.len();
  }

  // Public - get total number of donations
  pub fn total_donations(&self) -> u64 {
    return self.donations.len();
  }
}


#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::testing_env;
    use near_sdk::test_utils::VMContextBuilder;

    const BENEFICIARY: &str = "beneficiary";
    const VALIDATOR: &str = "validator";
    const NEAR: u128 = 1000000000000000000000000;

    #[test]
    fn initializes() {
        let beneficiary: AccountId = BENEFICIARY.parse().unwrap();
        let validator: AccountId = VALIDATOR.parse().unwrap();
        let contract = Contract::new(beneficiary, validator);
        assert_eq!(contract.beneficiary, BENEFICIARY.parse().unwrap())
    }

    #[test]
    fn donate() {
        let beneficiary: AccountId = BENEFICIARY.parse().unwrap();
        let validator: AccountId = VALIDATOR.parse().unwrap();
        let mut contract = Contract::new(beneficiary, validator);

        // Make a donation
        set_context("donor_a", 1*NEAR);
        let first_donation_idx = contract.donate();
        let first_donation: Donation = contract.get_donation_by_number(first_donation_idx);

        // Check the donation was recorded correctly
        assert_eq!(first_donation_idx, 1);
        assert_eq!(first_donation.donor, "donor_a".parse().unwrap());
        assert_eq!(first_donation.amount, 1*NEAR);

        // Make another donation
        set_context("donor_b", 2*NEAR);
        let second_donation_idx = contract.donate();
        let second_donation: Donation = contract.get_donation_by_number(second_donation_idx);

        // Check the donation was recorded correctly
        assert_eq!(second_donation_idx, 2);
        assert_eq!(second_donation.donor, "donor_b".parse().unwrap());
        assert_eq!(second_donation.amount, 2*NEAR);

        assert_eq!(contract.total_donations(), 2);
    }

    // Auxiliary fn: create a mock context
    fn set_context(predecessor: &str, amount: Balance) {
      let mut builder = VMContextBuilder::new();
      builder.predecessor_account_id(predecessor.parse().unwrap());
      builder.attached_deposit(amount);

      testing_env!(builder.build());
  }
}
