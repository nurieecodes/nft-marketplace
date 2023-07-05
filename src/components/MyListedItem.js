import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'

function renderSoldItems(items) {
    return (
      <>
        <h2>Sold NFTs</h2>
        <Row xs={1} md={2} lg={4} className="g-4 py-3">
          {items.map((item, idx) => (
            <Col key={idx} className="overflow-hidden">
              <Card>
                <Card.Img variant="top" src={item.image} />
                <Card.Footer>
                  For {ethers.utils.formatEther(item.totalPrice)} ETH - Recieved {ethers.utils.formatEther(item.price)} ETH
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
    const [listedItems, setListedItems] = useState([])
    const [soldItems, setSoldItems] = useState([])
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
        <main style={{ padding: "1rem 0" }}>
          <h2>Loading...</h2>
        </main>
      )
      return (
        <div className="flex justify-center">
          {listedItems.length > 0 ?
            <div className="px-5 py-3 container">
                <h2>Listed NFTs</h2>
              <Row xs={1} md={2} lg={4} className="g-4 py-3">
                {listedItems.map((item, idx) => (
                  <Col key={idx} className="overflow-hidden">
                    <Card>
                      <Card.Img variant="top" src={item.image} />
                      <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
                {soldItems.length > 0 && renderSoldItems(soldItems)}
            </div>
            : (
              <main style={{ padding: "1rem 0" }}>
                <h4>You currently have no listed assets.</h4>
              </main>
            )}
        </div>
      );
    }