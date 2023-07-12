import { useState } from 'react'
import { useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'

const Home = ({ marketplace, nft }) => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const loadMarketplaceItems = async () => {
        const itemCount = await marketplace.itemCount()
        let items = []
        for (let i = 1; i <= itemCount; i++) {
            const item = await marketplace.items(i)
            if (!item.sold) {
                // Retrieve the URI url from the NFT contract
                const uri = await nft.tokenURI(item.tokenId)
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
            }
        }
        setItems(items)
        setLoading(false)
    }

    const buyMarketItem = async (item) => {
        await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
        loadMarketplaceItems()
    }

    useEffect(() => {
        loadMarketplaceItems()
    }, [])
    if (loading) return (
        <main style={{ padding: "1rem 0"}}>
            <h2>Loading...</h2>
        </main>
    )

    return (
        <div className="flex justify-center">
            {items.length > 0 ?
            <div className="px-5 container">
                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                    {items.map((item, idx) => (
                        <Col key={idx} className="overflow-hidden">
                            <Card>
                                <Card.Img variant="top" src={item.image} />
                                <Card.Body color="secondary">
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text>
                                        {item.description}
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer>
                                    <div className='d-grid'>
                                        <Button style={{ backgroundColor: '#9900cc', border: '#000000', borderRadius: 25 }} 
                                                onClick={() => buyMarketItem(item)} 
                                                variant="primary" 
                                                size="lg">
                                            Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
                
            </div>
            : (
                <main style={{ padding: "1rem 0"}}>
                    <h4>Thank you for visiting Paradise NFT Marketplace!</h4>
                    <h4>Sorry, this marketplace currently has no available assets to purchase.</h4>
                    <h4>Please check back again soon.</h4>
                </main>
            )}
        </div>
    );
}

export default Home;