import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner, Alert, Card, ListGroup, Container } from 'react-bootstrap';
import axios from 'axios';

const PollResultsPage = () => {
    const { id } = useParams();
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get(`/api/polls/${id}/results/`);
                setResults(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Ошибка загрузки результатов');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [id]);

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container>
            <h2>Результаты опроса</h2>
            <p>Всего голосов: {results.total_votes}</p>
            <p>Популярная категория: {results.most_popular_category}</p>
            <p>Средняя точка: {results.average_point.lat}, {results.average_point.lon}</p>

            <Card>
                <Card.Header>Варианты</Card.Header>
                <ListGroup variant="flush">
                    {results.choices.map(choice => (
                        <ListGroup.Item key={choice.id}>
                            {choice.text} — {choice.votes} голосов
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card>
        </Container>
    );
};

export default PollResultsPage;
