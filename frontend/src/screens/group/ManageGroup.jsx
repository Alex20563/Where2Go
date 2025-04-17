import React, { useEffect, useState } from "react";
import { Alert, Button, Container, ListGroup, Spinner } from "react-bootstrap";
import NavigationBar from "../../components/NavigationBar";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api";
import DeleteGroupModal from "./components/DeleteGroupModal";

const ManageGroup = () => {
    const navigate = useNavigate();
    const { groupId } = useParams();

    const [group, setGroup] = useState(null);
    const [user, setUser] = useState(null);
    const [members, setMembers] = useState([]);
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await API.get("/auth/me");
                const groupsData = await API.get("/groups/");
                const pollsData = await API.get(`/groups/${groupId}/polls/`);

                const groups = Array.isArray(groupsData.data) ? groupsData.data : [];
                const foundGroup = groups.find(g => g.id.toString() === groupId);

                if (!foundGroup) return navigate("/groups");

                const membersData = await Promise.all(
                    foundGroup.members.map(id => API.get(`/users/${id}/`).then(r => r.data))
                );

                setUser(userData.data);
                setPolls(pollsData.data);
                setGroup(foundGroup);
                setMembers(membersData);
            } catch (err) {
                console.error("Ошибка при загрузке данных:", err);
                navigate("/profile");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [groupId, navigate]);

    const handleDeleteGroup = () => setShowDeleteModal(true);

    const handleDeleteConfirm = async () => {
        try {
            await API.delete(`/groups/${groupId}/`);
            setSuccess("Группа успешно удалена.");
            setShowDeleteModal(false);
            setTimeout(() => navigate("/groups"), 1000);
        } catch (err) {
            setError("Ошибка при удалении группы.");
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
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
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Управление группой: {group.name}</h2>
                    <Button variant="danger" size="sm" onClick={handleDeleteGroup}>
                        Удалить группу
                    </Button>
                </div>

                <h4>Участники</h4>
                <ListGroup>
                    {members.map(m => (
                        <ListGroup.Item key={m.id} className="d-flex justify-content-between align-items-center">
                            <span>{m.username} ({m.email})</span>
                            {/*TODO: удалить участника*/}
                            <Button variant="danger" onClick={() => console.log("TODO: удалить участника")}>
                                Удалить
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <h4 className="mt-4">Опросы в группе</h4>
                <ListGroup>
                    {polls.length > 0 ? polls.map(poll => (
                        <ListGroup.Item key={poll.id}>
                            {poll.question}
                        </ListGroup.Item>
                    )) : <ListGroup.Item>Нет опросов</ListGroup.Item>}
                </ListGroup>

                <div className="d-flex justify-content-between mt-3">
                    <Button variant="success" onClick={() => navigate("/create-poll", {
                        state: { groupId: group.id, groupName: group.name }
                    })}>
                        Создать новый опрос
                    </Button>
                    <Button variant="primary" onClick={() => navigate("/polls")}>
                        Все опросы
                    </Button>
                </div>
            </Container>

            <DeleteGroupModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                groupName={group.name}
            />
        </div>
    );
};

export default ManageGroup;
