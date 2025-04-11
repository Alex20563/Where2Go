import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import "../../styles/Profile.css";
import NavigationBar from "../../components/NavigationBar";

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

    const handleLogout = () => {
        console.log("Выход из аккаунта...");
        setTimeout(() => navigate("/login"), 1500);
    };

        return (
            <div className="profile-container">
                <NavigationBar user={user} handleLogout={handleLogout} />

                <Container className="mt-4">
                    <h2>Мои группы</h2>
                    <Button variant="success" className="mb-3" onClick={() => navigate("/create-group")}>
                        ➕ Создать группу
                    </Button>
                    <ul className="list-group">
                        {user.groups.map(group => (
                            <li key={group.id} className="list-group-item">{group.name}</li>
                        ))}
                    </ul>

                    <h2 className="mt-4">Доступные опросы</h2>
                    <Button variant="success" className="mb-3" onClick={() => navigate("/create-poll")}>
                        ➕ Создать опрос
                    </Button>
                    <ul className="list-group">
                        {user.polls.map(poll => (
                            <li key={poll.id} className="list-group-item">{poll.question}</li>
                        ))}
                    </ul>
                </Container>
            </div>
    );
};

export default Profile;
