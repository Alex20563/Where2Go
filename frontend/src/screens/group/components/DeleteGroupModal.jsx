import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteGroupModal = ({ show, onHide, onConfirm, groupName }) => {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Удаление группы</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Вы уверены, что хотите удалить группу <strong>{groupName}</strong>? Это действие необратимо.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={onConfirm}>
                    Удалить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteGroupModal;
