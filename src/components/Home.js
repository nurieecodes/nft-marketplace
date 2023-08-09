import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers"
import { Row, Col, Card, Button, Modal, Carousel } from 'react-bootstrap'
import { toast } from 'react-toastify';
import icon from '../ethereum-icon.png'  
import upArrowIcon from '../arrow-up.png';
import './Home.css';

import image1 from '../images/image1.png';
import image2 from '../images/image2.png';
import image3 from '../images/image3.png';
import image8 from '../images/image8.png';
import image19 from '../images/image19.png';


const Home = ({ marketplace, nft }) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    // State variables to capture statistics
    const [totalListedNFTs, setTotalListedNFTs] = useState(0);
    const [totalSoldNFTs, setTotalSoldNFTs] = useState(0);

    // State variable for the scroll-to-top button
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Variable for rerouting to the My Purchased Items page after successfully purchasing an NFT
    const navigate = useNavigate();

    // Array for the carousel that appears when there are no listed items available for purchase
    const carouselImages = [image1, image2, image3, image8, image19]

    const loadMarketplaceItems = async () => {
        const itemCount = await marketplace.itemCount()
        let items = []
        let totalSold = 0; // To keep track of the total sold NFTs

        for (let i = 1; i <= itemCount; i++) {
            const item = await marketplace.items(i)
            if (!item.sold) {
                // Retrieve the URI url from the NFT contract
                const uri = await nft.tokenURI(item.tokenId)
                console.log('URI', uri)
                // Fetch the NFT metadata (stored on IPFS) via the URI
                const response = await fetch(uri)
                const metadata = await response.json()
                // Get total price of item (item price + market fee)
                const totalPrice = await marketplace.getTotalPrice(item.itemId)
                // Add item to items array
                items.push({
                    totalPrice, 
                    itemId: item.itemId,
                    seller: item.seller, 
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                })
            } else {
                totalSold++;
            }
        }
        setItems(items)
        // Update the statistics state variables
        setTotalListedNFTs(items.length); // Only count the listed NFTs, not sold ones
        setTotalSoldNFTs(totalSold);
        setLoading(false)
    }

    const buyMarketItem = async (item) => {
        try{
        await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
        loadMarketplaceItems()

        // Show success alert
        toast.success('Purchase successful!', {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
        });


        // Delay the redirection after showing the success alert
        setTimeout(() => {
            navigate('/my-purchases');
            
            // Scroll to the top of the page after navigating to the My Purchased Items page
            window.scrollTo(0, 0);
        }, 3200);
        } catch (error) 
            {
                // Show error alert
                toast.error('Purchase failed. Please try again later.', {
                    position: 'top-center',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                });

                // You can also log the error to the console for debugging purposes
                console.error('Purchase failed:', error.message);
            }
  };

    const [showModal, setShowModal] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [ownerAddress, setOwnerAddress] = useState('');

    const handleShowModal = async (item) => {
        setSelectedNFT(item);
        setShowModal(true);

        // Fetch the NFT owner's address
        const owner = await nft.ownerOf(item.itemId);
        setOwnerAddress(owner); 
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedNFT(null);
    };

    useEffect(() => {
        loadMarketplaceItems();

        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Set up an interval to periodically update the statistics (e.g., every 10 seconds)
        const interval = setInterval(loadMarketplaceItems, 10000);

        // Clear the interval when the component is unmounted
        return () => {
            clearInterval(interval);
            window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    if (loading) return (
        <main style={{ padding: '50px 10px 15px 10px', paddingTop: '115px' }}>
            <h3 style={{ fontFamily: 'Droid serif, serif' }}>
                Loading...
            </h3>
        </main>
    )

    return (
        <div className="flex justify-center" style={{ paddingTop: '80px' }}>
            {items.length > 0 ?
            <div className="px-5 container"> 
                <Row>
                    <h3 style={{ padding: '35px 10px 0px 10px', 
                                fontFamily: 'Georgia, arial, serif' }}>
                                Welcome to Paradise NFT Marketplace!
                    </h3>
                    <h4 style={{ fontFamily: 'Droid serif, serif' }}>
                        Please browse the items for sale below.
                    </h4>
                </Row>
                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                    {items.map((item, idx) => (
                        <Col key={idx} className="overflow-hidden">
                            <Card border="dark">
                                <Card.Img 
                                    variant="top" 
                                    src={item.image}
                                    className="custom-card-image"
                                />
                                <Card.Body color="secondary">
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text>
                                    <Button variant="link" onClick={() => handleShowModal(item)}>
                                        View NFT Details
                                    </Button>
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer>
                                    <div className='d-grid'>
                                        <Button style={{ backgroundColor: '#ff6666', color: '#000000', 
                                                         border: '#000000', borderRadius: 25, 
                                                         padding: '5px', width: '190px' }} 
                                                onClick={() => buyMarketItem(item)} 
                                                variant="primary" 
                                                className="mx-auto">
                                            Buy for {ethers.utils.formatEther(item.totalPrice)} ETH 
                                            <img style={{ padding: '1px 1px 2px 1px'}} 
                                                 src={icon} width="23" 
                                                 height="23" alt="" 
                                            />
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title style={{ color: "#9900cc"}}>NFT Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedNFT && (
                        <>
                            <h5 style={{ textAlign: 'center' }}>Name: {selectedNFT.name}</h5>
                            <br></br>
                            <p>Description: 
                                <br></br>
                                {selectedNFT.description}
                            </p>
                            <br></br>
                            <p>Price: {ethers.utils.formatEther(selectedNFT.totalPrice)} ETH
                            <img style={{ padding: '1px 1px 2px 1px'}} 
                                 src={icon} width="23" 
                                 height="23" alt="" 
                            />
                            </p>
                            <br></br>
                            <p>
                                Owner's Address:{' '}
                                <a href={`https://etherscan.io/address/${ownerAddress}`}
                                target="_blank"
                                rel="noopener noreferrer">
                                {ownerAddress}
                                </a>
                            </p>
                        </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button style={{ backgroundColor: '#ff6666', 
                                        color: "#000000", border: '#000000', 
                                        borderRadius: 25, padding: '5px', width: '75px' }} 
                                variant="primary" 
                                onClick={handleCloseModal}>
                        Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Row style={{ padding: '90px 10px 15px 10px'}}>
                        <h5 style={{ fontFamily: 'Droid serif, serif' }}>
                            Total # of NFTs available for sale: <span className="blinking-stat">{totalListedNFTs}</span>
                        </h5>
                        <h5 style={{ fontFamily: 'Droid serif, serif' }}>
                            Total # of NFTs sold on the marketplace: <span className="blinking-stat">{totalSoldNFTs}</span>
                        </h5>
                    </Row>
                    {showScrollButton && (
                        <button
                            className="scroll-button"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <img src={upArrowIcon} alt="Scroll to top" />
                        </button>
                    )}
            </div>
            : (
                <div className="px-5 container">
                    <h2 style={{ padding: '50px 10px 0px 10px', 
                                fontFamily: 'Georgia, arial, serif' }}>
                                Welcome to Paradise NFT Marketplace!
                    </h2>
                    <Carousel style={{ padding: '50px 10px 15px 10px' }}
                              autoplay={true} 
                              pauseOnVisibility={true} 
                              slideshowSpeed={5000}>
                              {carouselImages.map((image, idx) => (
                        <Carousel.Item key={idx}>
                            <img src={image} alt={`Carousel Image ${idx + 1}`} 
                            style={{ borderRadius: '25%', 
                                     border: '2px solid black', 
                                     width: "400px", height: "400px" }}/>
                        </Carousel.Item>
                        ))}
                    </Carousel>
                    <main style={{ padding: '50px 10px 15px 10px' }}>
                        <h4 style={{ fontFamily: 'Droid serif, serif' }}>
                            Thank you for visiting our marketplace.</h4>
                        <h4 style={{ fontFamily: 'Droid serif, serif' }}>
                            We currently have no available items to purchase.</h4>
                        <h4 style={{ fontFamily: 'Droid serif, serif' }}>
                            Please check back again soon.</h4>
                    </main>
                    <Row style={{ padding: '90px 10px 15px 10px'}}>
                        <h5 style={{ fontFamily: 'Droid serif, serif' }}>
                            Total # of NFTs available for sale: <span className="blinking-stat">{totalListedNFTs}</span>
                        </h5>
                        <h5 style={{ fontFamily: 'Droid serif, serif' }}>
                            Total # of NFTs sold on the marketplace: <span className="blinking-stat">{totalSoldNFTs}</span>
                        </h5>
                    </Row>
                </div>
            )}
        </div>
    );
}

export default Home;
