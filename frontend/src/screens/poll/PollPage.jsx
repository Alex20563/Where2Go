import React, { useEffect, useRef, useState } from "react";
import {Alert, Button, Container, Spinner} from "react-bootstrap";
import {useNavigate, useParams} from "react-router-dom";
import NavigationBar from "../../components/NavigationBar";
import API from "../../api";
import { load2GIS } from "../../utils/load2gis";
import Select from "react-select";

const PollPage = () => {
    const {pollId} = useParams();
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedCoords, setSelectedCoords] = useState([]);
    const [user, setUser] = useState(null);
    const [poll, setPoll] = useState(null);
    const [group, setGroup] = useState(null);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMap, setLoadingMap] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


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
                const placesRes = await API.get(`/map/categories`);

                const groupId = pollRes.data.group;
                const groupRes = await API.get(`/groups/${groupId}/detail/`);

                setUser(userRes.data);
                setPoll(pollRes.data);
                setGroup(groupRes.data);
                setPlaces(placesRes.data.categories);

            } catch (error) {
                console.error("Ошибка при загрузке:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async () => {
        selectedOptions.map(option => option.value)
        if (selectedCoords.length !== 2 || selectedOptions.length === 0) {
            return;
        }

        setIsSubmitting(true);
        const [latitude, longitude] = selectedCoords;

        try {
            await API.post(`/polls/${pollId}/vote/`, {
                lat: latitude,
                lon: longitude,
                categories: selectedOptions,
            });
            setSuccess("Ваш голос учтен!");
            setTimeout(() => navigate(`/polls/${pollId}/results`), 1500);

        } catch (error) {
            console.error("Ошибка при голосовании:", error);
            setError("Ошибка при голосовании. Попробуйте позже.");
        } finally {
            setIsSubmitting(false);
        }
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

    const placeOptions = Array.isArray(places)
        ? places.map(place => ({ value: place, label: place }))
        : [];

    return (
        <div className="manage-group-container" style={{ color: "#000000", marginBottom: "20px" }}>
            <NavigationBar user={user}/>
            <Container className="mt-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

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

                <Select
                    isMulti
                    options={placeOptions}
                    value={selectedOptions}
                    onChange={(options) => setSelectedOptions(options)}
                    className="mb-3"
                    placeholder="Выберите места из списка..."
                />

                <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => navigate("/polls")}>
                        Назад
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={selectedCoords.length === 0 || selectedOptions.length === 0}
                    >
                        Отправить
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default PollPage;
