use crate::StorageExample;

impl StorageExample {
    pub fn insert_map(&mut self, key: String, value: i32) {
        self.lookup_map.insert(key, value);
    }

    pub fn remove_map(&mut self, key: String) {
        self.lookup_map.remove(&key);
    }

    pub fn get_map(&self, key: String) -> i32 {
        self.lookup_map[&key]
    }

    pub fn contains_key_map(&self, key: String) -> bool {
        self.lookup_map.contains_key(&key)
    }
}

#[cfg(test)]
mod tests {
    use near_sdk::require;
    use crate::StorageExample;

    #[test]
    fn test_map() {
        let mut contract = StorageExample::default();

        let key: String = "key".to_string();
        let value: i32 = 1;

        contract.lookup_map.insert(key.clone(), value);
        require!(contract.lookup_map.contains_key(&key), "Expected value");

        let val = contract.lookup_map[&key];
        require!(val == value, "Wrong value obtained");

        contract.lookup_map.remove(&key);
        require!(!contract.lookup_map.contains_key(&key), "Error deleting")
    }
}
