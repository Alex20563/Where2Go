import React from "react";
import { Button, Container, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../../components/NavigationBar";

const AllGroups = () => {
    const navigate = useNavigate();

    const user = {
        username: "User123",
        email: "user@example.com",
        groups: [
            { id: 1, name: "Друзья"},
            { id: 2, name: "Коллеги"},
            { id: 3, name: "Семья"},
            { id: 4, name: "Товарищи по хобби"},
            { id: 5, name: "Спортивная команда"},
        ],
    };

    return (
        <div className="all-groups-container">
            <NavigationBar user={user} handleLogout={() => console.log("logout")} />

            <Container className="mt-4">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <h2>Все мои группы</h2>
                    <Button variant="outline-secondary" className="" onClick={() => navigate("/create-group")}>
                        Создать группу
                    </Button>
                </div>

                <ListGroup>
                    {user.groups.map(group => (
                        <ListGroup.Item key={group.id}>
                            <div className="d-flex justify-content-between align-items-center">
                                <span>{group.name}</span>
                                <Button variant="primary" onClick={() => navigate(`/groups/${group.id}`)}>
                                    Управление
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Container>
        </div>
    );
};

export default AllGroups;
