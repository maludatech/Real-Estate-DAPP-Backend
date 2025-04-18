import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-ethers";

// Global variables
let buyer: any, seller: any, inspector: any, lender: any;
let realEstate: any, escrow: any;
let realEstateAddress: string, escrowAddress: string;

const tokens = (n: any) => {
  return ethers.parseUnits(n, "ether");
};

describe("Escrow", () => {
  beforeEach(async () => {
    // Setup accounts
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    // Deploy Real Estate
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    realEstateAddress = await realEstate.getAddress();

    // Mint
    let transaction = await realEstate
      .connect(seller)
      .mintNFT(
        seller.address,
        "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"
      );
    await transaction.wait();

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      realEstateAddress,
      seller.address,
      inspector.address,
      lender.address
    );
    escrowAddress = await escrow.getAddress();

    // Approve Property
    transaction = await realEstate.connect(seller).approve(escrowAddress, 1);
    await transaction.wait();

    // List Property
    transaction = await escrow
      .connect(seller)
      .list(1, tokens(10), tokens(5), buyer.address);
    await transaction.wait();
  });

  // ✅ Now all tests can access `buyer`, `seller`, `escrow`, `realEstate`, etc.

  describe("Deployment", () => {
    it("Returns NFT address", async () => {
      const result = await escrow.nftAddress();
      expect(result).to.be.equal(realEstateAddress);
    });

    it("Returns seller", async () => {
      const result = await escrow.seller();
      expect(result).to.be.equal(seller.address);
    });

    it("Returns inspector", async () => {
      const result = await escrow.inspector();
      expect(result).to.be.equal(inspector.address);
    });

    it("Returns lender", async () => {
      const result = await escrow.lender();
      expect(result).to.be.equal(lender.address);
    });
  });

  describe("Listing", () => {
    it("Updates as listed", async () => {
      const result = await escrow.isListed(1);
      expect(result).to.be.equal(true);
    });

    it("Returns buyer", async () => {
      const result = await escrow.buyer(1);
      expect(result).to.be.equal(buyer.address);
    });

    it("Returns purchase price", async () => {
      const result = await escrow.purchasePrice(1);
      expect(result).to.be.equal(tokens(10));
    });

    it("Returns escrow amount", async () => {
      const result = await escrow.escrowAmount(1);
      expect(result).to.be.equal(tokens(5));
    });

    it("Updates ownership", async () => {
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
    });
  });

  describe("Deposits", () => {
    beforeEach(async () => {
      const transaction = await escrow
        .connect(buyer)
        .depositEarnest(1, { value: tokens(5) });
      await transaction.wait();
    });

    it("Updates contract balance", async () => {
      const result = await escrow.getBalance();
      expect(result).to.be.equal(tokens(5));
    });
  });

  describe("Inspection", () => {
    beforeEach(async () => {
      const transaction = await escrow
        .connect(inspector)
        .updateInspectionStatus(1, true);
      await transaction.wait();
    });

    it("Updates inspection status", async () => {
      const result = await escrow.inspectionPassed(1);
      expect(result).to.be.equal(true);
    });
  });

  describe("Approval", () => {
    beforeEach(async () => {
      let transaction = await escrow.connect(buyer).approveSale(1);
      await transaction.wait();

      transaction = await escrow.connect(seller).approveSale(1);
      await transaction.wait();

      transaction = await escrow.connect(lender).approveSale(1);
      await transaction.wait();
    });

    it("Updates approval status", async () => {
      expect(await escrow.approval(1, buyer.address)).to.be.equal(true);
      expect(await escrow.approval(1, seller.address)).to.be.equal(true);
      expect(await escrow.approval(1, lender.address)).to.be.equal(true);
    });
  });

  describe("Sale", () => {
    beforeEach(async () => {
      let transaction = await escrow
        .connect(buyer)
        .depositEarnest(1, { value: tokens(5) });
      await transaction.wait();

      transaction = await escrow
        .connect(inspector)
        .updateInspectionStatus(1, true);
      await transaction.wait();

      transaction = await escrow.connect(buyer).approveSale(1);
      await transaction.wait();

      transaction = await escrow.connect(seller).approveSale(1);
      await transaction.wait();

      transaction = await escrow.connect(lender).approveSale(1);
      await transaction.wait();

      await lender.sendTransaction({ to: escrowAddress, value: tokens(5) });

      transaction = await escrow.connect(seller).finalizeSale(1);
      await transaction.wait();
    });

    it("Updates ownership", async () => {
      expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address);
    });

    it("Updates balance", async () => {
      expect(await escrow.getBalance()).to.be.equal(0);
    });
  });
});
