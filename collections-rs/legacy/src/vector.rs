use crate::StorageExample;

impl StorageExample {
    pub fn push(&mut self, value: i32) {
        self.vector.push(&value);
    }

    pub fn get(&self, index: u64) -> i32 {
        self.vector.get(index).expect("Expected value")
    }

    pub fn replace(&mut self, index: u64, value: i32) {
        self.vector.replace(index, &value);
    }

    pub fn len(&self) -> u64 {
        self.vector.len()
    }

    pub fn iter(&self, from: i32, amount: i32) -> Vec<i32> {
        self.vector
            .iter()
            .skip(from as usize)
            .take(amount as usize)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use near_sdk::require;
    use crate::StorageExample;

    #[test]
    fn test_vector() {
        let mut contract = StorageExample::default();
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
