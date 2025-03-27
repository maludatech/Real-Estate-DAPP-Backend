import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-ethers";

const tokens = (n: any) => {
  return ethers.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  let buyer: any, seller: any, inspector: any, lender: any;
  let realEstate: any, escrow: any;
  let contractAddress: string;

  beforeEach(async () => {
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    // Deploy RealEstate contract
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    await realEstate.waitForDeployment();
    contractAddress = await realEstate.getAddress();

    // Mint NFT
    let transaction = await realEstate
      .connect(seller)
      .mintNFT(
        seller.address,
        "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"
      );
    await transaction.wait();

    // Deploy Escrow contract
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      contractAddress,
      seller.address,
      inspector.address,
      lender.address
    );
    await escrow.waitForDeployment();
  });

  describe("Deployment", () => {
    it("Returns NFT address", async () => {
      const result = await escrow.nftAddress();
      expect(result).to.be.equal(contractAddress);
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
});

describe("Listing", () => {
  let buyer: any, seller: any, inspector: any, lender: any;
  let realEstate: any, escrow: any;
  let contractAddress: string;

  beforeEach(async () => {
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    // Deploy RealEstate contract
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    await realEstate.waitForDeployment();
    contractAddress = await realEstate.getAddress(); // Missing assignment

    // Mint NFT
    let transaction = await realEstate
      .connect(seller)
      .mintNFT(
        seller.address,
        "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"
      );
    await transaction.wait();

    // Deploy Escrow contract
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      contractAddress,
      seller.address,
      inspector.address,
      lender.address
    );
    await escrow.waitForDeployment();

    // Approve Property
    transaction = await realEstate.connect(seller).approve(escrow.address, 1);
    await transaction.wait();

    // List Property
    transaction = await escrow
      .connect(seller)
      .list(1, buyer.address, tokens(10), tokens(5));
    await transaction.wait();
  });

  describe("Deployment", () => {
    it("Updates as listed", async () => {
      const result = await escrow.isListed(1);
      expect(result).to.be.equal(true);
    });
    it("Update the ownership", async () => {
      const newOwner = await realEstate.ownerOf(1);
      expect(newOwner).to.be.equal(escrow.address);
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
  });
});
