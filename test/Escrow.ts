import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-ethers";

const tokens = (n: any) => {
  return ethers.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  it("saves the addresses", async () => {
    const signers = await ethers.getSigners();
    console.log(signers);

    //deploy real estate contract
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const realEstate = await RealEstate.deploy();
    const contractAddress = await realEstate.getAddress();
    console.log(contractAddress);

    let transaction = await realEstate.mintNFT(
      signers[0].address,
      "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"
    );
    console.log("Transaction:", transaction);
  });
});
