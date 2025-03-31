// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-ethers";

const tokens = (n: any) => {
  return ethers.parseUnits(n, "ether");
};

async function main() {
  // Setup accounts
  const [buyer, seller, inspector, lender] = await ethers.getSigners();

  // Deploy Real Estate
  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  const realEstateAddress = realEstate.getAddress();

  console.log(`Deployed Real Estate Contract at: ${realEstateAddress}`);
  console.log(`Minting 3 properties...\n`);

  for (let i = 0; i < 3; i++) {
    const transaction = await realEstate
      .connect(seller)
      .mintNFT(
        seller.address,
        `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${
          i + 1
        }.json`
      );
    await transaction.wait();
  }

  // Deploy Escrow
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstateAddress,
    seller.address,
    inspector.address,
    lender.address
  );
  const escrowAddress = await escrow.getAddress();

  console.log(`Deployed Escrow Contract at: ${escrowAddress}`);
  console.log(`Listing 3 properties...\n`);

  for (let i = 0; i < 3; i++) {
    // Approve properties...
    let transaction = await realEstate
      .connect(seller)
      .approve(escrowAddress, i + 1);
    await transaction.wait();
  }

  // Listing properties...
  let transaction = await escrow
    .connect(seller)
    .list(1, tokens(20), tokens(10), buyer.address);
  await transaction.wait();

  transaction = await escrow
    .connect(seller)
    .list(2, tokens(15), tokens(5), buyer.address);
  await transaction.wait();

  transaction = await escrow
    .connect(seller)
    .list(3, tokens(10), tokens(5), buyer.address);
  await transaction.wait();

  console.log(`Finished.`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
