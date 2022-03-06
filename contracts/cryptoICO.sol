// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "./erc20.sol";

contract CryptosICO is Cryptos {
	address public admin;
	address payable public deposit;
	uint tokenPrice = 0.001 ether;
	uint public hardCap = 300 ether;
	uint public raisedAmount;
	uint public saleStart = block.timestamp;
	uint public saleEnd = block.timestamp + 604800;
	uint public tokenTradeStart = saleStart + 604800;
	uint maxInvestment = 5 ether;
	uint minInvestment = 0.1 ether;
	enum State {beforeStart, running, afterEnd, halted}
	State public icoState;

	constructor(address payable _deposit) {
		admin = msg.sender;
		deposit = _deposit;
		icoState = State.beforeStart;
	}

	modifier onlyAdmin(){
		require(msg.sender == admin, "Not an admin");
		_;
	}

	function halt() public onlyAdmin {
		icoState = State.halted;
	}

	function resume() public onlyAdmin {
		icoState = State.running;
	}

	function changeDepositAddress(address payable _newDeposit) public onlyAdmin {
		deposit = _newDeposit;
	}

	function getCurrentState() public view returns (State) {
		if (icoState == State.halted) {
			return State.halted;
		}
		else if (block.timestamp > saleEnd) {
			return State.afterEnd;
		}
		else if (block.timestamp < saleStart) {
			return State.beforeStart;
		}
		else return State.running;
	}

	event Invest(address _investor, uint _value, uint _token);

	function invest() public payable returns (bool){
		icoState = getCurrentState();
		require(icoState == State.running, "ICO is curently not in running state");
		require(msg.value >= minInvestment && msg.value <= maxInvestment, "investment amount breached the limit");
		raisedAmount += msg.value;
		require(raisedAmount <= hardCap, "hard cap of the ico has been reached");

		uint tokens = msg.value / tokenPrice;

		balances[msg.sender] += tokens;
		balances[founder] -= tokens;

		deposit.transfer(msg.value);

		emit Invest(msg.sender, msg.value, tokens);
		return true;
	}

	receive() external payable {
		invest();
	}

	function transfer(address _to, uint256 _value) public override returns (bool){
		require(block.timestamp > tokenTradeStart, "Trade time has not started");
		return super.transfer(_to, _value);
	}

	function transferFrom(address _from, address _to, uint256 _value) public override returns (bool){
		require(block.timestamp > tokenTradeStart, "Trade time has not started");
		return super.transferFrom(_from, _to, _value);
	}

	function burn() public returns (bool) {
		icoState = getCurrentState();
		require(icoState == State.afterEnd, "ICO is currently in running state");
		balances[founder] = 0;
		return true;
	}
}
