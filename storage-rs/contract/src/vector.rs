use crate::Contract;

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_vector() {
    let mut contract = Contract::new("".to_string());
    let value: i32 = 1;

    contract.vector.push(&value);
    contract.vector.push(&1);

    assert!(contract.vector.len() == 2, "Incorrect length");

    let val = match contract.vector.get(0) {
      Some(x) => x,
      None => panic!("Error saving value"),
    };

    assert!(val == value, "Error saving value");

    contract.vector.replace(0, &3);
    let val2 = match contract.vector.get(0) {
      Some(x) => x,
      None => panic!("Error saving value"),
    };

    assert!(val2 == 3, "Error saving value")
  }
}
