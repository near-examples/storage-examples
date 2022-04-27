use crate::{Contract, ONE_NEAR};

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_storage() {
    let mut contract = Contract::new("init value".to_string());

    assert!(contract.demo_u128 == ONE_NEAR, "Error in demo_u128");
    assert!(contract.demo_string == "init value".to_string(), "Error in demo_str");

    contract.demo_u128 = 0;
    assert!(contract.demo_u128 == 0, "Error in demo_u128");

    let another_string: String = "another string".to_string();
    contract.demo_string = another_string.clone();
    assert!(contract.demo_string == another_string, "Error in demo_str");
  }
}
