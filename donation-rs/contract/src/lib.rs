use near_sdk::collections::Vector;
use near_sdk::{env, log, near_bindgen, AccountId, Promise, Balance};

pub mod model;
pub use crate::model::*;

#[near_bindgen]
impl Contract {
  #[init]
  #[private] // Public - but only callable by env::current_account_id()
  pub fn new(beneficiary: AccountId) -> Self {
    assert!(!env::state_exists(), "Already initialized");
    Self {
      beneficiary: beneficiary,
      donations: Vector::new(b"vec-uid-1".to_vec()),
    }
  }

  #[payable] // Public - People can attach money
  pub fn donate(&mut self) -> u64 {
    // Get who is calling the method, and how much NEAR they attached
    let donor: AccountId = env::predecessor_account_id();
    let amount: Balance = env::attached_deposit();

    // Record the donation
    let donation_number: u64 = self.add_donation(donor.clone(), amount);
    log!("Thank you {}! donation number: {}", donor.clone(), donation_number);

    // Send the money to the beneficiary
    Promise::new(self.beneficiary.clone()).transfer(amount - STORAGE_COST);

    return donation_number;
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
  pub fn total_number_of_donation(&self) -> u64 {
    return self.donations.len();
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

        assert_eq!(contract.total_number_of_donation(), 2);
    }

    // Auxiliar fn: create a mock context
    fn set_context(predecessor: &str, amount: Balance) {
      let mut builder = VMContextBuilder::new();
      builder.predecessor_account_id(predecessor.parse().unwrap());
      builder.attached_deposit(amount);

      testing_env!(builder.build());
  }
}
