import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { Buffer } from 'buffer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    const [validationAttempted, setValidationAttempted] = useState(false);

    const navigate = useNavigate();

    const resetForm = () => {
            setImage('');
            setPrice(null);
            setName('');
            setDescription('');
      };
      

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
        setValidationAttempted(true);
        if (!image || !price || !name || !description) {
            alert("Please fill in all of the required fields.");
            return;
        }
        try {
            const result = await client.add(JSON.stringify({ image, price, name, description }))
            await mintThenList(result);

            // Show success toast on successful listing
            toast.success('Congratulations! Your NFT has been listed successfully!', {
                position: 'top-center',
                autoClose: 3200,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });

        // Delay the redirection after showing the success alert
        setTimeout(() => {
            navigate('/');

        // Scroll to the top of the page after navigating to the Home page
        window.scrollTo(0, 0);
        }, 1500);

        } catch(error) {
            console.log("IPFS URI upload error: ", error)

            // Show failure toast on error
            toast.error('There was an error listing your NFT. Please try again.', {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
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

        try {

            // Add NFT to marketplace
            const listingPrice = ethers.utils.parseEther(price.toString())
            await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()

            // Reset the form fields
            resetForm();

            // Redirect to the home page after a successful listing
            navigate('/');

        } catch (error) {
            console.log("Failed to list NFT:", error);
        }
        
    }
    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '525px' }}>
                    <div className="content mx-auto">
                        <Row>
                            <h3 style={{ color: '#9900cc', padding: '0px 10px 15px 10px', 
                                         fontFamily: 'Georgia, arial, serif' }}>
                                         Upload your NFT to the Marketplace
                            </h3>
                            <hr></hr>
                        </Row>
                        <Row className="g-4">
                            <Form.Control 
                            onChange={(e) => setName(e.target.value)} 
                            size="lg" 
                            type="text" 
                            placeholder="Name" 
                            style={{ border: validationAttempted && name === '' 
                                                ? '1px solid red' : '1px solid gray' }}
                            />
                            <Form.Control 
                            onChange={(e) => setDescription(e.target.value)} 
                            size="lg" 
                            as="textarea" 
                            placeholder="Description" 
                            style={{ border: validationAttempted && description === '' 
                                                ? '1px solid red' : '1px solid gray' }}
                            />
                            <Form.Control 
                            onChange={(e) => setPrice(e.target.value)} 
                            size="lg" 
                            type="number" 
                            placeholder="Price (in ETH)" 
                            style={{ border: (validationAttempted && price === null) || 
                                             (validationAttempted && price === '') 
                                             ? '1px solid red' : '1px solid gray' }}
                            />
                            <Form.Control
                            type="file"
                            name="file"
                            onChange={uploadToIPFS}
                            style={{ border: validationAttempted && image === '' 
                                                ? '1px solid red' : '1px solid gray' }}
                            />
                            <div className="d-grid px-0">
                                <Button style={{ backgroundColor: '#9900cc', 
                                                 color: "#ffffff", 
                                                 border: '#000000', 
                                                 borderRadius: 25, 
                                                 padding: '5px', 
                                                 width: '250px'}} 
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
          <ToastContainer />
        </div>
    );
}

export default Create;
