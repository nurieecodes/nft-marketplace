const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("NFTMarketplace", async () => {
    let deployer, 
        address1, 
        address2, 
        nft,
        marketplace
    let feePercent = 1
    let URI = "Sample URI"

    beforeEach(async () => {
        let accounts = await ethers.getSigners()
            deployer = accounts[0]
            address1 = accounts[1]
            address2 = accounts[2]
    })

    describe('Deployment', () => {
        beforeEach(async () => {
            // Deploy NFT contract
            const NFT = await ethers.getContractFactory('NFT');   
            nft = await NFT.deploy();

            // Deply Marketplace contract
            const Marketplace = await ethers.getContractFactory('Marketplace');
            marketplace = await Marketplace.deploy(feePercent);
        })

        it("Should track the name of the NFT collection", async () => {
            expect(await nft.name()).to.equal("BankOfGaming NFT")
        })

        it("Should track the symbol of the NFT collection", async () => {
            expect(await nft.symbol()).to.equal("BOG")
        })

        it("Should track the feeAccount of the marketplace", async () => {
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
        })

        it("Should track the feePercent of the marketplace", async () => {
            expect(await marketplace.feePercent()).to.equal(feePercent);
        })
    })

    describe('Minting NFTs', () => {
        it("Shoud track each minted NFT", async () => {
            await nft.connect(address1).mint(URI)
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(address1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);

            await nft.connect(address2).mint(URI)
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(address2.address)).to.equal(1);
            expect(await nft.tokenURI(2)).to.equal(URI);
        })
    })

    describe("Making marketplace items", async () => {

        describe('Success', async () => {

            beforeEach(async () => {
                await nft.connect(address1).mint(URI)
                await nft.connect(address1).setApprovalForAll(marketplace.address, true)
            })

            it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async () => {
                await expect(marketplace.connect(address1).makeItem(nft.address, 1, toWei(1)))
                    .to.emit(marketplace, "Offered")
                    .withArgs(1, nft.address, 1, toWei(1), address1.address)
                // Owner of NFT should now be the marketplace
                expect(await nft.ownerOf(1)).to.equal(marketplace.address);
                // Item count should now equal 1
                expect (await marketplace.itemCount()).to.equal(1)
                // Get item from items mapping and then check fields to ensure they are correct
                const item = await marketplace.items(1)
                expect(item.itemId).to.equal(1)
                expect(item.nft).to.equal(nft.address)
                expect(item.tokenId).to.equal(1)
                expect(item.cost).to.equal(toWei(1))
                expect(item.sold).to.equal(false)
            })
        })

        describe('Failure', async () => {

            it("Should fail if cost is set to 0", async () => {
                await expect(marketplace.connect(address1).makeItem(nft.address, 1, 0)).to.be.revertedWith("Cost must be greater than 0");
            })

        })
    })
})