import React, {useEffect, useState} from "react";
import { Modal, Button, Form } from "react-bootstrap";

const EditPollModal = ({ show, handleClose, poll, onSave }) => {
    const [question, setQuestion] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (poll) {
            setQuestion(poll.question);
            setEndTime(poll.end_time || "");
            setIsActive(poll.is_active);
        }
    }, [poll]);

    if (!poll) return null;

    const handleSubmit = () => {
        const updatedData = {
            question,
            end_time: endTime,
            is_active: isActive
        };
        onSave(poll.id, updatedData);
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Редактировать опрос</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Активен"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
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
