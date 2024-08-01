use crate::{StorageExample, StorageExampleExt};
use near_sdk::near;

#[near]
impl StorageExample {
    pub fn insert_unordered_set(&mut self, value: i32) {
        self.unordered_set.insert(&value);
    }

    pub fn remove_unordered_set(&mut self, value: i32) {
        self.unordered_set.remove(&value);
    }

    pub fn contains_unordered_set(&self, value: i32) -> bool {
        self.unordered_set.contains(&value)
    }

    pub fn iter_unordered_set(&self, from_index: i32, limit: i32) -> Vec<i32> {
        self.unordered_set
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
    fn test_unordered_set() {
        let mut contract = StorageExample::init();
        let value: i32 = 1;

        contract.unordered_set.insert(&value);
        require!(contract.unordered_set.contains(&value), "Error adding value");

        contract.unordered_set.remove(&value);
        require!(
            !contract.unordered_set.contains(&value),
            "Error removing value"
        );
    }
}
