import { Worker, NEAR, NearAccount } from "near-workspaces";
import anyTest, { TestFn } from "ava";

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
    "./out/donation_contract.wasm",
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
  await bob.call(contract, "donate", {}, {attachedDeposit: NEAR.parse("2 N").toString()});

  const new_balance = await beneficiary.balance()
  const new_available = parseFloat(new_balance.available.toHuman())

  const FEES: number = 0.001
  t.is(new_available, available + 3 - 2*FEES)
});

test("records the donation", async (t) => {
  const { contract, alice, bob } = t.context.accounts;

  await alice.call(contract, "donate", {}, {attachedDeposit: NEAR.parse("1 N").toString()});
  await bob.call(contract, "donate", {}, {attachedDeposit: NEAR.parse("2 N").toString()});
  const donation_idx = await alice.call(contract, "donate", {}, {attachedDeposit: NEAR.parse("3 N").toString()});

  t.is(donation_idx, 3)

  class Donation{ donor: string = ""; amount: Number = 0; }
  const donation: Donation = await contract.view("get_donation_by_number", {donation_number: donation_idx})
  
  t.is(donation.donor, alice.accountId)
  t.is(donation.amount, 3e+24)
});

test.afterEach(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error);
  });
});