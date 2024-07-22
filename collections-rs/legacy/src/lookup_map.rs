use crate::StorageExample;

impl StorageExample {
    pub fn insert_lookup_map(&mut self, key: String, value: i32) {
        self.lookup_map.insert(&key, &value);
    }

    pub fn remove_lookup_map(&mut self, key: String) {
        self.lookup_map.remove(&key);
    }

    pub fn get_lookup_map(&self, key: String) -> i32 {
        self.lookup_map.get(&key).expect("Expected value")
    }

    pub fn contains_key_lookup_map(&self, key: String) -> bool {
        self.lookup_map.contains_key(&key)
    }
}

#[cfg(test)]
mod tests {
    use near_sdk::require;

    use crate::StorageExample;

    #[test]
    fn test_lookup_map() {
        let mut contract = StorageExample::default();

        let key: String = "key".to_string();
        let value: i32 = 1;

        contract.lookup_map.insert(&key, &value);
        require!(contract.lookup_map.contains_key(&key), "Error saving value");

        let val = contract.lookup_map.get(&key).expect("Expected value");
        require!(val == value, "Wrong value obtained");

        contract.lookup_map.remove(&key);
        require!(!contract.lookup_map.contains_key(&key), "Error deleting")
    }
}
