import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { Buffer } from 'buffer';

const { create } = require('ipfs-http-client')
const key = process.env.REACT_APP_INFURA_PROJECT_ID;
const secret = process.env.REACT_APP_INFURA_SECRET;

const projectId = key;
const projectSecret = secret;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

const Create = ({ marketplace, nft }) => {
    const [image, setImage] = useState('')
    const [price, setPrice] = useState(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const uploadToIPFS = async (event) => {
        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file)
                console.log(result)
                setImage(`https://pnm-nftmarketplace.infura-ipfs.io/ipfs/${result.path}`)
            } catch (error) {
                console.log("IPFS image upload error: ", error)
            }
        }
    }

    const createNFT = async () => {
        if (!image || !price || !name || !description) return
        try {
            const result = await client.add(JSON.stringify({ image, price, name, description }))
            mintThenList(result)

        } catch(error) {
            console.log("IPFS URI upload error: ", error)
            alert("There was an error uploading your NFT!");
        }
    }

    const mintThenList = async (result) => {
        const uri = `https://pnm-nftmarketplace.infura-ipfs.io/ipfs/${result.path}`
        console.log('metadata uri', uri)
        // Mint NFT
        await (await nft.mint(uri)).wait()
        // Get tokenId of new NFT
        const id = await nft.tokenCount()
        // Approve marketplace to spend NFT
        await (await nft.setApprovalForAll(marketplace.address, true)).wait()
        // Add NFT to marketplace
        const listingPrice = ethers.utils.parseEther(price.toString())
        await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()

        alert("Successfully listed your NFT!");
    }
    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '525px' }}>
                    <div className="content mx-auto">
                        <Row>
                            <h3 style={{ color: '#9900cc', padding: '0px 10px 15px 10px' }} >Upload your NFT to the Marketplace</h3>
                            <hr></hr>
                        </Row>
                        <Row className="g-4">
                            <Form.Control 
                            onChange={(e) => setName(e.target.value)} 
                            size="lg" 
                            required type="text" 
                            placeholder="Name" 
                            />
                            <Form.Control onChange={(e) => setDescription(e.target.value)} 
                            size="lg" 
                            required as="textarea" 
                            placeholder="Description" 
                            />
                            <Form.Control onChange={(e) => setPrice(e.target.value)} 
                            size="lg" 
                            required type="number" 
                            placeholder="Price (in ETH)" 
                            />
                            <Form.Control
                            type="file"
                            required
                            name="file"
                            onChange={uploadToIPFS}
                            />
                            <div className="d-grid px-0">
                                <Button style={{ backgroundColor: '#9900cc', color: "#ffffff", border: '#000000', 
                                                 borderRadius: 25, padding: '5px', width: '250px' }} 
                                        onClick={createNFT} 
                                        variant="primary" 
                                        size="lg"
                                        className="mx-auto">
                                    List NFT
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Create;