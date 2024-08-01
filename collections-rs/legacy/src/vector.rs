use near_sdk::{json_types::U64, near};

use crate::StorageExample;
use crate::StorageExampleExt;

#[near]
impl StorageExample {
    pub fn vec_push(&mut self, value: i32) {
        self.vector.push(&value);
    }

    pub fn vec_get(&self, index: U64) -> i32 {
        self.vector.get(index.into()).expect("Expected value")
    }

    pub fn vec_replace(&mut self, index: U64, value: i32) {
        self.vector.replace(index.into(), &value);
    }

    pub fn vec_len(&self) -> U64 {
        U64(self.vector.len())
    }

    pub fn vec_iter(&self, from_index: i32, limit: i32) -> Vec<i32> {
        self.vector
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
    fn test_vector() {
        let mut contract = StorageExample::init();
        let value: i32 = 1;

        contract.vector.push(&value);
        contract.vector.push(&1);

        require!(contract.vector.len() == 2, "Incorrect length");

        let val = contract.vector.get(0).expect("Expected value");

        require!(val == value, "Error saving value");

        contract.vector.replace(0, &3);

        let val2 = contract.vector.get(0).expect("Expected value");

        require!(val2 == 3, "Error saving value")
    }
}
