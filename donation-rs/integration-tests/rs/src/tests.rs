use serde_json::json;
use near_units::parse_near;
use workspaces::prelude::*; 
use workspaces::{network::Sandbox, Account, Contract, Worker};

const WASM_FILEPATH: &str = "../../out/donation_contract.wasm";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let worker = workspaces::sandbox().await?;
    let wasm = std::fs::read(WASM_FILEPATH)?;
    let contract = worker.dev_deploy(&wasm).await?;

    // create accounts
    let owner = worker.root_account();

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
    test_donation(&alice, &bob, &beneficiary, &contract, &worker).await?;
    test_records(&alice, &contract, &worker).await?;
    Ok(())
}   

async fn test_donation(
    alice: &Account,
    bob: &Account,
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

    bob.call(&worker, contract.id(), "donate")
       .deposit(parse_near!("2 N"))
       .transact()
       .await?;

    let new_balance = beneficiary.view_account(&worker)
    .await?
    .balance;

    const FEES: u128 = parse_near!("0.001 N");
    assert_eq!(new_balance, balance + parse_near!("3 N") - 2*FEES );

    println!("      Passed ✅ sends donation");
    Ok(())
}

async fn test_records(
    alice: &Account,
    contract: &Contract,
    worker: &Worker<Sandbox>,
) -> anyhow::Result<()> {
    let donation_idx: i32 = alice.call(&worker, contract.id(), "donate")
       .deposit(parse_near!("3 N"))
       .transact()
       .await?
       .json()?;

    assert_eq!(donation_idx, 3);

    let donation: serde_json::Value = alice.call(&worker, contract.id(), "get_donation_by_number")
       .args_json(json!({"donation_number": donation_idx}))?
       .transact()
       .await?
       .json()?;

    let expected = json!(
        {
            "amount": parse_near!("3N"),
            "donor": alice.id()
        }
    );    

    assert_eq!(donation, expected);

    println!("      Passed ✅ retrieves donation");
    Ok(())
}