import React, { useEffect, useRef, useState } from "react";
import { Button, Container, Form, Spinner } from "react-bootstrap";
import {useNavigate, useParams} from "react-router-dom";
import NavigationBar from "../../components/NavigationBar";
import API from "../../api";
import { load2GIS } from "../../utils/load2gis";

//TODO: запрос на бэк
const mockPlaces = [
    { id: 1, name: "Кофейня" },
    { id: 2, name: "Парк" },
    { id: 3, name: "ТЦ" },
];

const PollPage = () => {
    const {pollId} = useParams();
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const [selectedPlace, setSelectedPlace] = useState("");
    const [selectedCoords, setSelectedCoords] = useState([]);
    const [user, setUser] = useState(null);
    const [poll, setPoll] = useState(null);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMap, setLoadingMap] = useState(true);

    useEffect(() => {
        load2GIS()
            .then((loadedDG) => {
                if (window.DG) {
                    console.log("DG доступен:", window.DG);
                    loadedDG = window.DG;
                } else {
                    console.error("DG не найден в window!");
                }

                const interval = setInterval(() => {
                    if (mapRef.current && loadedDG && loadedDG.ready && typeof loadedDG.map === "function") {
                        clearInterval(interval);

                        try {
                            const map = loadedDG.map(mapRef.current, {
                                center: [59.9343, 30.3351],
                                zoom: 13,
                            });

                            console.log("Map instance created");

                            let marker = null;
                            map.on("click", function (e) {
                                const { lat, lng } = e.latlng;
                                if (marker) {
                                    marker.setLatLng([lat, lng]);
                                } else {
                                    marker = loadedDG.marker([lat, lng]).addTo(map);
                                }
                                setSelectedCoords([lat, lng]);
                            });

                            setLoadingMap(false);
                        } catch (err) {
                            console.error("Ошибка при инициализации карты:", err);
                        }
                    }
                }, 100);
            })
            .catch((err) => {
                console.error("Ошибка загрузки 2GIS:", err);
            });

        const fetchData = async () => {
            try {
                const userRes = await API.get("/auth/me");
                const pollRes = await API.get(`/polls/${pollId}`);

                const groupId = pollRes.data.group;
                const groupRes = await API.get(`/groups/${groupId}/detail/`);
                setUser(userRes.data);
                setPoll(pollRes.data);
                setGroup(groupRes.data);

            } catch (error) {
                console.error("Ошибка при загрузке:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = () => {
        console.log("Выбранные координаты:", selectedCoords);
        console.log("Выбранное место:", selectedPlace);
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

    const handleLogout = () => {
        console.log("Выход из аккаунта...");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
    };

    return (
        <div className="manage-group-container" style={{ color: "#000000", marginBottom: "20px" }}>
            <NavigationBar user={user} handleLogout={handleLogout} />
            <Container className="mt-4">
                <h2>Голосование в опросе {poll.question} группы {group.name} </h2>
                {loadingMap && (
                    <div className="d-flex justify-content-center mt-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Загрузка...</span>
                        </Spinner>
                    </div>
                )}
                <div
                    ref={mapRef}
                    style={{ width: "100%", height: "400px", marginBottom: "20px" }}
                />

                <Form.Select
                    value={selectedPlace}
                    onChange={(e) => setSelectedPlace(e.target.value)}
                    className="mb-3"
                >
                    <option value="">Выберите место из списка</option>
                    {Array.isArray(mockPlaces) &&
                        mockPlaces.map((place) => (
                            <option key={place.id} value={place.name}>
                                {place.name}
                            </option>
                        ))}
                </Form.Select>

                <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => navigate("/polls")}>
                        Назад
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={selectedCoords.length === 0 || !selectedPlace}
                    >
                        Отправить
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default PollPage;
