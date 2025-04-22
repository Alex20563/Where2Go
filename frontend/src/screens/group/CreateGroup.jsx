import React, {useEffect, useState} from "react";
import {Alert, Button, Card, Col, Container, Form, Row, Spinner} from "react-bootstrap";
import NavigationBar from "../../components/NavigationBar";
import API from "../../api";
import {useNavigate} from "react-router-dom";

const CreateGroup = () => {
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [user, setUser] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const userRes = await API.get("/auth/me");
                setUser(userRes.data);
            } catch (error) {
                console.error("Ошибка при загрузке пользователя:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        try {
            const response = await API.get(`/users/search/?q=${encodeURIComponent(searchTerm)}`);
            setSearchResults(response.data);
        } catch (err) {
            console.error("Ошибка поиска:", err);
            setError("Не удалось выполнить поиск.");
        }
    };

    const addUser = (user) => {
        if (!selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const removeUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
    };

    const handleCreateGroup = async () => {
        setError("");
        setSuccess("");

        if (!groupName.trim()) {
            setError("Введите название группы.");
            return;
        }

        if (selectedUsers.length <= 0){
            setError("Выберите хотя бы одного участника группы.");
            return;
        }
        try {
            const response = await API.post("/groups/create", {
                name: groupName,
                members: selectedUsers.map(u => u.id),
            });

            if (response.status === 201 || response.status === 200) {
                setSuccess("Группа успешно создана!");
                setGroupName("");
                setSelectedUsers([]);
                setSearchResults([]);
                setSearchTerm("");
            }
            setTimeout(() => navigate("/groups"), 1000);
        } catch (err) {
            console.error("Ошибка создания группы:", err);
            setError("Не удалось создать группу.");
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div className="create-group-container">
            <NavigationBar user={user} />

            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Создание группы</h2>
                    <Button variant="outline-secondary" onClick={handleCreateGroup}>
                        Создать группу
                    </Button>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form.Group className="mb-4">
                    <Form.Label>Название группы</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Введите название"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Добавить участников</Form.Label>
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Поиск по имени или email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button variant="primary" className="ms-2" onClick={handleSearch}>
                            Поиск
                        </Button>
                    </div>
                </Form.Group>

                <Row>
                    {searchResults.map((user) => (
                        <Col md={6} key={user.id}>
                            <Card className="mb-3">
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <Card.Title className="mb-0">{user.username}</Card.Title>
                                        <Card.Text className="text-muted">{user.email}</Card.Text>
                                    </div>
                                    <Button variant="success" onClick={() => addUser(user)}>
                                        ➕
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {selectedUsers.length > 0 && (
                    <>
                        <h5 className="mt-4">Добавленные участники:</h5>
                        <Row>
                            {selectedUsers.map((user) => (
                                <Col md={6} key={user.id}>
                                    <Card className="mb-3 bg-light">
                                        <Card.Body className="d-flex justify-content-between align-items-center">
                                            <Card.Title className="mb-0">{user.username}</Card.Title>
                                            <Button variant="danger" onClick={() => removeUser(user.id)}>
                                                ✖
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}
            </Container>
        </div>
    );
};

export default CreateGroup;
