import React, { useEffect, useState } from "react";
import { Container, Button, Alert } from "react-bootstrap";
import NavigationBar from "../../components/NavigationBar";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api";

const CreatePoll = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { groupId: initialGroupId, groupName } = location.state || {};

    const [question, setQuestion] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [groupId, setGroupId] = useState(initialGroupId || "");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState([{ text: "" }, { text: "" }]);
    const [groups, setGroups] = useState([]);
    const adminGroups = groups.filter(group => group.admin === user.id);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userRes = await API.get("/auth/me");
                const groupsRes = await API.get("/groups/");

                setUser(userRes.data);
                setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
            } catch (error) {
                console.error("Ошибка при загрузке пользователя:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index].text = value;
        setOptions(newOptions);
    };

    const addOptionField = () => {
        setOptions([...options, { text: "" }]);
    };

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

        const filledOptions = options.filter(opt => opt.text.trim() !== "");

        if (filledOptions.length < 2) {
            setError("Добавьте минимум два варианта ответа.");
            return;
        }

        try {
            await API.post(`/groups/${groupId}/polls/create/`, {
                question: question.trim(),
                options: filledOptions,
            });

            setSuccess("Опрос успешно создан!");
            setQuestion("");
            setOptions([{ text: "" }, { text: "" }]);
            setGroupId(initialGroupId || "");

        } catch (err) {
            console.error("Ошибка при создании опроса:", err);
            setError("Ошибка при создании опроса. Проверьте данные или права доступа.");
        }
    };

    if (loading) return null;

    return (
        <div className="create-poll-container" style={{ color: "#2a6ebb", marginBottom: "20px" }}>
            <NavigationBar user={user} handleLogout={() => console.log("logout")} />

            <Container className="mt-4">
                <h2>Создание опроса {groupName && `для группы: ${groupName}`}</h2>

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

                {!initialGroupId && (
                    <div className="mb-3">
                        <label className="form-label">Группа</label>
                        <select
                            className="form-select"
                            value={groupId}
                            onChange={(e) => setGroupId(e.target.value)}
                        >
                            <option value="">Выберите группу</option>
                            {adminGroups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Варианты ответа</label>
                    {options.map((opt, index) => (
                        <input
                            key={index}
                            type="text"
                            className="form-control mb-2"
                            placeholder={`Вариант ${index + 1}`}
                            value={opt.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                        />
                    ))}
                    <Button variant="secondary" size="sm" onClick={addOptionField}>
                        Добавить вариант
                    </Button>
                </div>
                <Button variant="primary" onClick={handleSubmit}>
                    Создать опрос
                </Button>
            </Container>
        </div>
    );
};

export default CreatePoll;
