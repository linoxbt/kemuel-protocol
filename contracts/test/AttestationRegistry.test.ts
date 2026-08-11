import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture, time } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { assetIdFor, currentTimestamp, signAttestation, ASSET_TYPE_PHYSICAL } from './helpers';

describe('AttestationRegistry', () => {
  async function deployFixture() {
    const [admin, oracle, stranger] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory('AttestationRegistry');
    const registry = await Registry.deploy(admin.address);
    await registry.waitForDeployment();

    const ORACLE_ROLE = await registry.ORACLE_ROLE();
    await registry.connect(admin).grantRole(ORACLE_ROLE, oracle.address);

    return { registry, admin, oracle, stranger, ORACLE_ROLE };
  }

  it('accepts a validly signed attestation from an ORACLE_ROLE holder (happy path)', async () => {
    const { registry, oracle } = await loadFixture(deployFixture);
    const assetId = assetIdFor('warehouse-forklift-01');
    const timestamp = await currentTimestamp();
    const dataHash = ethers.id('image-bytes-placeholder');
    const value = ethers.parseUnits('12000', 18);

    const signature = await signAttestation(oracle, {
      assetId,
      assetType: ASSET_TYPE_PHYSICAL,
      value,
      confidenceBps: 8600,
      dataHash,
      timestamp,
    });

    await expect(
      registry.submitAttestation(assetId, ASSET_TYPE_PHYSICAL, value, 8600, dataHash, timestamp, signature)
    )
      .to.emit(registry, 'AttestationSubmitted')
      .withArgs(assetId, ASSET_TYPE_PHYSICAL, value, 8600, oracle.address, timestamp);

    const latest = await registry.getLatest(assetId);
    expect(latest.value).to.equal(value);
    expect(latest.confidenceBps).to.equal(8600);
    expect(latest.signer).to.equal(oracle.address);
  });

  it('rejects a signature from an address without ORACLE_ROLE', async () => {
    const { registry, stranger } = await loadFixture(deployFixture);
    const assetId = assetIdFor('warehouse-forklift-01');
    const timestamp = await currentTimestamp();
    const dataHash = ethers.id('image-bytes-placeholder');
    const value = ethers.parseUnits('12000', 18);

    const signature = await signAttestation(stranger, {
      assetId,
      assetType: ASSET_TYPE_PHYSICAL,
      value,
      confidenceBps: 8600,
      dataHash,
      timestamp,
    });

    await expect(
      registry.submitAttestation(assetId, ASSET_TYPE_PHYSICAL, value, 8600, dataHash, timestamp, signature)
    ).to.be.revertedWithCustomError(registry, 'UnauthorizedSigner');
  });

  it('rejects a signature over a tampered value (payload/signature mismatch)', async () => {
    const { registry, oracle } = await loadFixture(deployFixture);
    const assetId = assetIdFor('warehouse-forklift-01');
    const timestamp = await currentTimestamp();
    const dataHash = ethers.id('image-bytes-placeholder');
    const signedValue = ethers.parseUnits('12000', 18);
    const submittedValue = ethers.parseUnits('99999', 18);

    const signature = await signAttestation(oracle, {
      assetId,
      assetType: ASSET_TYPE_PHYSICAL,
      value: signedValue,
      confidenceBps: 8600,
      dataHash,
      timestamp,
    });

    // Submitting a different value than what was signed recovers a
    // different (unauthorized) address from the same signature bytes.
    await expect(
      registry.submitAttestation(assetId, ASSET_TYPE_PHYSICAL, submittedValue, 8600, dataHash, timestamp, signature)
    ).to.be.revertedWithCustomError(registry, 'UnauthorizedSigner');
  });

  it('rejects a signed timestamp that has expired (older than MAX_SUBMISSION_DELAY_SECONDS)', async () => {
    const { registry, oracle } = await loadFixture(deployFixture);
    const assetId = assetIdFor('warehouse-forklift-01');
    const timestamp = await currentTimestamp();
    const dataHash = ethers.id('image-bytes-placeholder');
    const value = ethers.parseUnits('12000', 18);

    const signature = await signAttestation(oracle, {
      assetId,
      assetType: ASSET_TYPE_PHYSICAL,
      value,
      confidenceBps: 8600,
      dataHash,
      timestamp,
    });

    const maxDelay = await registry.MAX_SUBMISSION_DELAY_SECONDS();
    await time.increase(maxDelay + 10n);

    await expect(
      registry.submitAttestation(assetId, ASSET_TYPE_PHYSICAL, value, 8600, dataHash, timestamp, signature)
    ).to.be.revertedWithCustomError(registry, 'SignatureExpired');
  });

  it('reports isStale correctly for missing and aged attestations', async () => {
    const { registry, oracle } = await loadFixture(deployFixture);
    const assetId = assetIdFor('warehouse-forklift-01');

    expect(await registry.isStale(assetId, 3600)).to.equal(true);

    const timestamp = await currentTimestamp();
    const dataHash = ethers.id('image-bytes-placeholder');
    const value = ethers.parseUnits('12000', 18);
    const signature = await signAttestation(oracle, {
      assetId,
      assetType: ASSET_TYPE_PHYSICAL,
      value,
      confidenceBps: 8600,
      dataHash,
      timestamp,
    });
    await registry.submitAttestation(assetId, ASSET_TYPE_PHYSICAL, value, 8600, dataHash, timestamp, signature);

    expect(await registry.isStale(assetId, 3600)).to.equal(false);

    await time.increase(3700);
    expect(await registry.isStale(assetId, 3600)).to.equal(true);
  });

  it('keeps full history across multiple attestations for the same assetId', async () => {
    const { registry, oracle } = await loadFixture(deployFixture);
    const assetId = assetIdFor('warehouse-forklift-01');
    const dataHash = ethers.id('image-bytes-placeholder');

    for (let i = 0; i < 3; i++) {
      const timestamp = await currentTimestamp();
      const value = ethers.parseUnits(String(10000 + i * 1000), 18);
      const signature = await signAttestation(oracle, {
        assetId,
        assetType: ASSET_TYPE_PHYSICAL,
        value,
        confidenceBps: 8000,
        dataHash,
        timestamp,
      });
      await registry.submitAttestation(assetId, ASSET_TYPE_PHYSICAL, value, 8000, dataHash, timestamp, signature);
      if (i < 2) await time.increase(1);
    }

    const history = await registry.getHistory(assetId);
    expect(history.length).to.equal(3);
  });
});
