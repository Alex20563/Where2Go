import React, { useEffect, useState } from "react";
import {Container, Card, Button, Row, Col, Spinner} from "react-bootstrap";
import NavigationBar from "../../components/NavigationBar";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import EditPollModal from "./components/EditPollModal";
import ConfirmModal from "./components/ConfirmPollModal";


const AllPolls = () => {
    const navigate = useNavigate();
    const [polls, setPolls] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingPoll, setEditingPoll] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [closingPoll, setClosingPoll] = useState(null);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [selectedPollId, setSelectedPollId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const now = new Date();

    const activePolls = polls.filter((poll) => (new Date(poll.end_time) >= now) && poll.is_active);
    const archivedPolls = polls.filter((poll) => (new Date(poll.end_time) < now) || !poll.is_active);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await API.get("/auth/me");
                const pollsRes = await API.get("/polls/all/");

                setUser(userRes.data);
                setPolls(pollsRes.data);
            } catch (error) {
                console.error("Ошибка при загрузке пользователя:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleVote = (pollId) => {
        navigate(`/polls/${pollId}`);
    }

    const handleDeleteConfirm = async () => {
        try {
            await API.delete(`/polls/${selectedPollId}/`);
            setSuccess("Опрос успешно удален.");
            setPolls(polls.filter(p => p.id !== selectedPollId));
            setShowDeleteModal(false);
        } catch (err) {
            setError("Ошибка при удалении опроса.");
        }
    };

    const handleDelete = (pollId) => {
        setError("");
        setSuccess("");
        setSelectedPollId(pollId);
        setShowDeleteModal(true);
    };

    const handleResults = (pollId) => navigate(`/polls/${pollId}/results`);

    const handleEdit = (pollId) => {
        setError("");
        setSuccess("");
        const poll = activePolls.find(p => p.id === pollId);
        setEditingPoll(poll);
        setShowEditModal(true);
    };

    const handleClose = (pollId) => {
        setError("");
        setSuccess("");
        const poll = activePolls.find(p => p.id === pollId);
        setClosingPoll(poll);
        setShowCloseModal(true);
    };

    const handleCloseConfirm = async () => {
        try {
            await API.post(`/polls/${closingPoll.id}/close/`);
            setSuccess("Опрос успешно закрыт.");
            setPolls(polls.filter(p => p.id !== closingPoll));
            setShowCloseModal(false);
        } catch (err) {
            setError("Ошибка при закрытии опроса.");
            console.error(err);
        }
    }

    const handleSavePoll = async (id, updatedData) => {
        try {
            const response = await API.patch(`/polls/${id}/update/`, {
                question: updatedData.question,
                end_time: updatedData.end_time,
            });

            if (response.status !== 200 ) {
                setError("Ошибка при обновлении опроса.");
            }

            const updatedPoll = response.data;
            setPolls(prevPolls =>
                prevPolls.map(p => (p.id === id ? updatedPoll : p))
            );

            setShowEditModal(false);
        } catch (err) {
            setError(`Ошибка при обновлении: ${err}`)
            console.error("Ошибка при обновлении:", err);
        }
    };


    const renderPollActions = (poll) => {
        const isAuthor = poll.creator === user?.id;

        return (
            <div className="d-flex gap-2 mt-2">
                {poll.is_active && !poll.has_voted && (
                    <Button variant="primary" size="sm" onClick={() => handleVote(poll.id)}>
                        Голосовать
                    </Button>
                )}
                {isAuthor && (
                    <>
                        <Button variant="warning" size="sm" onClick={() => handleEdit(poll.id)}>
                            Редактировать
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(poll.id)}>
                            Удалить
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleClose(poll.id)}>
                            Закрыть
                        </Button>
                    </>
                )}
            </div>
        );
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
        <div>
            <NavigationBar user={user}/>

            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2>Доступные опросы</h2>
                    <Button variant="outline-secondary" onClick={() => navigate("/create-poll")}>
                        Создать опрос
                    </Button>
                </div>

                <Row>
                    {activePolls.map((poll) => (
                        <Col md={6} key={poll.id}>
                            <Card className="mb-3">
                                <Card.Body>
                                    <Card.Title>{poll.question}</Card.Title>
                                    {renderPollActions(poll)}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <h2 className="mt-5">Архив опросов</h2>
                <Row>
                    {archivedPolls.map((poll) => (
                        <Col md={6} key={poll.id}>
                            <Card className="mb-3 bg-light">
                                <Card.Body>
                                    <Card.Title>{poll.question}</Card.Title>
                                    <Button variant="info" size="sm" onClick={() => handleResults(poll.id)}>
                                        Результаты
                                    </Button>
                                    {poll.creator === user?.id && (
                                        <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(poll.id)}>
                                            Удалить
                                        </Button>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            <EditPollModal
                show={showEditModal}
                onHide ={() => setShowEditModal(false)}
                poll={editingPoll}
                onSave={handleSavePoll}
                error={error}
                success={success}
            />
            <ConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                error={error}
                success={success}
                title="Подтвердите удаление"
                message="Вы уверены, что хотите удалить этот опрос? Это действие нельзя отменить."
                confirmLabel="Удалить"
            />

            <ConfirmModal
                show={showCloseModal}
                onHide={() => setShowCloseModal(false)}
                onConfirm={handleCloseConfirm}
                error={error}
                success={success}
                title="Подтвердите закрытие"
                message="Вы уверены, что хотите закрыть опрос? После этого голосование будет завершено."
                confirmLabel="Закрыть"
            />

        </div>
    );
};

export default AllPolls;
