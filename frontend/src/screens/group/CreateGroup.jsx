import React, { useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import NavigationBar from "../../components/NavigationBar";
import axios from "axios";

const CreateGroup = () => {
    const [groupName, setGroupName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        // TODO: заменить на обращение к серверу
        const mockUsers = [
            { id: 1, username: "alice", email: "alice@example.com" },
            { id: 2, username: "bob", email: "bob@example.com" },
            { id: 3, username: "charlie", email: "charlie@example.com" },
        ];

        const filtered = mockUsers.filter(
            (u) =>
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSearchResults(filtered);
        // try {
        //     const response = await axios.get(`http://localhost:8000/api/users/search/?q=${searchTerm}`);
        //     setSearchResults(response.data);
        // } catch (err) {
        //     console.error("Ошибка поиска:", err);
        //     setError("Не удалось выполнить поиск.");
        // }
    };

    const addUser = (user) => {
        if (!selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const removeUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    const handleCreateGroup = async () => {
        setError("");
        setSuccess("");

        if (!groupName) {
            setError("Введите название группы.");
            return;
        }

        // TODO: заменить на обращение к серверу
        // имитация успешного создания
        setTimeout(() => {
            console.log("Создана группа:", {
                name: groupName,
                users: selectedUsers,
            });
            setSuccess("Группа успешно создана!");
            setGroupName("");
            setSelectedUsers([]);
            setSearchResults([]);
            setSearchTerm("");
        }, 1000);
        // try {
        //     const response = await axios.post("http://localhost:8000/api/groups/create/", {
        //         name: groupName,
        //         users: selectedUsers.map(u => u.id)
        //     });
        //
        //     if (response.status === 201) {
        //         setSuccess("Группа успешно создана!");
        //         setGroupName("");
        //         setSelectedUsers([]);
        //         setSearchResults([]);
        //         setSearchTerm("");
        //     }
        // } catch (err) {
        //     console.error("Ошибка создания группы:", err);
        //     setError("Не удалось создать группу.");
        // }
    };

    // Пример текущего пользователя
    const user = { username: "User123", email: "user@example.com" };

    return (
        <div className="create-group-container" style={{color: "#2a6ebb", marginBottom: "20px"}}>
            <NavigationBar user={user} handleLogout={() => console.log("logout")} />

            <Container className="mt-4">
                <h2>Создание группы</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <div className="mb-3">
                    <label className="form-label">Название группы</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Введите название"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Добавить участников</label>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Поиск по имени или email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-outline-primary" onClick={handleSearch}>Поиск</button>
                    </div>
                </div>

                {searchResults.length > 0 && (
                    <ul className="list-group mb-3">
                        {searchResults.map(user => (
                            <li
                                key={user.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                {user.username} ({user.email})
                                <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => addUser(user)}
                                >
                                    ➕
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {selectedUsers.length > 0 && (
                    <>
                        <h5>Добавленные участники:</h5>
                        <ul className="list-group mb-3">
                            {selectedUsers.map(user => (
                                <li
                                    key={user.id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    {user.username}
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => removeUser(user.id)}
                                    >
                                        ✖
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                <Button variant="primary" onClick={handleCreateGroup}>Создать группу</Button>
            </Container>
        </div>
    );
};

export default CreateGroup;
