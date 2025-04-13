import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../../components/NavigationBar";
import API from "../../api";

const AllGroups = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const userRes = await API.get("/auth/me");
                const groupsRes = await API.get("/groups/");

                setUser(userRes.data);
                setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
            } catch (error) {
                console.error("Ошибка при загрузке групп:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1000);
    };

    const renderGroupActions = (group) => (
        <Button variant="primary" onClick={() => navigate(`/groups/${group.id}`)}>
            Перейти
        </Button>
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
            </div>
        );
    }

    const adminGroups = groups.filter(group => group.admin === user.id);
    const memberGroups = groups.filter(group => group.admin !== user.id);

    return (
        <div>
            <NavigationBar user={user} handleLogout={handleLogout} />

            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Мои группы</h2>
                    <Button variant="outline-secondary" onClick={() => navigate("/create-group")}>
                        Создать группу
                    </Button>
                </div>

                {adminGroups.length > 0 && (
                    <>
                        <h4>Я админ</h4>
                        <Row>
                            {adminGroups.map(group => (
                                <Col md={6} key={group.id}>
                                    <Card className="mb-3">
                                        <Card.Body>
                                            <Card.Title>{group.name}</Card.Title>
                                            {renderGroupActions(group)}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}

                {memberGroups.length > 0 && (
                    <>
                        <h4 className="mt-5">Я участник</h4>
                        <Row>
                            {memberGroups.map(group => (
                                <Col md={6} key={group.id}>
                                    <Card className="mb-3 bg-light">
                                        <Card.Body>
                                            <Card.Title>{group.name}</Card.Title>
                                            {renderGroupActions(group)}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}

                {adminGroups.length === 0 && memberGroups.length === 0 && (
                    <p>Вы пока не состоите ни в одной группе.</p>
                )}
            </Container>
        </div>
    );
};

export default AllGroups;
