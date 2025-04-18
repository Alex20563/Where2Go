import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const RenameGroupModal = ({ show, onHide, currentGroup, onSave }) => {
    const [name, setName] = useState(currentGroup.name);

    useEffect(() => {
        setName(currentGroup.name);
    }, [currentGroup.name]);

    const handleSubmit = () => {
        onSave(name, currentGroup);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Переименование группы</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Новое название группы</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSubmit}>
                    Сохранить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RenameGroupModal;
