import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Row, Col, Card, Button, Modal, Spinner } from 'react-bootstrap';
import icon from '../ethereum-icon.png';
import upArrowIcon from '../arrow-up.png';
import './MyListedItems.css';

export default function MyListedItem({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [ownerAddress, setOwnerAddress] = useState('');
  const [unsoldItems, setUnsoldItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);

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

  const loadListedItems = async () => {
    // Load all unsold and sold NFTs that the user listed
    const itemCount = await marketplace.itemCount();
    let unsoldItems = [];
    let soldItems = [];
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await marketplace.items(indx);
      if (i.seller.toLowerCase() === account) {
        // Get URI url from the NFT contract
        const uri = await nft.tokenURI(i.tokenId);
        // Use URI to fetch the NFT metadata stored on IPFS
        const response = await fetch(uri);
        const metadata = await response.json();
        // Get total price of item (item price + market fee)
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
        // Define listed item object
        let item = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
        // Add listed NFT to sold items array if sold, else add to unsold items array
        if (i.sold) soldItems.push(item);
        else unsoldItems.push(item);
      }
    }
    setLoading(false);
    setUnsoldItems(unsoldItems);
    setSoldItems(soldItems);
  };

  useEffect(() => {
    loadListedItems();

    const handleScroll = () => {
      if (window.scrollY > 300) {
          setShowScrollButton(true);
      } else {
          setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading)
    return (
      <main style={{ padding: '50px 10px 15px 10px', paddingTop: '110px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '10vh' }}>
            <Spinner animation="border" style={{ display: 'flex'}} variant="danger"/>
          </div>       
      </main>
    );

  return (
    <div className="flex justify-center" style={{ paddingTop: '60px' }}>
      <div className="px-5 py-3 container">
        {unsoldItems.length > 0 && (
          <>
            <h3 style={{ padding: '35px 0px 0px 0px', fontFamily: 'Droid serif, serif' }}>Listed NFTs</h3>
            <hr />
            <Row xs={1} md={2} lg={4} className="g-4 py-3">
              {unsoldItems.map((item, idx) => (
                <Col key={idx} className="overflow-hidden">
                  <Card border="dark">
                    <Card.Img variant="top" src={item.image} className="custom-card-image" />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>
                        <Button variant="link" onClick={() => handleShowModal(item)}>
                          View NFT Details
                        </Button>
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer style={{ color: '#000000' }}>
                      Listed Price: {ethers.utils.formatEther(item.totalPrice)} ETH
                      <img
                        style={{ padding: '1px 1px 2px 1px' }}
                        src={icon}
                        width="23"
                        height="23"
                        alt=""
                      />
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title style={{ color: '#9900cc' }}>NFT Details</Modal.Title>
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
                        <p>
                          Price: {ethers.utils.formatEther(selectedNFT.totalPrice)} ETH
                          <img style={{ padding: '1px 1px 2px 1px' }} 
                               src={icon} width="23" 
                               height="23" alt="" />
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
                    <Button
                      style={{
                        backgroundColor: '#ff6666',
                        color: '#000000', border: '#000000',
                        borderRadius: 25, padding: '5px',
                        width: '75px',
                      }}
                      variant="primary"
                      onClick={handleCloseModal}
                    >
                      Close
                    </Button>
                </Modal.Footer>
              </Modal>
          </>
        )}

        {unsoldItems.length === 0 && (
          <main style={{ padding: '20px 10px 15px 10px' }}>
            <h3 style={{ padding: '35px 0px 0px 0px', fontFamily: 'Droid serif, serif' }}>Listed NFTs</h3>
            <hr />
            <h4 style={{ fontFamily: 'Droid serif, serif' }}>You currently have no listed items.</h4>
          </main>
        )}

        {soldItems.length > 0 && (
          <>
            <h3 style={{ padding: '40px 0px 0px 0px', fontFamily: 'Droid serif, serif' }}>Sold NFTs</h3>
            <hr />
            <Row xs={1} md={2} lg={4} className="g-4 py-3">
              {soldItems.map((item, idx) => (
                <Col key={idx} className="overflow-hidden">
                  <Card border="dark">
                    <Card.Img variant="top" src={item.image} className="custom-card-image" />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                    </Card.Body>
                    <Card.Footer style={{ backgroundColor: '#df80ff', color: '#000000' }}>
                      Sold for {ethers.utils.formatEther(item.totalPrice)} ETH
                      <img
                        style={{ padding: '1px 1px 2px 1px' }}
                        src={icon}
                        width="23"
                        height="23"
                        alt=""
                      />
                      <hr />
                      Received {ethers.utils.formatEther(item.price)} ETH
                      <img
                        style={{ padding: '1px 1px 2px 1px' }}
                        src={icon}
                        width="23"
                        height="23"
                        alt=""
                      />
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}

        {soldItems.length === 0 && (
          <main style={{ padding: '50px 10px 15px 10px' }}>
            <h3 style={{ padding: '40px 0px 0px 0px', fontFamily: 'Droid serif, serif' }}>Sold NFTs</h3>
            <hr />
            <h4 style={{ fontFamily: 'Droid serif, serif' }}>You currently have no sold items.</h4>
          </main>
        )}
          {showScrollButton && (
                <button
                    className="scroll-button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <img src={upArrowIcon} alt="Scroll to top" />
                </button>
            )}
      </div>
    </div>
  );
}
