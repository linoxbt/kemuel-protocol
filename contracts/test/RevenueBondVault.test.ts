import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { assetIdFor, currentTimestamp, signAttestation, ASSET_TYPE_PHYSICAL, ASSET_TYPE_REVENUE } from './helpers';

const VAULT_LIQUIDITY = ethers.parseUnits('1000000', 6);

describe('RevenueBondVault', () => {
  async function deployFixture() {
    const [admin, oracle, issuer] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    const usdt = await MockUSDT.deploy(admin.address);
    await usdt.waitForDeployment();

    const Registry = await ethers.getContractFactory('AttestationRegistry');
    const registry = await Registry.deploy(admin.address);
    await registry.waitForDeployment();
    const ORACLE_ROLE = await registry.ORACLE_ROLE();
    await registry.connect(admin).grantRole(ORACLE_ROLE, oracle.address);

    const Vault = await ethers.getContractFactory('RevenueBondVault');
    const vault = await Vault.deploy(await registry.getAddress(), await usdt.getAddress());
    await vault.waitForDeployment();

    await usdt.connect(admin).mint(await vault.getAddress(), VAULT_LIQUIDITY);

    return { registry, vault, usdt, admin, oracle, issuer, ORACLE_ROLE };
  }

  async function attestRevenue(
    registry: any,
    oracle: any,
    businessId: string,
    periodRevenue: bigint,
    confidenceBps: number,
    assetType = ASSET_TYPE_REVENUE
  ) {
    const timestamp = await currentTimestamp();
    const dataHash = ethers.id('stripe-stats-placeholder');
    const signature = await signAttestation(oracle, {
      assetId: businessId,
      assetType,
      value: periodRevenue,
      confidenceBps,
      dataHash,
      timestamp,
    });
    await registry.submitAttestation(businessId, assetType, periodRevenue, confidenceBps, dataHash, timestamp, signature);
  }

  it('issues a bond against a confident Revenue attestation (happy path)', async () => {
    const { registry, vault, usdt, oracle, issuer } = await loadFixture(deployFixture);
    const businessId = assetIdFor('acme-coffee-shop');
    await attestRevenue(registry, oracle, businessId, ethers.parseUnits('50000', 18), 8200);

    const principal = ethers.parseUnits('20000', 6);
    await expect(vault.connect(issuer).issueBond(businessId, principal, 500))
      .to.emit(vault, 'BondIssued')
      .withArgs(0, issuer.address, principal, 500);

    expect(await usdt.balanceOf(issuer.address)).to.equal(principal);
    const bond = await vault.getBond(0);
    expect(bond.outstandingBalance).to.equal(principal);
    expect(bond.active).to.equal(true);
  });

  it('rejects issuing a bond against a Physical (non-Revenue) attestation', async () => {
    const { registry, vault, oracle, issuer } = await loadFixture(deployFixture);
    const businessId = assetIdFor('acme-coffee-shop-2');
    await attestRevenue(registry, oracle, businessId, ethers.parseUnits('50000', 18), 8200, ASSET_TYPE_PHYSICAL);

    await expect(
      vault.connect(issuer).issueBond(businessId, ethers.parseUnits('10000', 6), 500)
    ).to.be.revertedWithCustomError(vault, 'NotRevenueAttestation');
  });

  it('rejects issuing a bond when confidence is below MIN_CONFIDENCE', async () => {
    const { registry, vault, oracle, issuer } = await loadFixture(deployFixture);
    const businessId = assetIdFor('acme-coffee-shop-3');
    await attestRevenue(registry, oracle, businessId, ethers.parseUnits('50000', 18), 4000);

    await expect(
      vault.connect(issuer).issueBond(businessId, ethers.parseUnits('10000', 6), 500)
    ).to.be.revertedWithCustomError(vault, 'AttestationNotConfident');
  });

  it('settles revenue, pulling the revenue-share repayment from the issuer', async () => {
    const { registry, vault, usdt, admin, oracle, issuer } = await loadFixture(deployFixture);
    const businessId = assetIdFor('acme-coffee-shop-4');
    await attestRevenue(registry, oracle, businessId, ethers.parseUnits('50000', 18), 8200);

    const principal = ethers.parseUnits('20000', 6);
    await vault.connect(issuer).issueBond(businessId, principal, 500); // 5% revenue share

    // Issuer needs USDT on hand to make the revenue-share payment, and must
    // approve the vault to pull it.
    await usdt.connect(admin).mint(issuer.address, ethers.parseUnits('5000', 6));
    await usdt.connect(issuer).approve(await vault.getAddress(), ethers.parseUnits('5000', 6));

    // New period revenue attestation: 50000 * 5% = 2500 repayment.
    await attestRevenue(registry, oracle, businessId, ethers.parseUnits('50000', 18), 8200);

    await expect(vault.settleRevenue(0))
      .to.emit(vault, 'RevenueSettled')
      .withArgs(0, ethers.parseUnits('2500', 6), ethers.parseUnits('17500', 6));

    const bond = await vault.getBond(0);
    expect(bond.outstandingBalance).to.equal(ethers.parseUnits('17500', 6));
    expect(bond.active).to.equal(true);
  });

  it('caps the final settlement at outstandingBalance and emits BondRepaidInFull', async () => {
    const { registry, vault, usdt, admin, oracle, issuer } = await loadFixture(deployFixture);
    const businessId = assetIdFor('acme-coffee-shop-5');
    await attestRevenue(registry, oracle, businessId, ethers.parseUnits('50000', 18), 8200);

    const principal = ethers.parseUnits('1000', 6);
    await vault.connect(issuer).issueBond(businessId, principal, 500); // owes only 1000

    await usdt.connect(admin).mint(issuer.address, ethers.parseUnits('5000', 6));
    await usdt.connect(issuer).approve(await vault.getAddress(), ethers.parseUnits('5000', 6));

    // 5% of 50000 = 2500, which exceeds the 1000 outstanding -> capped.
    await attestRevenue(registry, oracle, businessId, ethers.parseUnits('50000', 18), 8200);

    await expect(vault.settleRevenue(0))
      .to.emit(vault, 'RevenueSettled')
      .withArgs(0, ethers.parseUnits('1000', 6), 0)
      .and.to.emit(vault, 'BondRepaidInFull')
      .withArgs(0);

    const bond = await vault.getBond(0);
    expect(bond.active).to.equal(false);
  });
});
