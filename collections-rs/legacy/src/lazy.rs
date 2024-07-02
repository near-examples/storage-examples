use crate::StorageExample;

impl StorageExample {
    pub fn use_lazy(&self) -> u8 {
        self.lazy_option.get().expect("No value found")
    }

    pub fn update_lazy(&mut self, value: u8) {
        self.lazy_option.replace(&value);
    }
}

#[cfg(test)]
mod tests {
    use crate::StorageExample;

    #[test]
    fn test_map() {
        let mut contract = StorageExample::default();

        contract.lazy_option.replace(&1);
    }
}
