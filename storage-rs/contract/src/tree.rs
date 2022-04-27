use crate::Contract;

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_tree() {
    let mut contract = Contract::new("".to_string());
    let key: String = "key".to_string();
    let value: i32 = 1;

    contract.tree.insert(&key, &value);
    assert!(contract.tree.contains_key(&key), "Error saving value");

    let val = match contract.tree.get(&key) {
      Some(x) => x,
      None => panic!("Error saving value"),
    };

    assert!(val == value, "Wrong value obtained");

    contract.tree.remove(&key);
    assert!(!contract.tree.contains_key(&key), "Error deleting")
  }
}
