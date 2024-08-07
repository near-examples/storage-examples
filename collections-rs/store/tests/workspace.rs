use near_workspaces::{Account, Contract};
use serde_json::json;

#[tokio::test]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // initiate environemnt
    let worker = near_workspaces::sandbox().await?;

    // deploy contracts
    let contract_wasm = near_workspaces::compile_project("./").await?;
    let contract = worker.dev_deploy(&contract_wasm).await?;

    let test_account = worker.root_account().unwrap();

    // begin tests
    test_vector(&test_account, &contract).await?;
    test_lookup_set(&test_account, &contract).await?;
    test_iterable_set(&test_account, &contract).await?;
    test_lookup_map(&test_account, &contract).await?;
    test_iterable_map(&test_account, &contract).await?;
    test_nested(&test_account, &contract).await?;

    Ok(())
}

// Vector tests
async fn test_vector(
    account: &Account,
    contract: &Contract,
) -> Result<(), Box<dyn std::error::Error>> {
    // Testing len method
    let len_res: serde_json::Value = account.view(contract.id(), "len").await?.json()?;

    assert_eq!(len_res, 0);

    // Testing push, get and len methods
    let _ = account
        .call(contract.id(), "push")
        .args_json(json!({ "value": 0 }))
        .transact()
        .await?;
    let first_get_res: serde_json::Value = account
        .view(contract.id(), "get")
        .args_json(json!({ "index": 0 }))
        .await?
        .json()?;
    let first_len_res: serde_json::Value = account.view(contract.id(), "len").await?.json()?;

    assert_eq!(first_get_res, 0);
    assert_eq!(first_len_res, 1);

    // Testing replace, get and len methods
    let _ = account
        .call(contract.id(), "replace")
        .args_json(json!({ "index": 0, "value": 1 }))
        .transact()
        .await?;
    let second_get_res: serde_json::Value = account
        .view(contract.id(), "get")
        .args_json(json!({ "index": 0 }))
        .await?
        .json()?;
    let second_len_res: serde_json::Value = account.view(contract.id(), "len").await?.json()?;

    assert_eq!(second_get_res, 1);
    assert_eq!(second_len_res, 1);

    // Testing push and iter methods
    let _ = account
        .call(contract.id(), "push")
        .args_json(json!({ "index": 1, "value": 1 }))
        .transact()
        .await?;
    let iter_res: serde_json::Value = account
        .view(contract.id(), "iter")
        .args_json(json!({ "from_index": 0, "limit": 2 }))
        .await?
        .json()?;

    assert_eq!(*iter_res.as_array().unwrap(), [1, 1]);

    Ok(())
}

// LookupSet tests
async fn test_lookup_set(
    account: &Account,
    contract: &Contract,
) -> Result<(), Box<dyn std::error::Error>> {
    // Testing insert_set and contains_set methods
    let _ = account
        .call(contract.id(), "insert_set")
        .args_json(json!({ "value": 0 }))
        .transact()
        .await?;
    let first_contains_res: serde_json::Value = account
        .view(contract.id(), "contains_set")
        .args_json(json!({ "value": 0 }))
        .await?
        .json()?;

    assert_eq!(first_contains_res, true);

    // Testing remove_set method
    let _ = account
        .call(contract.id(), "remove_set")
        .args_json(json!({ "value": 0 }))
        .transact()
        .await?;
    let second_contains_res: serde_json::Value = account
        .view(contract.id(), "contains_set")
        .args_json(json!({ "value": 0 }))
        .await?
        .json()?;

    assert_eq!(second_contains_res, false);

    Ok(())
}

// IterableSet tests
async fn test_iterable_set(
    account: &Account,
    contract: &Contract,
) -> Result<(), Box<dyn std::error::Error>> {
    // Testing insert_iterable_set and contains_iterable_set methods
    let _ = account
        .call(contract.id(), "insert_iterable_set")
        .args_json(json!({ "value": 0 }))
        .transact()
        .await?;
    let contains_res: serde_json::Value = account
        .view(contract.id(), "contains_iterable_set")
        .args_json(json!({ "value": 0 }))
        .await?
        .json()?;

    assert_eq!(contains_res, true);

    // Testing iter_iterable_set method
    let _ = account
        .call(contract.id(), "insert_iterable_set")
        .args_json(json!({ "value": 1 }))
        .transact()
        .await?;
    let iter_res: serde_json::Value = account
        .view(contract.id(), "iter_iterable_set")
        .args_json(json!({ "from_index": 0, "limit": 2 }))
        .await?
        .json()?;

    assert_eq!(iter_res.as_array().unwrap_or(&vec![])[0], json!(0));
    assert_eq!(iter_res.as_array().unwrap_or(&vec![])[1], json!(1));

    // Testing remove_iterable_set method
    let _ = account
        .call(contract.id(), "remove_iterable_set")
        .args_json(json!({ "value": 0 }))
        .transact()
        .await?;
    let second_contains_res: serde_json::Value = account
        .view(contract.id(), "contains_iterable_set")
        .args_json(json!({ "value": 0 }))
        .await?
        .json()?;

    assert_eq!(second_contains_res, false);

    Ok(())
}

// LookupMap tests
async fn test_lookup_map(
    account: &Account,
    contract: &Contract,
) -> Result<(), Box<dyn std::error::Error>> {
    // Testing insert_map and get_map methods
    let get_expected = 0;
    let _ = account
        .call(contract.id(), "insert_map")
        .args_json(json!({ "key": account.id(), "value": 0 }))
        .transact()
        .await?;
    let get_res: serde_json::Value = account
        .view(contract.id(), "get_map")
        .args_json(json!({ "key": account.id()}))
        .await?
        .json()?;

    assert_eq!(get_res, get_expected);

    // Testing contains_key_map method
    let first_contains_res: serde_json::Value = account
        .view(contract.id(), "contains_key_map")
        .args_json(json!({ "key": account.id()}))
        .await?
        .json()?;

    assert_eq!(first_contains_res, true);

    // Testing remove_map method
    let _ = account
        .call(contract.id(), "remove_map")
        .args_json(json!({ "key": account.id() }))
        .transact()
        .await?;
    let second_contains_res: serde_json::Value = account
        .view(contract.id(), "contains_key_map")
        .args_json(json!({ "key": account.id()}))
        .await?
        .json()?;

    assert_eq!(second_contains_res, false);

    Ok(())
}

// IterableMap tests
async fn test_iterable_map(
    account: &Account,
    contract: &Contract,
) -> Result<(), Box<dyn std::error::Error>> {
    // Testing insert_iterable_map and get_iterable_map methods
    let get_expected = 0;
    let _ = account
        .call(contract.id(), "insert_iterable_map")
        .args_json(json!({ "key": account.id(), "value": 0 }))
        .transact()
        .await?;
    let get_res: serde_json::Value = account
        .view(contract.id(), "get_iterable_map")
        .args_json(json!({ "key": account.id()}))
        .await?
        .json()?;

    assert_eq!(get_res, get_expected);

    // Testing contains_key_iterable_map method
    let first_contains_res: serde_json::Value = account
        .view(contract.id(), "contains_key_iterable_map")
        .args_json(json!({ "key": account.id()}))
        .await?
        .json()?;

    assert_eq!(first_contains_res, true);

    // Testing iter_iterable_map method
    let _ = account
        .call(contract.id(), "insert_iterable_map")
        .args_json(json!({ "key": contract.id(), "value": 0 }))
        .transact()
        .await?;
    let iter_res: serde_json::Value = account
        .view(contract.id(), "iter_iterable_map")
        .args_json(json!({ "from_index": 0, "limit": 2 }))
        .await?
        .json()?;

    assert_eq!(
        iter_res.as_array().unwrap_or(&vec![])[0],
        json!([account.id(), 0])
    );
    assert_eq!(
        iter_res.as_array().unwrap_or(&vec![])[1],
        json!([contract.id(), 0])
    );

    // Testing remove_iterable_map method
    let _ = account
        .call(contract.id(), "remove_iterable_map")
        .args_json(json!({ "key": account.id() }))
        .transact()
        .await?;
    let second_contains_res: serde_json::Value = account
        .view(contract.id(), "contains_key_iterable_map")
        .args_json(json!({ "key": account.id()}))
        .await?
        .json()?;

    assert_eq!(second_contains_res, false);

    Ok(())
}

// Nested tests
async fn test_nested(
    account: &Account,
    contract: &Contract,
) -> Result<(), Box<dyn std::error::Error>> {
    // Testing insert_nested and get_nested methods
    let _ = account
        .call(contract.id(), "insert_nested")
        .args_json(json!({ "key": account.id(), "value": 0 }))
        .transact()
        .await?;
    let get_res: serde_json::Value = account
        .view(contract.id(), "get_nested")
        .args_json(json!({ "key": account.id()}))
        .await?
        .json()?;

    assert_eq!(*get_res.as_array().unwrap(), [0]);

    // Testing contains_key_nested method
    let first_contains_res: serde_json::Value = account
        .view(contract.id(), "contains_key_nested")
        .args_json(json!({ "key": account.id()}))
        .await?
        .json()?;

    assert_eq!(first_contains_res, true);

    // Testing remove_nested method
    let _ = account
        .call(contract.id(), "remove_nested")
        .args_json(json!({ "key": account.id() }))
        .transact()
        .await?;
    let second_contains_res: serde_json::Value = account
        .view(contract.id(), "contains_key_nested")
        .args_json(json!({ "key": account.id()}))
        .await?
        .json()?;

    assert_eq!(second_contains_res, false);

    Ok(())
}
