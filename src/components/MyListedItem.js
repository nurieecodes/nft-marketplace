import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button, Modal } from 'react-bootstrap'
import icon from '../ethereum-icon.png'

function renderSoldItems(items) {
    return (
      <>
        <h3 style={{ padding: '40px 0px 0px 0px', fontFamily: 'Droid serif, serif' }}>Sold NFTs</h3>
        <hr></hr>
        <Row xs={1} md={2} lg={4} className="g-4 py-3">
          {items.map((item, idx) => (
            <Col key={idx} className="overflow-hidden">
              <Card border="dark">
                <Card.Img variant="top" src={item.image} />
                <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                </Card.Body>
                <Card.Footer style={{ backgroundColor: "#df80ff", color: "#000000"}}>
                  Sold for {ethers.utils.formatEther(item.totalPrice)} ETH 
                  <img style={{ padding: '1px 1px 2px 1px'}} 
                       src={icon} width="23" 
                       height="23" alt="" />
                  <hr></hr> Received {ethers.utils.formatEther(item.price)} ETH
                  <img style={{ padding: '1px 1px 2px 1px'}} 
                       src={icon} width="23" 
                       height="23" alt="" />
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    )
  }

export default function MyListedItem({ marketplace, nft, account }) {

    const [loading, setLoading] = useState(true)  
    const [showModal, setShowModal] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [ownerAddress, setOwnerAddress] = useState('');
    const [listedItems, setListedItems] = useState([])
    const [soldItems, setSoldItems] = useState([])

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
      
        // Load all sold NFTS that the user listed
        const itemCount = await marketplace.itemCount()
        let listedItems = []
        let soldItems = []
        for (let indx = 1; indx <= itemCount; indx++) {
            const i = await marketplace.items(indx)
            if (i.seller.toLowerCase() === account) {
              // Get URI url from the NFT contract
              const uri = await nft.tokenURI(i.tokenId)
              // Use URI to fetch the NFT metadata stored on IPFS 
              const response = await fetch(uri)
              const metadata = await response.json()
              // Get total price of item (item price + market fee)
              const totalPrice = await marketplace.getTotalPrice(i.itemId)
              // Define listed item object
              let item = {
                totalPrice,
                price: i.price,
                itemId: i.itemId,
                name: metadata.name,
                description: metadata.description,
                image: metadata.image
              }
              listedItems.push(item)
              // Add listed NFT to sold items array if sold
              if (i.sold) soldItems.push(item)
            }
          }
          setLoading(false)
          setListedItems(listedItems)
          setSoldItems(soldItems)

    }
    useEffect(() => {
        loadListedItems()
    }, [])
    if (loading) return (
        <main style={{ padding: '50px 10px 15px 10px' }}>
          <h4>Loading...</h4>
        </main>
      )
      return (
        <div className="flex justify-center">
          {listedItems.length > 0 ?
            <div className="px-5 py-3 container">
                <h3 style={{ padding: '35px 0px 0px 0px', fontFamily: 'Droid serif, serif' }}>Listed NFTs</h3>
                <hr></hr>
              <Row xs={1} md={2} lg={4} className="g-4 py-3">
                {listedItems.map((item, idx) => (
                  <Col key={idx} className="overflow-hidden">
                    <Card border="dark">
                      <Card.Img variant="top" src={item.image} />
                      <Card.Body color="secondary">
                                    <Card.Title >{item.name}</Card.Title>
                                    <Card.Text>
                                      <Button variant="link" onClick={() => handleShowModal(item)}>
                                          View NFT Details
                                      </Button>
                                    </Card.Text>
                                </Card.Body>
                      <Card.Footer style={{ color: "#000000" }}>Listed Price: {ethers.utils.formatEther(item.totalPrice)} ETH
                        <img style={{ padding: '1px 1px 2px 1px'}} 
                             src={icon} width="23" 
                             height="23" alt="" />
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
                {soldItems.length > 0 && renderSoldItems(soldItems)}
            </div>
            : (
              <main style={{ padding: '50px 10px 15px 10px' }}>
                <h4 style={{ fontFamily: 'Droid serif, serif' }}>
                  You currently have no listed items.</h4>
              </main>
            )}
        </div>
      );
    }
