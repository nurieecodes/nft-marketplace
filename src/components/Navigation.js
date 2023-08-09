import { NavLink } from "react-router-dom"
import { Nav, Navbar, Button, Container } from 'react-bootstrap'
import island from '../island.png'
import '../index.css';

const Navigation = ({ web3Handler, account }) => {
  return (
    <Navbar style={{ backgroundColor: '#000000'}} expand="lg" variant="dark">
        <Container>
            <Navbar.Brand href="#">
                <img src={island} width="40" height="40" className="d-inline-block align-center" alt="" />
                  &nbsp; Paradise NFT Marketplace
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav" >
                <Nav className="justify-content-center" style={{ flex: 1 }}>
                    <NavLink to="/" style={({ isActive }) => isActive ? { color: '#ff6666' } : { color: '#ffffff'}}>Home</NavLink>
                    <NavLink to="/create" style={({ isActive }) => isActive ? { color: '#ff6666' } : { color: '#ffffff'}}>Create</NavLink>
                    <NavLink to="/my-listed-item" style={({ isActive }) => isActive ? { color: '#ff6666' } : { color: '#ffffff'}}>My Listed Items</NavLink>
                    <NavLink to="/my-purchases" style={({ isActive }) => isActive ? { color: '#ff6666' } : { color: '#ffffff'}}>My Purchased Items</NavLink>
                </Nav>
                <Nav>
                    {account ? (
                        <a
                              href={`https://etherscan.io/address/${account}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="button nav-button btn-sm mx-4">
                              <Button style={{ color: '#000000', backgroundColor: '#ff6666', border: '#000000', borderRadius: 25, marginLeft: "125px" }} variant="primary">
                                  {account.slice(0, 5) + '...' + account.slice(38, 42)}
                              </Button>
                        </a>
                    ) : (
                        <Button style={{ backgroundColor: '#9900cc', border: '#000000', borderRadius: 25, marginLeft: "183px" }} 
                                onClick={web3Handler} 
                                variant="primary">
                                    Connect Wallet
                        </Button>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
  )
}

export default Navigation;