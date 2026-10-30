use std::sync::Arc;

use cargo_near_build::BuildOpts;
use near_api::{AccountId, Contract, NearToken, NetworkConfig, Signer};
use near_sandbox::Sandbox;
use serde_json::{json, Value};

type TestResult<T = ()> = Result<T, Box<dyn std::error::Error>>;

struct TestContext {
    _sandbox: Sandbox,
    network: NetworkConfig,
    contract: Contract,
    user_id: AccountId,
    signer: Arc<Signer>,
}

impl TestContext {
    async fn new() -> TestResult<Self> {
        // Build the actual contract before starting the local node.
        let artifact = cargo_near_build::build_with_cli(BuildOpts {
            manifest_path: Some(format!("{}/Cargo.toml", env!("CARGO_MANIFEST_DIR")).into()),
            no_abi: true,
            no_embed_abi: true,
            ..Default::default()
        })?;
        let code = std::fs::read(artifact)?;
        let sandbox = Sandbox::start_sandbox().await?;
        let network = NetworkConfig::from_rpc_url("sandbox", sandbox.rpc_addr.parse()?);
        let user_id: AccountId = "user.sandbox".parse()?;
        let contract_id: AccountId = "storage.sandbox".parse()?;
        for account_id in [&user_id, &contract_id] {
            sandbox
                .create_account(account_id.clone())
                .initial_balance(NearToken::from_near(10))
                .send()
                .await?;
        }
        let signer = Signer::from_secret_key(
            near_sandbox::config::DEFAULT_GENESIS_ACCOUNT_PRIVATE_KEY.parse()?,
        )?;
        Contract::deploy(contract_id.clone())
            .use_code(code)
            .without_init_call()
            .with_signer(signer.clone())
            .send_to(&network)
            .await?
            .assert_success();
        Ok(Self {
            _sandbox: sandbox,
            network,
            contract: Contract(contract_id),
            user_id,
            signer,
        })
    }

    async fn view(&self, method: &str, args: Value) -> TestResult<Value> {
        Ok(self
            .contract
            .call_function(method, args)
            .read_only()
            .fetch_from(&self.network)
            .await?
            .data)
    }

    async fn call(&self, method: &str, args: Value) -> TestResult {
        self.contract
            .call_function(method, args)
            .transaction()
            .with_signer(self.user_id.clone(), self.signer.clone())
            .send_to(&self.network)
            .await?
            .assert_success();
        Ok(())
    }
}

#[tokio::test]
async fn collections_round_trip() -> TestResult {
    let env = TestContext::new().await?;
    test_vector(&env).await?;
    test_lookup_set(&env).await?;
    test_iterable_set(&env).await?;
    test_lookup_map(&env).await?;
    test_iterable_map(&env).await?;
    test_nested(&env).await?;
    Ok(())
}

// Vector tests
async fn test_vector(env: &TestContext) -> Result<(), Box<dyn std::error::Error>> {
    // Testing len method
    let len_res: serde_json::Value = env.view("len", json!({})).await?;

    assert_eq!(len_res, 0);

    // Testing push, get and len methods
    env.call("push", json!({ "value": 0 })).await?;
    let first_get_res: serde_json::Value = env.view("get", json!({ "index": 0 })).await?;
    let first_len_res: serde_json::Value = env.view("len", json!({})).await?;

    assert_eq!(first_get_res, 0);
    assert_eq!(first_len_res, 1);

    // Testing replace, get and len methods
    env.call("replace", json!({ "index": 0, "value": 1 }))
        .await?;
    let second_get_res: serde_json::Value = env.view("get", json!({ "index": 0 })).await?;
    let second_len_res: serde_json::Value = env.view("len", json!({})).await?;

    assert_eq!(second_get_res, 1);
    assert_eq!(second_len_res, 1);

    // Testing push and iter methods
    env.call("push", json!({ "index": 1, "value": 1 })).await?;
    let iter_res: serde_json::Value = env
        .view("iter", json!({ "from_index": 0, "limit": 2 }))
        .await?;

    assert_eq!(*iter_res.as_array().unwrap(), [1, 1]);

    Ok(())
}

// LookupSet tests
async fn test_lookup_set(env: &TestContext) -> Result<(), Box<dyn std::error::Error>> {
    // Testing insert_set and contains_set methods
    env.call("insert_set", json!({ "value": 0 })).await?;
    let first_contains_res: serde_json::Value =
        env.view("contains_set", json!({ "value": 0 })).await?;

    assert_eq!(first_contains_res, true);

    // Testing remove_set method
    env.call("remove_set", json!({ "value": 0 })).await?;
    let second_contains_res: serde_json::Value =
        env.view("contains_set", json!({ "value": 0 })).await?;

    assert_eq!(second_contains_res, false);

    Ok(())
}

// IterableSet tests
async fn test_iterable_set(env: &TestContext) -> Result<(), Box<dyn std::error::Error>> {
    // Testing insert_iterable_set and contains_iterable_set methods
    env.call("insert_iterable_set", json!({ "value": 0 }))
        .await?;
    let contains_res: serde_json::Value = env
        .view("contains_iterable_set", json!({ "value": 0 }))
        .await?;

    assert_eq!(contains_res, true);

    // Testing iter_iterable_set method
    env.call("insert_iterable_set", json!({ "value": 1 }))
        .await?;
    let iter_res: serde_json::Value = env
        .view("iter_iterable_set", json!({ "from_index": 0, "limit": 2 }))
        .await?;

    assert_eq!(iter_res.as_array().unwrap_or(&vec![])[0], json!(0));
    assert_eq!(iter_res.as_array().unwrap_or(&vec![])[1], json!(1));

    // Testing remove_iterable_set method
    env.call("remove_iterable_set", json!({ "value": 0 }))
        .await?;
    let second_contains_res: serde_json::Value = env
        .view("contains_iterable_set", json!({ "value": 0 }))
        .await?;

    assert_eq!(second_contains_res, false);

    Ok(())
}

// LookupMap tests
async fn test_lookup_map(env: &TestContext) -> Result<(), Box<dyn std::error::Error>> {
    // Testing insert_map and get_map methods
    let get_expected = 0;
    env.call("insert_map", json!({ "key": env.user_id, "value": 0 }))
        .await?;
    let get_res: serde_json::Value = env.view("get_map", json!({ "key": env.user_id})).await?;

    assert_eq!(get_res, get_expected);

    // Testing contains_key_map method
    let first_contains_res: serde_json::Value = env
        .view("contains_key_map", json!({ "key": env.user_id}))
        .await?;

    assert_eq!(first_contains_res, true);

    // Testing remove_map method
    env.call("remove_map", json!({ "key": env.user_id }))
        .await?;
    let second_contains_res: serde_json::Value = env
        .view("contains_key_map", json!({ "key": env.user_id}))
        .await?;

    assert_eq!(second_contains_res, false);

    Ok(())
}

// IterableMap tests
async fn test_iterable_map(env: &TestContext) -> Result<(), Box<dyn std::error::Error>> {
    // Testing insert_iterable_map and get_iterable_map methods
    let get_expected = 0;
    env.call(
        "insert_iterable_map",
        json!({ "key": env.user_id, "value": 0 }),
    )
    .await?;
    let get_res: serde_json::Value = env
        .view("get_iterable_map", json!({ "key": env.user_id}))
        .await?;

    assert_eq!(get_res, get_expected);

    // Testing contains_key_iterable_map method
    let first_contains_res: serde_json::Value = env
        .view("contains_key_iterable_map", json!({ "key": env.user_id}))
        .await?;

    assert_eq!(first_contains_res, true);

    // Testing iter_iterable_map method
    env.call(
        "insert_iterable_map",
        json!({ "key": env.contract.account_id(), "value": 0 }),
    )
    .await?;
    let iter_res: serde_json::Value = env
        .view("iter_iterable_map", json!({ "from_index": 0, "limit": 2 }))
        .await?;

    assert_eq!(
        iter_res.as_array().unwrap_or(&vec![])[0],
        json!([env.user_id, 0])
    );
    assert_eq!(
        iter_res.as_array().unwrap_or(&vec![])[1],
        json!([env.contract.account_id(), 0])
    );

    // Testing remove_iterable_map method
    env.call("remove_iterable_map", json!({ "key": env.user_id }))
        .await?;
    let second_contains_res: serde_json::Value = env
        .view("contains_key_iterable_map", json!({ "key": env.user_id}))
        .await?;

    assert_eq!(second_contains_res, false);

    Ok(())
}

// Nested tests
async fn test_nested(env: &TestContext) -> Result<(), Box<dyn std::error::Error>> {
    // Testing insert_nested and get_nested methods
    env.call("insert_nested", json!({ "key": env.user_id, "value": 0 }))
        .await?;
    let get_res: serde_json::Value = env.view("get_nested", json!({ "key": env.user_id})).await?;

    assert_eq!(*get_res.as_array().unwrap(), [0]);

    // Testing contains_key_nested method
    let first_contains_res: serde_json::Value = env
        .view("contains_key_nested", json!({ "key": env.user_id}))
        .await?;

    assert_eq!(first_contains_res, true);

    // Testing remove_nested method
    env.call("remove_nested", json!({ "key": env.user_id }))
        .await?;
    let second_contains_res: serde_json::Value = env
        .view("contains_key_nested", json!({ "key": env.user_id}))
        .await?;

    assert_eq!(second_contains_res, false);

    Ok(())
}
