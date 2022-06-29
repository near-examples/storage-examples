import { Worker, NEAR, NearAccount } from "near-workspaces";
import anyTest, { TestFn } from "ava";
import { parseNearAmount } from "near-api-js/lib/utils/format";

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // deploy contract
  const root = worker.rootAccount;
  const contract = await root.createAndDeploy(
    root.getSubAccount("donation").accountId,
    "./out/main.wasm",
    { initialBalance: NEAR.parse("30 N").toJSON() }
  );

  const beneficiary = await root.createSubAccount("beneficiary", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });

  const alice = await root.createSubAccount("alice", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });

  const bob = await root.createSubAccount("bob", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });

  // Initialize contract
  await contract.call(contract, "new", { beneficiary: beneficiary.accountId });

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, contract, beneficiary, alice, bob };
});

test("cannot be initialized twice", async (t) => {
  const { contract, alice, beneficiary } = t.context.accounts;
  await t.throwsAsync(alice.call(contract, "init", { beneficiary: beneficiary.accountId }));
});

test("sends donations to the beneficiary", async (t) => {
  const { contract, alice, bob, beneficiary } = t.context.accounts;

  const balance = await beneficiary.balance()
  const available = parseFloat(balance.available.toHuman())

  await alice.call(contract, "donate", {}, {attachedDeposit: NEAR.parse("1 N").toString()});

  const new_balance = await beneficiary.balance()
  const new_available = parseFloat(new_balance.available.toHuman())

  const FEES: number = 0.001
  t.is(new_available, available + 1 - FEES)
});

test("records the donation", async (t) => {
  const { contract, bob } = t.context.accounts;

  await bob.call(contract, "donate", {}, {attachedDeposit: NEAR.parse("2 N").toString()});

  class Donation{ total_amount: string = ""; account_id: string = ""; }
  const donation: Donation = await contract.view("get_donation_for_account", {account_id: bob.accountId})
  
  t.is(donation.account_id, bob.accountId)
  t.is(donation.total_amount, parseNearAmount("3"))
});

test.afterEach(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error);
  });
});