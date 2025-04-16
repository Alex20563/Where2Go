import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Container, Button, Spinner} from "react-bootstrap";
import "../../styles/Profile.css";
import NavigationBar from "../../components/NavigationBar";
import API from "../../api";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await API.get("/auth/me");
                if (userResponse.status !== 200) {
                    throw new Error("Ошибка при загрузке пользователя");
                }

                const userData = userResponse.data;

                const groupsResponse = await API.get("/groups/");
                const groupsData = Array.isArray(groupsResponse.data) ? groupsResponse.data : [];

                setUser({
                    ...userData,
                    groups: groupsData,
                    polls: [
                        // TODO
                        { id: 101, question: "Пример вопроса 1" },
                        { id: 102, question: "Пример вопроса 2" }
                    ]
                });
            } catch (error) {
                console.error(error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        console.log("Выход из аккаунта...");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
    };

    if (loading) return (
        <div className="d-flex justify-content-center mt-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка...</span>
            </Spinner>
        </div>
    );
    if (!user) return <p>Пользователь не найден</p>;

    return (
        <div className="profile-container">
            <NavigationBar user={user} handleLogout={handleLogout}/>

            <Container className="mt-4">
                <h2>Мои группы</h2>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <Button variant="outline-secondary" className="mb-3" onClick={() => navigate("/create-group")}>
                        Создать группу
                    </Button>
                    <Button variant="primary" className="mb-3 ms-2" onClick={() => navigate("/groups")}>
                        Все группы
                    </Button>
                </div>
                {user.groups.length === 0 ? (
                    <p>Вы пока не создали ни одной группы.</p>
                ) : (
                    <ul className="list-group">
                        {user.groups.slice(0, 3).map(group => (
                            <li key={group.id} className="list-group-item">
                                {group.name}
                            </li>
                        ))}
                    </ul>
                )}

                <h2 className="mt-4">Доступные опросы</h2>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <Button variant="outline-secondary" className="mb-3" onClick={() => navigate("/create-poll")}>
                        Создать опрос
                    </Button>
                    <Button variant="primary" className="mb-3 ms-2" onClick={() => navigate("/polls")}>
                        Все опросы
                    </Button>
                </div>
                <ul className="list-group">
                    {user.polls.map(poll => (
                        <li key={poll.id} className="list-group-item">{poll.question}</li>
                    ))}
                </ul>
            </Container>
        </div>
    );
};

export default Profile;
