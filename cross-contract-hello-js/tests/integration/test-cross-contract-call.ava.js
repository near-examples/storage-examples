import { Worker } from "near-workspaces";
import test from "ava";
import path from "path";

test.beforeEach(async (t) => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the onCall contract.
    const xcc = await root.createAndDeploy(root.getSubAccount("xcc").accountId, path.resolve("./build/xcc.wasm"));

    // Deploy status-message the contract.
    const helloNear = await root.createAndDeploy(root.getSubAccount("hello-near").accountId, path.resolve("./build/hello-near.wasm"));

    // Create test accounts
    const alice = await root.createSubAccount("alice");
    const bob = await root.createSubAccount("bob");

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = {
        root,
        helloNear,
        xcc,
        alice,
        bob,
    };
});

test.afterEach(async (t) => {
    await t.context.worker.tearDown().catch((error) => {
        console.log("Failed tear down the worker:", error);
    });
});

test("Initializes", async (t) => {
    const { xcc } = t.context.accounts;
    await xcc.call(xcc, "init", {});
});

test("returns the default greeting", async (t) => {
    const { xcc } = t.context.accounts;
    await xcc.call(xcc, "init", {});
    const message = await xcc.call(xcc, "query_greeting", {}, { gas: 200000000000000 });
    t.is(message, "Hello");
});

test("change the greeting", async (t) => {
    const { xcc } = t.context.accounts;
    await xcc.call(xcc, "init", {});
    const hello = await xcc.call(xcc, "query_greeting", {}, { gas: 200000000000000 });
    t.is(hello, "Hello");
    await xcc.call(xcc, "change_greeting", { new_greeting: "Howdy" }, { gas: 200000000000000 });
    const howdy = await xcc.call(xcc, "query_greeting", {}, { gas: 200000000000000 });
    t.is(howdy, "Howdy");
});
