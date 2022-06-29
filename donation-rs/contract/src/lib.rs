use near_sdk::json_types::U128;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, log, near_bindgen, AccountId, Promise, Balance};
use near_sdk::collections::{UnorderedMap};

pub const STORAGE_COST: u128 = 1_000_000_000_000_000_000_000;

mod views;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
  pub beneficiary: AccountId,
  pub donations: UnorderedMap<AccountId, u128>,
}

impl Default for Contract {
  fn default() -> Self {
    Self{
      beneficiary: "v1.faucet.nonofficial.testnet".parse().unwrap(),
      donations: UnorderedMap::new(b"d"),
    }
  }
}

#[near_bindgen]
impl Contract {
  #[init]
  #[private] // Public - but only callable by env::current_account_id()
  pub fn new(beneficiary: AccountId) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    Self {
      beneficiary,
      donations: UnorderedMap::new(b"d"),
    }
  }

  #[payable] // Public - People can attach money
  pub fn donate(&mut self) {
    // assert enough money was attached to at least cover the storage
    let mut donation_amount: Balance = env::attached_deposit();
    assert!(donation_amount >= STORAGE_COST, "Attach at least {} yoctoNEAR", STORAGE_COST);
    // Subtract the storage cost from the donation amount
    donation_amount -= STORAGE_COST;

    // Get who is calling the method
    let donor: AccountId = env::predecessor_account_id();

    // Record the donation less the storage cost. If the donor already has a donation, add to it.
    let mut current_donation = self.donations.get(&donor).unwrap_or(0);
    current_donation += donation_amount;
    self.donations.insert(&donor, &current_donation);
    
    log!("Thank you {} for donating {}! Your total donations are now {}", donor.clone(), donation_amount, current_donation);
    
    // Send the money to the beneficiary
    Promise::new(self.beneficiary.clone()).transfer(donation_amount);
  }

  // Public - but only callable by env::current_account_id(). Sets the beneficiary
  #[private]
  pub fn change_beneficiary(&mut self, beneficiary: AccountId) {
    self.beneficiary = beneficiary;
  }
}


#[cfg(test)]
mod tests {
  use super::*;
  use near_sdk::testing_env;
  use near_sdk::test_utils::VMContextBuilder;

  const BENEFICIARY: &str = "beneficiary";
  const NEAR: u128 = 1000000000000000000000000;

  #[test]
  fn initializes() {
      let contract = Contract::new(BENEFICIARY.parse().unwrap());
      assert_eq!(contract.beneficiary, BENEFICIARY.parse().unwrap())
  }

  #[test]
  fn donate() {
      let mut contract = Contract::new(BENEFICIARY.parse().unwrap());

      // Make a donation
      set_context("donor_a", 1*NEAR);
      contract.donate();
      let first_donation = contract.get_donation_for_account("donor_a".parse().unwrap());

      // Check the donation was recorded correctly
      assert_eq!(first_donation.total_amount.0, 1*NEAR - STORAGE_COST);

      // Make another donation
      set_context("donor_b", 2*NEAR);
      contract.donate();
      let second_donation = contract.get_donation_for_account("donor_b".parse().unwrap());

      // Check the donation was recorded correctly
      assert_eq!(second_donation.total_amount.0, 2*NEAR - STORAGE_COST);

      // User A makes another donation on top of their original
      set_context("donor_a", 1*NEAR);
      contract.donate();
      let first_donation = contract.get_donation_for_account("donor_a".parse().unwrap());

      // Check the donation was recorded correctly
      assert_eq!(first_donation.total_amount.0, (1*NEAR - STORAGE_COST) * 2);

      assert_eq!(contract.total_donations(), 2);
  }

  // Auxiliar fn: create a mock context
  fn set_context(predecessor: &str, amount: Balance) {
    let mut builder = VMContextBuilder::new();
    builder.predecessor_account_id(predecessor.parse().unwrap());
    builder.attached_deposit(amount);

    testing_env!(builder.build());
  }
}