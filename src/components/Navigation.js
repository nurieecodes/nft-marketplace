import { Navbar } from 'react-bootstrap'
import { Nav } from 'react-bootstrap'
import { Button } from 'react-bootstrap'
import { Container } from 'react-bootstrap'
import island from '../island.png'

const Navigation = ({ web3Handler, account }) => {
  return (
    <Navbar expand="lg" bg="dark" variant="dark">
        <Container>
            <Navbar.Brand href="http://www.dappuniversity.com/bootcamp">
                <img src={island} width="40" height="40" className="d-inline-block align-center" alt="" />
                  &nbsp; Paradise NFT Marketplace
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav" >
                <Nav className="justify-content-center" style={{ flex: 1}}>
                    <Nav.Link >Home</Nav.Link>
                    <Nav.Link >Create</Nav.Link>
                    <Nav.Link >Listed Items</Nav.Link>
                    <Nav.Link >Purchased NFTs</Nav.Link>
                </Nav>
                <Nav>
                    {account ? (
                        <Nav.Link
                              href={`https://etherscan.io/address/${account}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="button nav-button btn-sm mx-4">
                              <Button variant="outline-light">
                                  {account.slice(0, 5) + '...' + account.slice(38, 42)}
                              </Button>
                        </Nav.Link>
                    ) : (
                        <Button onClick={web3Handler} variant="primary">Connect Wallet</Button>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
  )
}

export default Navigation;