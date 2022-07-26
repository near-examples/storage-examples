function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }

  return desc;
}

function call(target, key, descriptor) {}
function view(target, key, descriptor) {}
function NearBindgen(target) {
  return class extends target {
    static _init() {
      // @ts-ignore
      let args = target.deserializeArgs();
      let ret = new target(args); // @ts-ignore

      ret.serialize();
      return ret;
    }

    static _get() {
      let ret = Object.create(target.prototype);
      return ret;
    }

  };
}

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
function signerAccountId() {
  env.signer_account_id(0);
  return env.read_register(0);
}
function predecessorAccountId() {
  env.predecessor_account_id(0);
  return env.read_register(0);
}
function panic(msg) {
  if (msg !== undefined) {
    env.panic(msg);
  } else {
    env.panic();
  }
}
function storageRead(key) {
  let ret = env.storage_read(key, 0);

  if (ret === 1n) {
    return env.read_register(0);
  } else {
    return null;
  }
}
function storageHasKey(key) {
  let ret = env.storage_has_key(key);

  if (ret === 1n) {
    return true;
  } else {
    return false;
  }
}
function storageGetEvicted() {
  return env.read_register(EVICTED_REGISTER);
}
function input() {
  env.input(0);
  return env.read_register(0);
}
function promiseBatchCreate(accountId) {
  return env.promise_batch_create(accountId);
}
function promiseBatchActionFunctionCall(promiseIndex, methodName, args, amount, gas) {
  env.promise_batch_action_function_call(promiseIndex, methodName, args, amount, gas);
}
var PromiseResult;

(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
function promiseReturn(promiseIdx) {
  env.promise_return(promiseIdx);
}
function storageWrite(key, value) {
  let exist = env.storage_write(key, value, EVICTED_REGISTER);

  if (exist === 1n) {
    return true;
  }

  return false;
}
function storageRemove(key) {
  let exist = env.storage_remove(key, EVICTED_REGISTER);

  if (exist === 1n) {
    return true;
  }

  return false;
}

class NearContract {
  deserialize() {
    let state = storageRead("STATE");

    if (state) {
      Object.assign(this, JSON.parse(state));
    } else {
      throw new Error("Contract state is empty");
    }
  }

  serialize() {
    storageWrite("STATE", JSON.stringify(this));
  }

  static deserializeArgs() {
    let args = input();
    return JSON.parse(args || "{}");
  }

  static serializeReturn(ret) {
    return JSON.stringify(ret);
  }

}

class LookupMap {
  constructor(keyPrefix) {
    this.keyPrefix = keyPrefix;
  }

  containsKey(key) {
    let storageKey = this.keyPrefix + key;
    return storageHasKey(storageKey);
  }

  get(key) {
    let storageKey = this.keyPrefix + key;
    return storageRead(storageKey);
  }

  remove(key) {
    let storageKey = this.keyPrefix + key;

    if (storageRemove(storageKey)) {
      return storageGetEvicted();
    }

    return null;
  }

  set(key, value) {
    let storageKey = this.keyPrefix + key;

    if (storageWrite(storageKey, value)) {
      return storageGetEvicted();
    }

    return null;
  }

  extend(kvs) {
    for (let kv of kvs) {
      this.set(kv[0], kv[1]);
    }
  }

}

var _class, _class2;

function assert(b, str) {
  if (!b) {
    panic("assertion failed: " + str);
  }
}

let FungibleToken = NearBindgen(_class = (_class2 = class FungibleToken extends NearContract {
  constructor({
    prefix,
    totalSupply
  }) {
    super();
    this.accounts = new LookupMap(prefix);
    this.totalSupply = totalSupply;
    this.accounts.set(signerAccountId(), totalSupply); // don't need accountStorageUsage like rust in JS contract, storage deposit management is automatic in JSVM
  }

  deserialize() {
    super.deserialize();
    this.accounts = Object.assign(new LookupMap(), this.accounts);
  }

  internalDeposit({
    accountId,
    amount
  }) {
    let balance = this.accounts.get(accountId) || "0";
    let newBalance = BigInt(balance) + BigInt(amount);
    this.accounts.set(accountId, newBalance.toString());
    this.totalSupply = (BigInt(this.totalSupply) + BigInt(amount)).toString();
  }

  internalWithdraw({
    accountId,
    amount
  }) {
    let balance = this.accounts.get(accountId) || "0";
    let newBalance = BigInt(balance) - BigInt(amount);
    assert(newBalance >= 0n, "The account doesn't have enough balance");
    this.accounts.set(accountId, newBalance.toString());
    let newSupply = BigInt(this.totalSupply) - BigInt(amount);
    assert(newSupply >= 0n, "Total supply overflow");
    this.totalSupply = newSupply.toString();
  }

  internalTransfer({
    senderId,
    receiverId,
    amount,
    memo
  }) {
    assert(senderId != receiverId, "Sender and receiver should be different");
    let amountInt = BigInt(amount);
    assert(amountInt > 0n, "The amount should be a positive number");
    this.internalWithdraw({
      accountId: senderId,
      amount
    });
    this.internalDeposit({
      accountId: receiverId,
      amount
    });
  }

  ftTransfer({
    receiverId,
    amount,
    memo
  }) {
    let senderId = predecessorAccountId();
    this.internalTransfer({
      senderId,
      receiverId,
      amount,
      memo
    });
  }

  ftTransferCall({
    receiverId,
    amount,
    memo,
    msg
  }) {
    let senderId = predecessorAccountId();
    this.internalTransfer({
      senderId,
      receiverId,
      amount,
      memo
    });
    const promise = promiseBatchCreate(receiverId);
    const params = {
      senderId: senderId,
      amount: amount,
      msg: msg,
      receiverId: receiverId
    };
    promiseBatchActionFunctionCall(promise, 'ftOnTransfer', JSON.stringify(params), 0, 30000000000000);
    return promiseReturn();
  }

  ftTotalSupply() {
    return this.totalSupply;
  }

  ftBalanceOf({
    accountId
  }) {
    return this.accounts.get(accountId) || "0";
  }

}, (_applyDecoratedDescriptor(_class2.prototype, "ftTransfer", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "ftTransfer"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "ftTransferCall", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "ftTransferCall"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "ftTotalSupply", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "ftTotalSupply"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "ftBalanceOf", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "ftBalanceOf"), _class2.prototype)), _class2)) || _class;

function init() {
  FungibleToken._init();
}
function ftBalanceOf() {
  let _contract = FungibleToken._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.ftBalanceOf(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function ftTotalSupply() {
  let _contract = FungibleToken._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.ftTotalSupply(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function ftTransferCall() {
  let _contract = FungibleToken._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.ftTransferCall(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function ftTransfer() {
  let _contract = FungibleToken._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.ftTransfer(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}

export { ftBalanceOf, ftTotalSupply, ftTransfer, ftTransferCall, init };
//# sourceMappingURL=fungible-token.js.map
