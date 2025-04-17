import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";

const DeletePollModal = ({ show, onHide, onConfirm, error, success }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Удалить опрос</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <p>Вы уверены, что хотите удалить этот опрос? Это действие нельзя отменить.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={onConfirm}>
                    Удалить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeletePollModal;
