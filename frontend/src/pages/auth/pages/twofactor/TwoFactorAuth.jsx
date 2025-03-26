import "bootstrap/dist/css/bootstrap.min.css";
import "../../../../styles/Login.css";
import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function TwoFactorAuth() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const validateCode = (code) => {
        return /^\d{6}$/.test(code);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!validateCode(code)) {
            setError("Введите корректный 6-значный код.");
            return;
        }

        // TODO: Запрос на бэк
        if (code === "123456") {
            setSuccess("Код подтвержден! Вход выполнен.");
            setTimeout(() => navigate("/profile"), 1500);
        } else {
            setError("Неверный код. Проверьте почту и попробуйте снова.");
        }
    };

    return (
        <div className="login-container d-flex align-items-center justify-content-center">
            <div className="login-box p-5 rounded shadow">
                <h2 className="text-center mb-4 text-primary">Подтверждение входа</h2>
                <p className="text-center text-muted">Введите код, отправленный на вашу почту</p>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control text-center"
                            maxLength="6"
                            placeholder="Введите код"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Подтвердить
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TwoFactorAuth;
