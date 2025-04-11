import React, { useState } from "react";
import { Container, Button, Alert } from "react-bootstrap";
import NavigationBar from "../../components/NavigationBar";

const CreatePoll = () => {
    const [question, setQuestion] = useState("");
    const [groupId, setGroupId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // TODO: заменить на реальные данные пользователя и групп
    const user = { username: "User123", email: "user@example.com" };
    const availableGroups = [
        { id: 1, name: "Друзья" },
        { id: 2, name: "Работа" },
    ];

    const handleSubmit = async () => {
        setError("");
        setSuccess("");

        if (!question.trim()) {
            setError("Введите вопрос опроса.");
            return;
        }

        if (!groupId) {
            setError("Выберите группу.");
            return;
        }

        // TODO: заменить на реальный запрос
        // const response = await axios.post('/api/polls/', { question, options, groupId });
        console.log("Создание опроса:", { question, groupId });
        setSuccess("Опрос успешно создан!");
        setQuestion("");
        setGroupId("");
    };

    return (
        <div className="create-poll-container" style={{ color: "#2a6ebb", marginBottom: "20px" }}>
            <NavigationBar user={user} handleLogout={() => console.log("logout")} />

            <Container className="mt-4">
                <h2>Создание опроса</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <div className="mb-3">
                    <label className="form-label">Вопрос</label>
                    <input
                        type="text"
                        className="form-control"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Введите текст вопроса"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Группа</label>
                    <select className="form-select" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                        <option value="">Выберите группу</option>
                        {availableGroups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>
                </div>
                <Button variant="primary" onClick={handleSubmit}>Создать опрос</Button>
            </Container>
        </div>
    );
};

export default CreatePoll;
