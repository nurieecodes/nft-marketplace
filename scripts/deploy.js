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

  saveFrontendFiles(nft , "NFT");

  console.log(`NFT contract deployed to: ${nft.address}`)

  // Deploy Marketplace contract
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(1);

  saveFrontendFiles(marketplace , "Marketplace");

  console.log(`Marketplace contract deployed to: ${marketplace.address}`)

  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  saveFrontendFiles();
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = "/Users/nuriee.d/nft-marketplace/src/contractsData";
  console.log(contractsDir)
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
