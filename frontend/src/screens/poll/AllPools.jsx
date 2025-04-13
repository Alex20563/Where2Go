import React from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import NavigationBar from "../../components/NavigationBar";
import {useNavigate} from "react-router-dom";

const AllPolls = () => {
    const navigate = useNavigate();
    const user = { id: 1, username: "User123", email: "user@example.com" };

    // Мок-данные
    const activePolls = [
        { id: 1, question: "Где встретимся?", authorId: 1, hasVoted: false },
        { id: 2, question: "Какой фильм смотрим?", authorId: 2, hasVoted: true },
    ];

    const archivedPolls = [
        { id: 3, question: "Что ели в прошлый раз?", authorId: 1 },
        { id: 4, question: "Как доехали?", authorId: 2 },
    ];

    const handleVote = (pollId) => {
        console.log(`Голосуем в опросе ${pollId}`);
    };

    const handleEdit = (pollId) => {
        console.log(`Редактируем опрос ${pollId}`);
    };

    const handleDelete = (pollId) => {
        console.log(`Удаляем опрос ${pollId}`);
    };

    const handleResults = (pollId) => {
        console.log(`Смотрим результаты опроса ${pollId}`);
    };

    const renderPollActions = (poll) => {
        const isAuthor = poll.authorId === user.id;
        return (
            <div className="d-flex gap-2 mt-2">
                {!poll.hasVoted && (
                    <Button variant="primary" size="sm" onClick={() => handleVote(poll.id)}>
                        Голосовать
                    </Button>
                )}
                <Button variant="info" size="sm" onClick={() => handleResults(poll.id)}>
                    Результаты
                </Button>
                {isAuthor && (
                    <>
                        <Button variant="warning" size="sm" onClick={() => handleEdit(poll.id)}>
                            Редактировать
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(poll.id)}>
                            Удалить
                        </Button>
                    </>
                )}
            </div>
        );
    };

    return (
        <div>
            <NavigationBar user={user} handleLogout={() => console.log("logout")} />

            <Container className="mt-4">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <h2>Доступные опросы</h2>
                    <Button variant="outline-secondary" className="" onClick={() => navigate("/create-poll")}>
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
                                    {poll.authorId === user.id && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="ms-2"
                                            onClick={() => handleDelete(poll.id)}
                                        >
                                            Удалить
                                        </Button>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default AllPolls;
