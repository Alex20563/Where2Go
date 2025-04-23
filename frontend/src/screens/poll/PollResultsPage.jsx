import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Spinner, Alert, Container} from 'react-bootstrap';
import API from "../../api";
import NavigationBar from "../../components/NavigationBar";
import RecommendedPlacesList from "./components/RecommendedPlacesList";
import "../../styles/styles.css";

const PollResultsPage = () => {
    const {pollId} = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [results, setResults] = useState(null);
    const [recommendedPlaces, setRecommendedPlaces] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchResults = async () => {
            try {
                console.log("Poll ID:", pollId); // Добавь это для отладки

                const userRes = await API.get("/auth/me");
                setUser(userRes.data);

                const response = await API.get(`/polls/${pollId}/results/`);
                console.log("Response:", response); // Логирование ответа
                setResults(response.data.results);
                setRecommendedPlaces(response.data.recommended_places);

            } catch (error) {
                setError(error.response?.data?.error || 'Ошибка загрузки результатов');
                setTimeout(() => navigate(`/polls/`), 1500);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    if (loading || !results) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div className="custom-bg" style={{color: "#000000", marginBottom: "20px"}}>
            <NavigationBar user={user}/>
            <Container className="mt-4">
                {error && <Alert variant="danger">{error}</Alert>}
                <h2>Результаты опроса</h2>
                <p>Всего голосов: {results.total_votes}</p>
                <p>Категории с наибольшим количеством голосов: {results.most_popular_categories.join(', ')}</p>

                {recommendedPlaces.length > 0 && (
                    <RecommendedPlacesList
                        recommendedPlaces={recommendedPlaces}
                        categories={results.most_popular_categories}
                    />)
                }
            </Container>
        </div>
    );
};

export default PollResultsPage;
