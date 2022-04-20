const { wallet_balance, create_contract } = require('./near_wrapper')
const { utils: { format: { formatNearAmount, parseNearAmount } }, } = nearAPI

const TGAS = 1000000000000

// Contract methods
init = async function (beneficiary, contract) {
	return await contract.init({ args: { beneficiary } })
}

donate = async function (amount, contract) {
	amount = parseNearAmount(amount.toString())
	let result = await contract.account.functionCall(
		{
			contractId: nearConfig.contractName, methodName: 'donate', args: {},
			gas: 5 * TGAS, attachedDeposit: amount
		}
	)
	return nearAPI.providers.getTransactionLastResult(result)
}

get_donation_by_number = async function (donation_number, contract) {
	let donation = await contract.get_donation_by_number({ donation_number } )

	// Sometimes the result is in scientific notation, parse it to full string
	const amount = donation.amount.toLocaleString('fullwide', {useGrouping:false})

	// return as a Number
	donation.amount = Number(formatNearAmount(amount))
	return donation
}

// Class to simplify interacting with the contract
class User {
	constructor(accountId) {
		this.accountId = accountId;
		this.contract;
	}

	init(beneficiary) { return init(beneficiary, this.contract) }
	donate(amount) { return donate(amount, this.contract) }
	get_donation_by_number(donation_number){ return get_donation_by_number(donation_number, this.contract) }
}

async function create_user(accountId) {
	let user = new User(accountId)
	const viewMethods = ['get_donation_by_number']
	const changeMethods = ['init', 'donate']
	user.contract = await create_contract(accountId, viewMethods, changeMethods)
	return user
}

module.exports = { create_user, wallet_balance }