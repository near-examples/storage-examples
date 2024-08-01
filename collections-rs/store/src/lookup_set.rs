use crate::{StorageExample, StorageExampleExt};
use near_sdk::near;

#[near]
impl StorageExample {
    pub fn insert_set(&mut self, value: i32) {
        self.lookup_set.insert(value);
    }

    pub fn remove_set(&mut self, value: i32) {
        self.lookup_set.remove(&value);
    }

    pub fn contains_set(&self, value: i32) -> bool {
        self.lookup_set.contains(&value)
    }
}

#[cfg(test)]
mod tests {
    use crate::StorageExample;
    use near_sdk::require;

    #[test]
    fn test_lookup_set() {
        let mut contract = StorageExample::default();
        let value: i32 = 1;

        contract.lookup_set.insert(value);
        require!(contract.lookup_set.contains(&value), "Error adding value");

        contract.lookup_set.remove(&value);
        require!(
            !contract.lookup_set.contains(&value),
            "Error removing value"
        );
    }
}
