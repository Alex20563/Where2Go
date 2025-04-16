// NavigationBar.jsx
import React, {useState} from "react";
import {Navbar, Nav, Container, Button, Modal, Form} from "react-bootstrap";
import icon from "../assets/icon.png";

const NavigationBar = ({ user, handleLogout }) => {
    const [showSettings, setShowSettings] = React.useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handlePasswordChange = async () => {
        try {
            //TODO: смена пароля

            // await API.post("/auth/change-password/", {
            //     old_password: oldPassword,
            //     new_password: newPassword
            // });
            console.log("Пароль успешно изменён");
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            console.log("Ошибка при смене пароля");
            console.error(err);
        }
    };

    const handleDeactivateSessions = async () => {
        try {
            //TODO: деактивация всех сессий
            //await API.post("");
            console.log("Все сессии завершены.");
        } catch (err) {
            console.log("Ошибка при деактивации сессий");
            console.error(err);
        }
    };

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
                <Modal.Header closeButton>
                    <Modal.Title>Настройки безопасности</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="oldPassword">
                            <Form.Label>Текущий пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Введите текущий пароль"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="newPassword">
                            <Form.Label>Новый пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Введите новый пароль"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" onClick={handlePasswordChange} className="justify-content-center">
                            Сменить пароль
                        </Button>
                    </Form>

                    <hr />

                    {/* Деактивация всех сессий */}
                    <p className="mt-4">Хотите выйти из всех устройств?</p>
                    <Button variant="danger" onClick={handleDeactivateSessions}>
                        Завершить все сеансы
                    </Button>
                </Modal.Body>
            </Modal>

        </>
    );
};

export default NavigationBar;
