const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("erc20 token test cases", () => {
  let Cryptos, cryptos, owner, addr1, addr2;

  beforeEach(async () => {
    Cryptos = await ethers.getContractFactory("Cryptos");
    cryptos = await Cryptos.deploy();
    [owner, addr1, addr2, _] = await ethers.getSigners();
  });

  describe('Deployment', () => {
    it('should assign all the tokens to the owner and also', async () => {
      const ownerBalance = await cryptos.balanceOf(owner.address);

      expect(await cryptos.totalSupply()).to.equal(ownerBalance);
    });

    it('should verify the owners address', async () => {
      expect(await cryptos.founder()).to.equal(owner.address);
    });
  })

  describe('Transfer', () => {
    it('test if the balance is sufficient', async () => {
      await expect(cryptos.connect(addr1).transfer(owner.address, 1))
        .to.be.revertedWith('Do not have enough balance in the account');
    })

    it('test if the balances of sender and receiver is valid', async () => {
      const ownerInitialBalance = await cryptos.balanceOf(owner.address);
      await cryptos.connect(owner).transfer(addr1.address, 50);

      expect(await cryptos.balanceOf(addr1.address)).to.be.equal(50);
      expect(await cryptos.balanceOf(owner.address)).to.be.equal(ownerInitialBalance - 50);
    });
  })

  describe('Approve', () => {
    it('test if if the approved is allowed for low balances', async () => {
      await expect(cryptos.connect(owner).approve(addr1.address, 10000000))
        .to.be.revertedWith('Not enough balance in sender account');
    })

    it('test if if the approved is allowed for 0 amount', async () => {
      await expect(cryptos.connect(owner).approve(addr1.address, 0))
        .to.be.revertedWith('0 not allowed');
    })

    it('test if if the spender is approved', async () => {
      await expect(cryptos.connect(owner).approve(addr1.address, 50));

      expect(await cryptos.allowance(owner.address, addr1.address)).to.be.equal(50);
    })
  })

  describe('Transfer from', () => {
    it('Test not enough balance', async () => {
      await expect(cryptos.connect(addr1).transferFrom(owner.address, addr2.address, 10000000))
        .to.be.revertedWith('Not enough balance in sender account');
    });

    it('Test not not allowed', async () => {
      await expect(cryptos.connect(addr1).transferFrom(owner.address, addr2.address, 50))
        .to.be.revertedWith('Required amount not allowed');
    });

    it('Test transfer-from', async () => {
      await expect(cryptos.connect(owner).approve(addr1.address, 50));
      const initialAllowance = await cryptos.allowance(owner.address, addr1.address);
      const ownerInitialBalance = await cryptos.balanceOf(owner.address);
      const addr2InitialBalance = await cryptos.balanceOf(addr2.address);
      await cryptos.connect(addr1).transferFrom(owner.address, addr2.address, 5);

      expect(await cryptos.allowance(owner.address, addr1.address))
        .to.be.equal(initialAllowance - 5);
      expect(await cryptos.balanceOf(owner.address))
        .to.be.equal(ownerInitialBalance - 5);
      expect(await cryptos.balanceOf(addr2.address))
        .to.be.equal(addr2InitialBalance + 5);
    });
  })

});
