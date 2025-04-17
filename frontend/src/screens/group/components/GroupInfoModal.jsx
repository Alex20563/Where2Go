import React from "react";
import { Modal, Alert } from "react-bootstrap";

const GroupInfoModal = ({ show, handleClose, group, error, success }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Информация о группе</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {group && (
                    <>
                        <p><strong>Название:</strong> {group.name}</p>
                        <p>
                            <strong>Админ:</strong>{" "}
                            {group.adminUser ? `${group.adminUser.username}` : group.admin}
                        </p>
                        <p><strong>Участники:</strong></p>
                        <ul>
                            {group.memberUsers?.map((member) => (
                                <li key={member.id}>{member.username}</li>
                            ))}
                        </ul>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default GroupInfoModal;
