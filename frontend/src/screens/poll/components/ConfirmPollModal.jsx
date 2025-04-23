import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";

const ConfirmModal = ({
                          show,
                          onHide,
                          onConfirm,
                          error,
                          success,
                          title = "Подтвердите действие",
                          message = "Вы уверены, что хотите продолжить?",
                          confirmLabel = "Подтвердить"
                      }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant={"danger"} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
