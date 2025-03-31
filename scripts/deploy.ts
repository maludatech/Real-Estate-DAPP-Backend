import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-ethers";

async function main() {
  // Setup accounts
  const [buyer, seller, inspector, lender] = await ethers.getSigners();

  // Deploy Real Estate
  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
