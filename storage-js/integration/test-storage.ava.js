import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;
  const contract = await root.createSubAccount('storage')
  await contract.deploy("./build/storage.wasm");

  // Initialize storage
  await contract.call(contract, "init", { "demo_string": "hi" });

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { contract };
});

test.afterEach(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed tear down the worker:", error);
  });
});

test("vector_ops works", async (t) => {
  const { contract } = t.context.accounts;
  await contract.call(contract, "vector_ops", { value: 1 }, { gas: 200000000000000 });
  t.pass()
});

test("map_ops works", async (t) => {
  const { contract } = t.context.accounts;
  await contract.call(contract, "map_ops", { key: "key", value: 1 }, { gas: 200000000000000 });
  t.pass()
});

test("set_ops works", async (t) => {
  const { contract } = t.context.accounts;
  await contract.call(contract, "set_ops", { value: 1 }, { gas: 200000000000000 });
  t.pass()
});