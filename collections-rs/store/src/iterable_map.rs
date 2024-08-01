use crate::{StorageExample, StorageExampleExt};
use near_sdk::near;

#[near]
impl StorageExample {
    pub fn insert_iterable_map(&mut self, key: String, value: i32) {
        self.iterable_map.insert(key, value);
    }

    pub fn remove_iterable_map(&mut self, key: String) {
        self.iterable_map.remove(&key);
    }

    pub fn get_iterable_map(&self, key: String) -> i32 {
        self.iterable_map[&key]
    }

    pub fn contains_key_iterable_map(&self, key: String) -> bool {
        self.iterable_map.contains_key(&key)
    }

    pub fn iter_iterable_map(&self, from_index: i32, limit: i32) -> Vec<(&String, &i32)> {
        self.iterable_map
            .iter()
            .skip(from_index as usize)
            .take(limit as usize)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use crate::StorageExample;
    use near_sdk::require;

    #[test]
    fn test_iterable_map() {
        let mut contract = StorageExample::default();

        let key: String = "key".to_string();
        let value: i32 = 1;

        contract.iterable_map.insert(key.clone(), value);
        require!(contract.iterable_map.contains_key(&key), "Expected value");

        let val = contract.iterable_map[&key];
        require!(val == value, "Wrong value obtained");

        contract.iterable_map.remove(&key);
        require!(!contract.iterable_map.contains_key(&key), "Error deleting")
    }
}
