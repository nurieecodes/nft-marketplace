import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'
import icon from '../ethereum-icon.png'

export default function MyPurchases({ marketplace, nft, account }) {
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
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {purchases.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Footer>Bought for {ethers.utils.formatEther(item.totalPrice)} ETH 
                  <img style={{ padding: '1px 1px 2px 1px'}}  src={icon} width="23" height="23" alt="" /></Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h4>No purchased NFTs</h4>
          </main>
        )}
    </div>
  );
}