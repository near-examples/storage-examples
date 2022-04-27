use crate::Contract;

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_map() {
    let mut contract = Contract::new("".to_string());
    let key: String = "key".to_string();
    let value: i32 = 1;

    contract.map.insert(&key, &value);
    assert!(contract.map.contains_key(&key), "Error saving value");

    let val = match contract.map.get(&key) {
      Some(x) => x,
      None => panic!("Error saving value"),
    };

    assert!(val == value, "Wrong value obtained");

    contract.map.remove(&key);
    assert!(!contract.map.contains_key(&key), "Error deleting")
  }
}
