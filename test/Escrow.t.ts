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
    console.log("RealEstate Contract Address:", contractAddress);

    // Mint NFT
    let transaction = await realEstate
      .connect(seller)
      .mintNFT(
        buyer.address,
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
    it("returns NFT address", async () => {
      const result = await escrow.nftAddress();
      expect(result).to.be.equal(contractAddress);
    });

    it("returns seller", async () => {
      const result = await escrow.seller();
      expect(result).to.be.equal(seller.address);
    });

    it("returns inspector", async () => {
      const result = await escrow.inspector();
      expect(result).to.be.equal(inspector.address);
    });

    it("returns lender", async () => {
      const result = await escrow.lender();
      expect(result).to.be.equal(lender.address);
    });
  });
});
