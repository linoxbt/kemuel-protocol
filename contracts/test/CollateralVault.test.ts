import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { assetIdFor, currentTimestamp, signAttestation, ASSET_TYPE_PHYSICAL } from './helpers';

const VAULT_LIQUIDITY = ethers.parseUnits('1000000', 6);

describe('CollateralVault', () => {
  async function deployFixture() {
    const [admin, oracle, borrower] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    const usdt = await MockUSDT.deploy(admin.address);
    await usdt.waitForDeployment();

    const Registry = await ethers.getContractFactory('AttestationRegistry');
    const registry = await Registry.deploy(admin.address);
    await registry.waitForDeployment();
    const ORACLE_ROLE = await registry.ORACLE_ROLE();
    await registry.connect(admin).grantRole(ORACLE_ROLE, oracle.address);

    const Vault = await ethers.getContractFactory('CollateralVault');
    const vault = await Vault.deploy(await registry.getAddress(), await usdt.getAddress());
    await vault.waitForDeployment();

    // Pre-fund the vault so it can lend — see the vault's own NatSpec on
    // openLoan for why this is the chosen funding model.
    await usdt.connect(admin).mint(await vault.getAddress(), VAULT_LIQUIDITY);

    return { registry, vault, usdt, admin, oracle, borrower, ORACLE_ROLE };
  }

  async function attestValue(
    registry: any,
    oracle: any,
    assetId: string,
    value: bigint,
    confidenceBps: number
  ) {
    const timestamp = await currentTimestamp();
    const dataHash = ethers.id('demo-evidence');
    const signature = await signAttestation(oracle, {
      assetId,
      assetType: ASSET_TYPE_PHYSICAL,
      value,
      confidenceBps,
      dataHash,
      timestamp,
    });
    await registry.submitAttestation(assetId, ASSET_TYPE_PHYSICAL, value, confidenceBps, dataHash, timestamp, signature);
  }

  it('opens a loan against a confident, healthy attestation (happy path)', async () => {
    const { registry, vault, usdt, oracle, borrower } = await loadFixture(deployFixture);
    const assetId = assetIdFor('forklift-01');
    await attestValue(registry, oracle, assetId, ethers.parseUnits('20000', 18), 8500);

    const principal = ethers.parseUnits('10000', 6); // 50% LTV
    await expect(vault.connect(borrower).openLoan(assetId, principal, 8000))
      .to.emit(vault, 'LoanOpened')
      .withArgs(0, borrower.address, assetId, principal);

    expect(await usdt.balanceOf(borrower.address)).to.equal(principal);
    expect(await vault.currentLTV(0)).to.equal(5000n); // 50.00%
  });

  it('rejects opening a loan when the attestation is below MIN_CONFIDENCE', async () => {
    const { registry, vault, oracle, borrower } = await loadFixture(deployFixture);
    const assetId = assetIdFor('forklift-02');
    await attestValue(registry, oracle, assetId, ethers.parseUnits('20000', 18), 5000); // below 7000

    const principal = ethers.parseUnits('5000', 6);
    await expect(vault.connect(borrower).openLoan(assetId, principal, 8000)).to.be.revertedWithCustomError(
      vault,
      'AttestationNotConfident'
    );
  });

  it('rejects opening a loan whose LTV is already unhealthy at open time', async () => {
    const { registry, vault, oracle, borrower } = await loadFixture(deployFixture);
    const assetId = assetIdFor('forklift-03');
    await attestValue(registry, oracle, assetId, ethers.parseUnits('10000', 18), 9000);

    const principal = ethers.parseUnits('9000', 6); // 90% LTV, above an 80% threshold
    await expect(vault.connect(borrower).openLoan(assetId, principal, 8000)).to.be.revertedWithCustomError(
      vault,
      'LoanNotHealthyAtOpen'
    );
  });

  it('emits MarginCall when LTV enters the warning zone but is not yet liquidatable', async () => {
    const { registry, vault, oracle, borrower } = await loadFixture(deployFixture);
    const assetId = assetIdFor('forklift-04');
    await attestValue(registry, oracle, assetId, ethers.parseUnits('20000', 18), 9000);

    const principal = ethers.parseUnits('10000', 6); // 50% LTV, threshold 8000 -> healthy
    await vault.connect(borrower).openLoan(assetId, principal, 8000);

    // Collateral value drops: new LTV = 10000/13500 = ~74.07%, which is
    // >= 90% of the 80% threshold (72%) but < 80% itself -> margin call zone.
    await attestValue(registry, oracle, assetId, ethers.parseUnits('13500', 18), 9000);

    await expect(vault.checkAndLiquidate(0)).to.emit(vault, 'MarginCall');
  });

  it('liquidates a loan once LTV crosses the liquidation threshold', async () => {
    const { registry, vault, oracle, borrower } = await loadFixture(deployFixture);
    const assetId = assetIdFor('forklift-05');
    await attestValue(registry, oracle, assetId, ethers.parseUnits('20000', 18), 9000);

    const principal = ethers.parseUnits('10000', 6); // 50% LTV, threshold 8000
    await vault.connect(borrower).openLoan(assetId, principal, 8000);

    // Collateral value crashes: new LTV = 10000/11000 = ~90.9%, above threshold.
    await attestValue(registry, oracle, assetId, ethers.parseUnits('11000', 18), 9000);

    await expect(vault.checkAndLiquidate(0)).to.emit(vault, 'Liquidated');

    const loan = await vault.getLoan(0);
    expect(loan.active).to.equal(false);
  });

  it('reverts checkAndLiquidate when the loan is healthy', async () => {
    const { registry, vault, oracle, borrower } = await loadFixture(deployFixture);
    const assetId = assetIdFor('forklift-06');
    await attestValue(registry, oracle, assetId, ethers.parseUnits('20000', 18), 9000);

    const principal = ethers.parseUnits('5000', 6); // 25% LTV, threshold 8000
    await vault.connect(borrower).openLoan(assetId, principal, 8000);

    await expect(vault.checkAndLiquidate(0)).to.be.revertedWithCustomError(vault, 'NotLiquidatable');
  });

  it('supports partial and full repayment, closing the loan at zero principal', async () => {
    const { registry, vault, usdt, admin, oracle, borrower } = await loadFixture(deployFixture);
    const assetId = assetIdFor('forklift-07');
    await attestValue(registry, oracle, assetId, ethers.parseUnits('20000', 18), 9000);

    const principal = ethers.parseUnits('10000', 6);
    await vault.connect(borrower).openLoan(assetId, principal, 8000);

    // Borrower needs USDT to repay with — mint them some on top of the principal received.
    await usdt.connect(admin).mint(borrower.address, ethers.parseUnits('10000', 6));
    await usdt.connect(borrower).approve(await vault.getAddress(), ethers.parseUnits('20000', 6));

    await expect(vault.connect(borrower).repay(0, ethers.parseUnits('4000', 6)))
      .to.emit(vault, 'Repaid')
      .withArgs(0, ethers.parseUnits('4000', 6), ethers.parseUnits('6000', 6));

    await expect(vault.connect(borrower).repay(0, ethers.parseUnits('6000', 6)))
      .to.emit(vault, 'Repaid')
      .withArgs(0, ethers.parseUnits('6000', 6), 0);

    const loan = await vault.getLoan(0);
    expect(loan.active).to.equal(false);
  });
});
