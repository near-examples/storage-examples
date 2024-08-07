use crate::{Prefix, StorageExample, StorageExampleExt};
use near_sdk::{near, store::Vector};

#[near]
impl StorageExample {
    pub fn insert_nested(&mut self, key: String, value: i32) {
        if self.nested.contains_key(&key) {
            let vector = self.nested.get_mut(&key).expect("Wrong key");
            vector.push(value);
        } else {
            let mut vector = Vector::new(Prefix::Nested(key.clone()));
            vector.push(value);
            self.nested.insert(key, vector);
        }
    }

    pub fn remove_nested(&mut self, key: String) {
        let vector = self.nested.get_mut(&key).expect("Wrong key");
        vector.clear();
        self.nested.remove(&key);
    }

    pub fn get_nested(&self, key: String) -> Vec<&i32> {
        self.nested[&key].iter().collect()
    }

    pub fn contains_key_nested(&self, key: String) -> bool {
        self.nested.contains_key(&key)
    }
}

#[cfg(test)]
mod tests {
    use crate::StorageExample;
    use near_sdk::require;

    #[test]
    fn test_nested() {
        let mut contract = StorageExample::default();

        let key: String = "key".to_string();
        let value = 1;

        contract.insert_nested(key.clone(), value);

        require!(contract.contains_key_nested(key.clone()), "Expected value");

        let val = contract.get_nested(key.clone());
        require!(val[0] == &1, "Wrong value obtained");

        contract.remove_nested(key.clone());

        require!(
            !contract.contains_key_nested(key),
            "Expected value to be deleted"
        );
    }
}
