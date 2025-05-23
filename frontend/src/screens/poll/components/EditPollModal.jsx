import React, {useEffect, useState} from "react";
import {Modal, Button, Form, Alert} from "react-bootstrap";

const EditPollModal = ({ show, onHide, poll, onSave, error, success }) => {
    const [question, setQuestion] = useState("");
    const [endTime, setEndTime] = useState("");

    useEffect(() => {
        if (poll) {
            setQuestion(poll.question);
            setEndTime(poll.end_time || "");
        }

    }, [poll]);

    if (!poll) return null;

    const handleSubmit = () => {
        const updatedData = {
            question,
            end_time: endTime
        };
        onSave(poll.id, updatedData);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Редактировать опрос</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Вопрос</Form.Label>
                        <Form.Control
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Время окончания</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={endTime?.slice(0, 16)}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSubmit}>Сохранить</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditPollModal;
