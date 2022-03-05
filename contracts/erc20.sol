// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "./ERC20Interface.sol";

contract Cryptos is ERC20Interface {
	string public name = "Cryptos";
	string public symbol = "CRPT";
	uint public decimals = 0;
	uint public override totalSupply;
	address public founder;

	mapping(address => uint) public balances;
	mapping(address => mapping(address => uint)) allowed;

	constructor() {
		totalSupply = 1000000;
		founder = msg.sender;
		balances[founder] = totalSupply;
	}

	function balanceOf(address _owner) public view override returns (uint256 balance){
		return balances[_owner];
	}

	function transfer(address _to, uint256 _value) public virtual override returns (bool success){
		require(balances[msg.sender] >= _value, 'Do not have enough balance in the account');
		balances[_to] += _value;
		balances[msg.sender] -= _value;

		emit Transfer(msg.sender, _to, _value);
		return true;
	}

	function allowance(address _owner, address _spender) public virtual override view returns (uint256 remaining){
		return allowed[_owner][_spender];
	}

	function approve(address _spender, uint256 _value) public override returns (bool success){
		require(balanceOf(msg.sender) >= _value, 'Not enough balance in sender account');
		require(_value > 0, '0 not allowed');

		allowed[msg.sender][_spender] = _value;

		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) public virtual override returns (bool success){
		require(balanceOf(_from) >= _value, 'Not enough balance in sender account');

		uint allowedBalance = allowed[_from][msg.sender];
		require(allowedBalance >= _value, 'Required amount not allowed');
		balances[_to] += _value;
		balances[_from] -= _value;

		allowed[_from][msg.sender] -= _value;

		emit Transfer(_from, _to, _value);
		return true;
	}
}