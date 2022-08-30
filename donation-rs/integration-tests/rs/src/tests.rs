use serde_json::json;
use near_units::parse_near;
use workspaces::prelude::*; 
use workspaces::{network::Sandbox, Account, Contract, Worker};

const WASM_FILEPATH: &str = "../../out/main.wasm";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let worker = workspaces::sandbox().await?;
    let wasm = std::fs::read(WASM_FILEPATH)?;
    let contract = worker.dev_deploy(&wasm).await?;

    // create accounts
    let owner = worker.root_account()?;

    let alice = owner
        .create_subaccount(&worker, "alice")
        .initial_balance(parse_near!("30 N"))
        .transact()
        .await?
        .into_result()?;

    let bob = owner
        .create_subaccount(&worker, "bob")
        .initial_balance(parse_near!("30 N"))
        .transact()
        .await?
        .into_result()?;

    let beneficiary = owner
        .create_subaccount(&worker, "beneficiary")
        .initial_balance(parse_near!("30 N"))
        .transact()
        .await?
        .into_result()?;

    // Initialize contract
    contract.call(&worker, "new")
            .args_json(json!({"beneficiary": beneficiary.id()}))?
            .transact()
            .await?;

    // begin tests  
    test_donation(&alice, &beneficiary, &contract, &worker).await?;
    test_records(&bob, &contract, &worker).await?;
    Ok(())
}   

async fn test_donation(
    alice: &Account,
    beneficiary: &Account,
    contract: &Contract,
    worker: &Worker<Sandbox>,
) -> anyhow::Result<()> {
    let balance = beneficiary
        .view_account(&worker)
        .await?
        .balance;

    alice.call(&worker, contract.id(), "donate")
         .deposit(parse_near!("1 N"))
         .transact()
         .await?;

    let new_balance = beneficiary.view_account(&worker)
    .await?
    .balance;

    const FEES: u128 = parse_near!("0.001 N");
    assert_eq!(new_balance, balance + parse_near!("1 N") - FEES );

    println!("      Passed ✅ sends donation");
    Ok(())
}

async fn test_records(
    bob: &Account,
    contract: &Contract,
    worker: &Worker<Sandbox>,
) -> anyhow::Result<()> {
    bob.call(&worker, contract.id(), "donate")
       .deposit(parse_near!("3 N"))
       .transact()
       .await?;

    let donation: serde_json::Value = bob.call(&worker, contract.id(), "get_donation_for_account")
       .args_json(json!({"account_id": bob.id()}))?
       .transact()
       .await?
       .json()?;

    let expected = json!(
        {
            "total_amount": parse_near!("3N").to_string(),
            "account_id": bob.id()
        }
    );    

    assert_eq!(donation, expected);

    println!("      Passed ✅ retrieves donation");
    Ok(())
}
