import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const RecommendedPlacesList = ({ recommendedPlaces, categories }) => {
    return (
        <>
            <h3 className="mt-4">Рекомендованные места</h3>
            {recommendedPlaces.map((rec, index) => (
                <Card key={index} className="mb-3">
                    <Card.Header>
                        Категория: {categories[index] || 'неизвестно'}
                    </Card.Header>
                    <Card.Body>
                        {rec.places.length === 0 ? (
                            <p>Нет подходящих мест</p>
                        ) : (
                            <ListGroup variant="flush">
                                {rec.places.map((place, idx) => (
                                    <ListGroup.Item key={idx}>
                                        <strong>{place.name}</strong><br/>
                                        {place.address}<br/>
                                        Рейтинг: {place.rating}<br/>
                                        <a href={place["2gis_link"]} target="_blank" rel="noopener noreferrer">Ссылка в 2ГИС</a><br/>
                                        <a href={place.direction_links.google} target="_blank" rel="noopener noreferrer">Google Навигатор</a> |{" "}
                                        <a href={place.direction_links.yandex} target="_blank" rel="noopener noreferrer">Яндекс Навигатор</a>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Card.Body>
                </Card>
            ))}
        </>
    );
};

export default RecommendedPlacesList;
