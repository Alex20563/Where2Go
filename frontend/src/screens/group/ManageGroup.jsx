import React, {useEffect, useState} from "react";
import { Pencil } from "react-bootstrap-icons";
import {Alert, Button, Container, ListGroup, Spinner} from "react-bootstrap";
import NavigationBar from "../../components/NavigationBar";
import {useNavigate, useParams} from "react-router-dom";
import API from "../../api";
import ConfirmModal from "./components/ConfirmModal";
import RenameGroupModal from "./components/RenameGroupModal";

const ManageGroup = () => {
    const navigate = useNavigate();
    const {groupId} = useParams();

    const [group, setGroup] = useState(null);
    const [user, setUser] = useState(null);
    const [members, setMembers] = useState([]);
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
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
    }, [groupId]);

    const handleUserDeleteClick = (user) => {
        setSelectedUser(user);
        console.log("Удаление пользователя: ", user);
        setShowDeleteUserModal(true);
    };

    const handleConfirmDeleteUser = async () => {
        try {
            //TODO: удаление пользователя из группы

            // await API.delete(`/groups/${groupId}/members/${selectedUser.id}/`);
            // setMembers(prev => prev.filter(m => m.id !== selectedUser.id));
            // setShowDeleteUserModal(false);
            console.log("Удаление пользователя: ", selectedUser.username);
        } catch (err) {
            console.error("Ошибка при удалении пользователя:", err);
        }
    };

    const handleRenameGroup = async (newName, currentGroup) => {
        try {
            await API.post(`/manage-group/${groupId}/`, {
                name: newName
            });
            currentGroup.name = newName;
            setGroup(currentGroup);
            setShowRenameModal(false);
            setSuccess("Название группы обновлено.");
        } catch (err) {
            console.error("Ошибка при переименовании группы:", err);
            setError("Не удалось переименовать группу.");
        }
    };


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
            <NavigationBar user={user}/>
            <Container className="mt-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                        <h2 className="me-2">Управление группой: {group.name}</h2>
                        <Button variant="outline-secondary" size="sm" onClick={() => setShowRenameModal(true)}>
                            <Pencil size={16} />
                        </Button>
                    </div>
                    <Button variant="danger" size="sm" onClick={handleDeleteGroup}>
                        Удалить группу
                    </Button>
                </div>

                <h4>Участники</h4>
                <ListGroup>
                    {members.map(m => (
                        <ListGroup.Item key={m.id} className="d-flex justify-content-between align-items-center">
                            <span>{m.username} ({m.email})</span>
                            {m.id !== user.id &&
                                <Button variant="danger" onClick={() => handleUserDeleteClick(m)}>
                                    Удалить
                                </Button>
                            }
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
                        state: {groupId: group.id, groupName: group.name}
                    })}>
                        Создать новый опрос
                    </Button>
                    <Button variant="primary" onClick={() => navigate("/polls")}>
                        Все опросы
                    </Button>
                </div>
            </Container>

            <ConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Удаление группы"
                body={`Вы уверены, что хотите удалить группу "${group.name}"? Это действие необратимо.`}
            />
            <ConfirmModal
                show={showDeleteUserModal}
                onHide={() => setShowDeleteUserModal(false)}
                onConfirm={handleConfirmDeleteUser}
                title="Удаление участника"
                body={`Вы уверены, что хотите удалить пользователя "${selectedUser?.username}" из группы? Это действие необратимо.`}
            />
            <RenameGroupModal
                show={showRenameModal}
                onHide={() => setShowRenameModal(false)}
                currentGroup = {group}
                onSave={handleRenameGroup}
            />

        </div>
    );
};

export default ManageGroup;
