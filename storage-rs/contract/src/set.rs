use crate::Contract;

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_set() {
    let mut contract = Contract::new("".to_string());
    let value: i32 = 1;

    contract.set.insert(&value);
    assert!(contract.set.contains(&value), "Error adding value");

    contract.set.remove(&value);
    assert!(!contract.set.contains(&value), "Error removing value");
  }
}
