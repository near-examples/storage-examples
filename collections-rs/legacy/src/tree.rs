use near_sdk::near;

use crate::StorageExample;
use crate::StorageExampleExt;

#[near]
impl StorageExample {
    pub fn insert_tree(&mut self, key: String, value: i32) {
        self.tree_map.insert(&key, &value);
    }

    pub fn remove_tree(&mut self, key: String) {
        self.tree_map.remove(&key);
    }

    pub fn get_tree(&self, key: String) -> i32 {
        self.tree_map.get(&key).expect("Expected value")
    }

    pub fn contains_key_tree(&self, key: String) -> bool {
        self.tree_map.contains_key(&key)
    }
}

#[cfg(test)]
mod tests {
    use near_sdk::require;

    use crate::StorageExample;

    #[test]
    fn test_tree() {
        let mut contract = StorageExample::init();

        let key: String = "key".to_string();
        let value: i32 = 1;

        contract.tree_map.insert(&key, &value);
        require!(contract.tree_map.contains_key(&key), "Error saving value");

        let val = contract.tree_map.get(&key).expect("Expected value");
        require!(val == value, "Wrong value obtained");

        contract.tree_map.remove(&key);
        require!(!contract.tree_map.contains_key(&key), "Error deleting")
    }
}
