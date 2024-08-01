use near_sdk::near;

use crate::StorageExample;
use crate::StorageExampleExt;

#[near]
impl StorageExample {
    pub fn get_lazy(&self) -> u8 {
        self.lazy_option.get().expect("No value found")
    }

    pub fn set_lazy(&mut self, value: u8) -> bool {
        self.lazy_option.set(&value)
    }

    pub fn update_lazy(&mut self, value: u8) {
        self.lazy_option.replace(&value);
    }
}

#[cfg(test)]
mod tests {
    use crate::StorageExample;
    use near_sdk::require;

    #[test]
    fn test_lazy() {
        let mut contract = StorageExample::init();

        let lazy_option_value = contract.lazy_option.get().unwrap();
        // WHY?
        assert_eq!(lazy_option_value, 0);

        let is_value_was_present = contract.lazy_option.set(&1);
        // WHY?
        require!(is_value_was_present, "Value should not be presented");

        let previous_lazy_option = contract.lazy_option.replace(&2).unwrap();
        let current_lazy_option_value = contract.lazy_option.get().unwrap();
        assert_eq!(previous_lazy_option, 1);
        assert_eq!(current_lazy_option_value, 2);
    }
}
