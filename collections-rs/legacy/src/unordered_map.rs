use near_sdk::near;

use crate::StorageExample;
use crate::StorageExampleExt;

#[near]
impl StorageExample {
    pub fn insert_unordered_map(&mut self, key: String, value: i32) {
        self.unordered_map.insert(&key, &value);
    }

    pub fn remove_unordered_map(&mut self, key: String) {
        self.unordered_map.remove(&key);
    }

    pub fn get_unordered_map(&self, key: String) -> i32 {
        self.unordered_map.get(&key).expect("Expected value")
    }

    pub fn contains_key_unordered_map(&self, key: String) -> bool {
        self.unordered_map.get(&key).is_some()
    }
}

#[cfg(test)]
mod tests {
    use near_sdk::require;

    use crate::StorageExample;

    #[test]
    fn test_unordered_map() {
        let mut contract = StorageExample::init();

        let key: String = "key".to_string();
        let value: i32 = 1;

        contract.unordered_map.insert(&key, &value);
        assert_eq!(contract.unordered_map.get(&key).unwrap(), value);

        let val = contract.unordered_map.get(&key).expect("Expected value");
        require!(val == value, "Wrong value obtained");

        contract.unordered_map.remove(&key);
        let result = std::panic::catch_unwind(|| contract.unordered_map.get(&key).unwrap());
        assert_eq!(result.is_err(), true);

    }
}
