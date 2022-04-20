const { wallet_balance, create_contract } = require('./near_wrapper')
const { utils: { format: { formatNearAmount, parseNearAmount } }, } = nearAPI

const TGAS = 1000000000000

deposit_and_stake = async function (amount, contract) {
	amount = parseNearAmount(amount.toString())
	let result = await contract.account.functionCall(
		{
			contractId: nearConfig.contractName, methodName: 'deposit_and_stake', args: {},
			gas: 10 * TGAS, attachedDeposit: amount
		}
	)
	return nearAPI.providers.getTransactionLastResult(result)
}

query_user_funds = async function (validator_id, user_id, contract) {
	let funds = await contract.query_user_funds({ validator_id, user_id })

	// Sometimes the result is in scientific notation, parse it to full string
	funds = funds.toLocaleString('fullwide', {useGrouping:false})

	// return as a Number
	return Number(formatNearAmount(funds))
}

// Class to simplify interacting with the contract
class User {
	constructor(accountId) {
		this.accountId = accountId;
		this.contract;
	}

	query_user_funds(validator_id, user_id){ return query_user_funds(validator_id, user_id, this.contract) }
}

class ValidatorUser {
	constructor(accountId) {
		this.accountId = accountId;
		this.contract;
	}

	deposit_and_stake(amount){ return deposit_and_stake(amount, this.contract) }
}

async function create_user(accountId) {
	let user = new User(accountId)
	const viewMethods = ['']
	const changeMethods = ['query_user_funds']
	user.contract = await create_contract(accountId, viewMethods, changeMethods)
	return user
}

async function create_user_validator(accountId, validator_address) {
	let user = new ValidatorUser(accountId)
	const viewMethods = ['']
	const changeMethods = ['deposit_and_stake']
	user.contract = await create_contract(accountId, viewMethods, changeMethods, validator_address)
	return user
}

module.exports = { create_user, create_user_validator, wallet_balance }