const {expect} = require("chai");
const {ethers} = require("hardhat");


describe("ICO test cases", () => {
  let CryptosICO, cryptosIco, owner, addr1, addr2, deposit;

  beforeEach(async () => {
    CryptosICO = await ethers.getContractFactory("CryptosICO");
    [owner, addr1, addr2, deposit] = await ethers.getSigners();
    cryptosIco = await CryptosICO.deploy(deposit.address);
  });

  describe('Deployment', () => {
    it('Test if admin, deposit and icoState is initialized', async () => {
      expect(await cryptosIco.admin()).to.be.equal(owner.address);
      expect(await cryptosIco.deposit()).to.be.equal(deposit.address);
      expect(await cryptosIco.icoState()).to.be.equal(0);
    });
  });

  describe('Halt', () => {
    it('test to halt if not admin', async () => {
      await expect(cryptosIco.connect(addr1).halt())
        .to.be.revertedWith('Not an admin');
    });

    it('test to halt', async () => {
      await cryptosIco.connect(owner).halt();
      expect(await cryptosIco.icoState()).to.be.equal(3);
    });
  });

  describe('Resume', () => {
    it('test to resume if not admin', async () => {
      await expect(cryptosIco.connect(addr1).resume())
        .to.be.revertedWith('Not an admin');
    });

    it('test to resume', async () => {
      await cryptosIco.connect(owner).resume();
      expect(await cryptosIco.icoState()).to.be.equal(1);
    });
  });

  describe('Change deposit address', () => {
    it('test to change the deposit address if not admin', async () => {
      await expect(cryptosIco.connect(addr1).resume())
        .to.be.revertedWith('Not an admin');
    });

    it('test to change the deposit address', async () => {
      await cryptosIco.connect(owner).changeDepositAddress(addr2.address);
      expect(await cryptosIco.deposit()).to.be.equal(addr2.address);
    });
  });

  describe('Invest', () => {
    it('test if invest is not in running state', async () => {
      await cryptosIco.connect(owner).halt();

      await expect(cryptosIco.invest())
        .to.be.revertedWith('ICO is curently not in running state');

      expect(await cryptosIco.getCurrentState()).to.be.equal(3);
    });

    it('test if investment amount is not within the limits', async () => {
      await expect(cryptosIco.invest({ value: ethers.utils.parseEther("0.01") }))
        .to.be.revertedWith('investment amount breached the limit');

      await expect(cryptosIco.invest({ value: ethers.utils.parseEther("6") }))
        .to.be.revertedWith('investment amount breached the limit');
    });

    it('test investment', async () => {
      const initialOwnerBalance = await cryptosIco.balanceOf(owner.address);
      await cryptosIco.connect(addr1).invest({ value: ethers.utils.parseEther("1") });

      expect(await cryptosIco.balanceOf(addr1.address)).to.be.equal(1000)
      expect(await cryptosIco.balanceOf(owner.address)).to.be.equal(initialOwnerBalance - 1000)
    });
  });

  describe('Transfer', () => {
    it('Test transfer not allowed before trade time started', async () => {
      await expect(cryptosIco.transfer(addr1.address, 50)).to.be.revertedWith('Trade time has not started');
    });

    it('Test transfer', async () => {
      await network.provider.send("evm_increaseTime", [1209602])
      await cryptosIco.connect(owner).transfer(addr1.address, 50);
    });
  });

  describe('Transfer from', () => {
    it('Test transfer from not allowed before trade time started', async () => {
      await expect(cryptosIco.transferFrom(addr1.address, addr2.address, 50)).to.be.revertedWith('Trade time has not started');
    });

    it('Test transfer from', async () => {
      await network.provider.send("evm_increaseTime", [1209602])
      await expect(cryptosIco.connect(owner).approve(addr2.address, 50));
      await cryptosIco.connect(addr2).transferFrom(owner.address, addr1.address, 50);
    });
  });

  describe('Burn', () =>{
    it('Test burn not allowed before trade time has ended', async () => {
      await expect(cryptosIco.burn()).to.be.revertedWith('ICO is currently in running state');
    });

    it('test burn', async () => {
      await network.provider.send("evm_increaseTime", [604805])
      await cryptosIco.burn();
      expect(await cryptosIco.balanceOf(owner.address)).to.be.equal(0);
    })
  });
});