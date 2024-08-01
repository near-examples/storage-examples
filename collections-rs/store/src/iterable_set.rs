use crate::{StorageExample, StorageExampleExt};
use near_sdk::near;

#[near]
impl StorageExample {
    pub fn insert_iterable_set(&mut self, value: i32) {
        self.iterable_set.insert(value);
    }

    pub fn remove_iterable_set(&mut self, value: i32) {
        self.iterable_set.remove(&value);
    }

    pub fn contains_iterable_set(&self, value: i32) -> bool {
        self.iterable_set.contains(&value)
    }

    pub fn iter_iterable_set(&self, from_index: i32, limit: i32) -> Vec<&i32> {
        self.iterable_set
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
    fn test_iterable_set() {
        let mut contract = StorageExample::default();
        let value: i32 = 1;

        contract.iterable_set.insert(value);
        require!(contract.iterable_set.contains(&value), "Error adding value");

        contract.iterable_set.remove(&value);
        require!(
            !contract.iterable_set.contains(&value),
            "Error removing value"
        );
    }
}
