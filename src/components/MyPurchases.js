import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button, Modal } from 'react-bootstrap'
import icon from '../ethereum-icon.png'

export default function MyPurchases({ marketplace, nft, account }) {

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

  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])
  const loadPurchasedItems = async () => {
    // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
    const filter =  marketplace.filters.Bought(null,null,null,null,null,account)
    const results = await marketplace.queryFilter(filter)
    // Fetch metadata of each NFT and add that to listedItem object.
    const purchases = await Promise.all(results.map(async i => {
      // Fetch arguments from each result
      i = i.args
      // Get URI url from NFT contract
      const uri = await nft.tokenURI(i.tokenId)
      // Use URI to fetch the NFT metadata stored on IPFS 
      const response = await fetch(uri)
      const metadata = await response.json()
      // Get total price of item (item price + market fee)
      const totalPrice = await marketplace.getTotalPrice(i.itemId)
      // Define listed item object
      let purchasedItem = {
        totalPrice,
        price: i.price,
        itemId: i.itemId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image
      }
      return purchasedItem
    }))
    setLoading(false)
    setPurchases(purchases)
  }
  useEffect(() => {
    loadPurchasedItems()
  }, [])
  if (loading) return (
    <main style={{ padding: '50px 10px 15px 10px' }}>
      <h4>Loading...</h4>
    </main>
  )
  return (
    <div className="flex justify-center">
      {purchases.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card border="dark">
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text>
                                      <Button variant="link" onClick={() => handleShowModal(item)}>
                                          View NFT Details
                                      </Button>
                                    </Card.Text>
                                </Card.Body>
                  <Card.Footer style={{ backgroundColor: "#df80ff", color: "#000000"}}>Bought for {ethers.utils.formatEther(item.totalPrice)} ETH 
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
        </div>
        : (
          <main style={{ padding: '50px 10px 15px 10px' }}>
            <h4 style={{ fontFamily: 'Droid serif, serif' }}>
              You currently have no purchased items.
            </h4>
          </main>
        )}
    </div>
  );
}