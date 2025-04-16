import React, { useEffect, useState } from "react";
import { Button, Container, ListGroup, Spinner } from "react-bootstrap";
import NavigationBar from "../../components/NavigationBar";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api";

const ManageGroup = () => {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [user, setUser] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [polls, setPolls] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await API.get("/auth/me");
                const groupsData = await API.get("/groups/");
                const groups = Array.isArray(groupsData.data) ? groupsData.data : [];

                setUser(userData.data);

                const foundGroup = groups.find(g => g.id.toString() === groupId);
                if (!foundGroup) {
                    console.warn("Группа не найдена");
                    navigate("/groups");
                    return;
                }

                setGroup(foundGroup);

                //const pollsData = await API.get(`/groups/${foundGroup.id.toString()}/polls/`);
                const pollsData =
                        [{ id: 1, question: "Где встретимся?", authorId: 1, hasVoted: false },
                    { id: 2, question: "Какой фильм смотрим?", authorId: 2, hasVoted: true }];
                setPolls(Array.isArray(pollsData.data) ? pollsData.data : []);

                const membersData = await Promise.all(
                    foundGroup.members.map(memberId =>
                        API.get(`/users/${memberId}/`).then(res => res.data)
                    )
                );
                setMembers(membersData);

            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
                navigate("/profile");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [groupId, navigate]);

    const handleAddPoll = () => {
        navigate("/create-poll", {
            state: {
                groupId: group.id,
                groupName: group.name,
            },
        });
    };

    const handleRemoveUser = (userId) => {
        // TODO: удаление пользвателя из группы
        console.log(`Удалить пользователя с id: ${userId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1000);
    };

    if (loading || !group) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div className="manage-group-container">
            <NavigationBar user={user} handleLogout={handleLogout} />
            <Container className="mt-4">
                <h2>Управление группой: {group.name}</h2>

                <h4>Участники</h4>
                <ListGroup>
                    {members.map(m => (
                        <ListGroup.Item key={m.id} className="d-flex justify-content-between align-items-center">
                            <span>{m.username} ({m.email})</span>
                            <Button variant="danger" onClick={() => handleRemoveUser(m.id)}>
                                Удалить
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <h4 className="mt-4">Опросы в группе</h4>
                <ListGroup>
                    {/*TODO: получение опросов*/}
                    {polls?.map(poll => (
                        <ListGroup.Item key={poll.id}>
                            {poll.question}
                        </ListGroup.Item>
                    )) ?? <ListGroup.Item>Нет опросов</ListGroup.Item>}
                </ListGroup>

                <Button variant="success" className="mt-3" onClick={handleAddPoll}>
                    Создать новый опрос
                </Button>
            </Container>
        </div>
    );
};

export default ManageGroup;
