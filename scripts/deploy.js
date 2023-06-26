// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy NFT contract
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();
  console.log(`NFT contract deployed to: ${nft.address}`)

  // Deploy Marketplace contract
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(1);
  console.log(`Marketplace contract deployed to: ${marketplace.address}`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
