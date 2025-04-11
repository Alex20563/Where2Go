// NavigationBar.jsx
import React from "react";
import { Navbar, Nav, Container, Button, Modal } from "react-bootstrap";
import icon from "../assets/icon.png";

const NavigationBar = ({ user, handleLogout }) => {
    const [showSettings, setShowSettings] = React.useState(false);

    return (
        <>
            <Navbar style={{ backgroundColor: "#79afe8" }} expand="lg">
                <Container>
                    <Navbar.Brand href="\profile">
                        <img
                            src={icon}
                            alt="Logo"
                            width="20"
                            height="25"
                            className="d-inline-block align-text-top"
                        />
                        {' '}Where2Go
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link disabled>{user.username}</Nav.Link>
                        <Nav.Link disabled>{user.email}</Nav.Link>
                    </Nav>
                    <Button variant="outline-dark" onClick={() => setShowSettings(true)}>
                        Настройки
                    </Button>
                    <Button variant="outline-dark" className="ms-2" onClick={handleLogout}>
                        Выйти
                    </Button>
                </Container>
            </Navbar>

            <Modal show={showSettings} onHide={() => setShowSettings(false)}>
                <Modal.Header>
                    <Modal.Title>Настройки</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>В этом разделе будут настройки безопасности.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSettings(false)}>
                        Закрыть
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default NavigationBar;
