import { NearContract, NearBindgen, call, view, near, bytes } from "near-sdk-js";
import { get_callback_result } from "./external";
import { TGAS } from "./utils/constants";
import { assert } from "./utils/assert";

@NearBindgen
class OnCall extends NearContract {
    constructor({ account }) {
        assert(near.currentAccountId() === near.predecessorAccountId(), "Method new is private");
        super();
        this.hello_account = account;
    }

    @view
    query_greeting() {
        const promise = near.promiseBatchCreate("hello-near.test.near");
        near.promiseBatchActionFunctionCall(promise, "get_greeting", bytes(JSON.stringify({})), 0, 5 * TGAS);
        near.promiseThen(promise, near.currentAccountId(), "_query_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
        return near.promiseReturn();
    }

    @call
    _query_greeting_callback() {
        const response = get_callback_result();
        return response;
    }

    @call
    change_greeting({ new_greeting }) {
        const promise = near.promiseBatchCreate("hello-near.test.near");
        near.promiseBatchActionFunctionCall(promise, "set_greeting", bytes(JSON.stringify({ message: new_greeting })), 0, 5 * TGAS);
        near.promiseThen(promise, near.currentAccountId(), "change_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
        return near.promiseReturn();
    }

    @call
    change_greeting_callback() {
        const response = get_callback_result();
        return true;
    }
}
