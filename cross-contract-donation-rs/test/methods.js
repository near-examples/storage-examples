const { create_contract, deploy_contract } = require('./near_wrapper')
const { utils: { format: { formatNearAmount, parseNearAmount } }, } = nearAPI

const TGAS = 1000000000000

// Contract methods
init = async function (beneficiary, stake_pool, contract) {
	return await contract.new({ args: { beneficiary, stake_pool } })
}

donate = async function (amount, contract) {
	amount = parseNearAmount(amount.toString())

	let result = await contract.donate(
		{ args: {}, gas: 80 * TGAS, amount }
	)

	return result
}

total_staked = async function (contract) {
	let staked = await contract.total_staked({ args: {} })
	staked = staked.toLocaleString('fullwide', { useGrouping: false })
	return Number(formatNearAmount(staked))
}

get_donation_by_number = async function (donation_number, contract) {
	let donation = await contract.get_donation_by_number({ donation_number })

	// Sometimes the result is in scientific notation, parse it to full string
	const amount = donation.amount.toLocaleString('fullwide', { useGrouping: false })
	donation.amount = Number(formatNearAmount(amount))
	
	return donation
}

// Class to simplify interacting with the contract
class User {
	constructor(accountId) {
		this.accountId = accountId;
		this.contract;
	}

	init(beneficiary, stake_pool) { return init(beneficiary, stake_pool, this.contract) }
	donate(amount) { return donate(amount, this.contract) }
	total_staked() { return total_staked(this.contract) }
	get_donation_by_number(donation_number) { return get_donation_by_number(donation_number, this.contract) }
}

async function create_user(accountId) {
	let user = new User(accountId)
	const viewMethods = ['get_donation_by_number']
	const changeMethods = ['new', 'donate', 'total_staked']
	user.contract = await create_contract(accountId, viewMethods, changeMethods)
	return user
}

/* 
async function deploy_and_init_stake_pool(accountId, filePath) {
	// We deploy the contract
	await deploy_contract(accountId, filePath)

	// Create a connection to the staking pool
	const viewMethods = ['']
	const changeMethods = ['new']
	let staking_pool = await create_contract(accountId, [], changeMethods, accountId)

	// Initialize it
	await staking_pool.new({
		args: {
			owner_id: accountId,
			stake_public_key: "KuTCtARNzxZQ3YvXDeLjx83FDqxv2SdQTSbiq876zR7",
			reward_fee_fraction: { numerator: 0, denominator: 1 }
		}, attachedDeposit: parseNearAmount("10"), gas: 300000000000000
	})
}
*/

module.exports = { create_user }