const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("NFTMarketplace", async () => {

    let deployer, customer1, customer2, customer3
    let nft
    let marketplace
    let feePercent = 1
    let URI = "sample URI"

    beforeEach(async () => {
        // Get signers
        [deployer, customer1, customer2, customer3] = await ethers.getSigners();

        // Deploy NFT contract
        const NFT = await ethers.getContractFactory("NFT");   
        nft = await NFT.deploy();

        // Deploy Marketplace contract
        const Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await Marketplace.deploy(feePercent);
    })

    describe('Deployment', () => {

        it("Should track the name of the NFT collection", async () => {
            expect(await nft.name()).to.equal("Paradise NFT Collection")
        })

        it("Should track the symbol of the NFT collection", async () => {
            expect(await nft.symbol()).to.equal("PNC")
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
            
            // Customer1 mints an NFT
            await nft.connect(customer1).mint(URI)
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(customer1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);

            // Customer2 mints an NFT
            await nft.connect(customer2).mint(URI)
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(customer2.address)).to.equal(1);
            expect(await nft.tokenURI(2)).to.equal(URI);
        });
    })

    describe("Making marketplace items", async () => {
        let price = 1

        describe('Success', async () => {

            beforeEach(async () => {
                // Customer1 mints an NFT
                await nft.connect(customer1).mint(URI)
                // Customer1 approves marketplace to spend NFT
                await nft.connect(customer1).setApprovalForAll(marketplace.address, true)
            })

            it("Should track newly created item, transfer NFT from customer1 to marketplace and emit Offered event", async () => {
                await expect(marketplace.connect(customer1).makeItem(nft.address, 1, toWei(price)))
                    .to.emit(marketplace, "Offered")
                    .withArgs(
                        1, 
                        nft.address, 
                        1, 
                        toWei(price), 
                        customer1.address
                    )

                // Owner of NFT should now be the marketplace
                expect(await nft.ownerOf(1)).to.equal(marketplace.address);

                // Item count should now equal 1
                expect (await marketplace.itemCount()).to.equal(1)

                // Get item from items mapping and then check fields to ensure they are correct
                const item = await marketplace.items(1)
                expect(item.itemId).to.equal(1)
                expect(item.nft).to.equal(nft.address)
                expect(item.tokenId).to.equal(1)
                expect(item.price).to.equal(toWei(price))
                expect(item.sold).to.equal(false)
            })
        })

        describe('Failure', async () => {

            it("Should fail if price is set to 0", async () => {
                await expect(marketplace.connect(customer1).makeItem(nft.address, 1, 0)).to.be.revertedWith("price must be greater than 0");
            })

        })
    })

    describe("Purchasing marketplace items", async () => {
        let price = 2
        let fee = (feePercent / 100) * price
        let totalPriceInWei

        describe('Success', async () => {
            beforeEach(async () => {
                // Customer1 mints an NFT
                await nft.connect(customer1).mint(URI)
                // Customer1 approves marketplace to spend NFT
                await nft.connect(customer1).setApprovalForAll(marketplace.address, true)
                // Customer1 makes their NFT a marketplace item
                await marketplace.connect(customer1).makeItem(nft.address, 1, toWei(price))
            })

            it("Should update marketplace as the owner of the minted NFT", async () => {
                expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            })

            it("Should update the item as sold, pay customer1, transfer NFT to customer2, charge fees and emit a Bought event", async () => {
                const sellerInitialEthBal = await customer1.getBalance()
                const feeAccountInitialEthBal = await deployer.getBalance() 

                // Fetch items total price (market fees + item price)
                totalPriceInWei = await marketplace.getTotalPrice(1);

                // Customer2 purchases item
                await expect(marketplace.connect(customer2).purchaseItem(1, { value: totalPriceInWei }))
                .to.emit(marketplace, "Bought")
                .withArgs(1, nft.address, 1, toWei(price), customer1.address, customer2.address)

                const sellerFinalEthBal = await customer1.getBalance() // Seller account balance should increase (now includes the earnings from the sale)
                const feeAccountFinalEthBal = await deployer.getBalance() // Fee account balance should increase (now includes the earnings from the sale)

                // Customer1 should receive payment for the price of the NFT sold
                expect(+fromWei(sellerFinalEthBal)).to.equal(+price + + fromWei(sellerInitialEthBal))

                // feeAccount should receive fee
                expect(+fromWei(feeAccountFinalEthBal)).to.equal(+fee + + fromWei(feeAccountInitialEthBal))

                // Customer2 (buyer) should now own the NFT
                expect(await nft.ownerOf(1)).to.equal(customer2.address);

                // NFT should be marked as sold
                expect((await marketplace.items(1)).sold).to.equal(true)
            })
        })
    })
})