import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Modal } from "react-bootstrap";
import "../../styles/Profile.css";

const Profile = (props) => {
    const navigate = useNavigate();
    // TODO: заменить на реального пользователя
    const [user] = useState({
        username: "User123",
        email: "user@example.com",
        groups: [
            { id: 1, name: "Друзья" },
            { id: 2, name: "Коллеги" },
        ],
        polls: [
            { id: 101, question: "Где встретимся на выходных?" },
            { id: 102, question: "Лучший ресторан на день рождения?" },
        ],
    });

    const [showSettings, setShowSettings] = useState(false);

    const handleLogout = () => {
        console.log("Выход из аккаунта...");
        setTimeout(() => navigate("/login"), 1500);
    };

    return (
        // <div className="profile-container" style={{display: flex, height: 100, background: #f0f8ff}}>
        <div className="profile-container" >
            <Navbar bg="primary" variant="light" expand="lg">
                <Container style={{}}>
                    <Navbar.Brand href="#">Where2Go</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link disabled>{user.username}</Nav.Link>
                        <Nav.Link disabled>{user.email}</Nav.Link>
                    </Nav>
                    <Button variant="outline-light" onClick={() => setShowSettings(true)}>
                        Настройки
                    </Button>
                    <Button variant="outline-light" className="ms-2" onClick={handleLogout}>
                        Выйти
                    </Button>
                </Container>
            </Navbar>

            {/* Основная информация */}
            <Container className="mt-4">
                <h2>Мои группы</h2>
                <Button variant="success" className="mb-3">➕ Создать группу</Button>
                <ul className="list-group">
                    {user.groups.map(group => (
                        <li key={group.id} className="list-group-item">{group.name}</li>
                    ))}
                </ul>

                <h2 className="mt-4">Доступные опросы</h2>
                <ul className="list-group">
                    {user.polls.map(poll => (
                        <li key={poll.id} className="list-group-item">{poll.question}</li>
                    ))}
                </ul>
            </Container>

            {/* Модальное окно настроек */}
            <Modal show={showSettings} onHide={() => setShowSettings(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Настройки</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p> В этом разделе будут настройки безопасности.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSettings(false)}>
                        Закрыть
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Profile;
