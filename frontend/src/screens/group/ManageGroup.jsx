import React, { useState } from "react";
import { Button, Container, ListGroup } from "react-bootstrap";
import NavigationBar from "../../components/NavigationBar";
import {useNavigate, useParams} from "react-router-dom";

const ManageGroup = () => {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [group] = useState({
        id: groupId,
        name: "Друзья",
        members: [
            { id: 1, username: "User123", email: "user@example.com" },
            { id: 2, username: "User456", email: "user456@example.com" },
        ],
        polls: [
            { id: 101, question: "Где встретимся?" },
            { id: 102, question: "Что будем есть?" },
        ],
    });

    const handleAddPoll = () => {
        // Передаем props напрямую в компонент CreatePoll
        navigate("/create-poll", {
            state: {
                groupId: group.id,
                groupName: group.name,
            },
        });

    };

    const handleRemoveUser = (userId) => {
        // Удаление пользователя из группы
        console.log(`Удалить пользователя с id: ${userId}`);
    };

    return (
        <div className="manage-group-container">
            <NavigationBar user={{ username: "User123" }} handleLogout={() => console.log("logout")} />

            <Container className="mt-4">
                <h2>Управление группой: {group.name}</h2>

                <h4>Участники</h4>
                <ListGroup>
                    {group.members.map(user => (
                        <ListGroup.Item key={user.id} className="d-flex justify-content-between align-items-center">
                            <span>{user.username} ({user.email})</span>
                            <Button variant="danger" onClick={() => handleRemoveUser(user.id)}>
                                Удалить
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <h4 className="mt-4">Опросы в группе</h4>
                <ListGroup>
                    {group.polls.map(poll => (
                        <ListGroup.Item key={poll.id}>
                            {poll.question}
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <Button variant="success" className="mt-3" onClick={handleAddPoll}>
                    Создать новый опрос
                </Button>
            </Container>
        </div>
    );
};

export default ManageGroup;
