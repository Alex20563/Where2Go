import "bootstrap/dist/css/bootstrap.min.css";
import "../../../../styles/Login.css";
import API from "../../../../api";
import React, {useState} from "react";
import {Alert} from "react-bootstrap";
import {useLocation, useNavigate} from "react-router-dom";


function TwoFactorAuth() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { username, password, isActivation, email } = location.state || {};

    const validateCode = (code) => {
        return /^\d{6}$/.test(code);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!validateCode(code)) {
            setError("Введите корректный 6-значный код.");
            return;
        }

        try {
            if (isActivation) {
                const response = await API.post("/auth/activate/", {
                    email: email,
                    code: code,
                });

                if (response.status === 200) {
                    setSuccess("Аккаунт активирован! Перенаправление...");
                    setTimeout(() => navigate("/login"), 2000);
                }
            } else {
                const response = await API.post("/auth/login-2fa", {
                    username,
                    password,
                    code,
                });

                if (response.status === 200) {
                    setSuccess("Код подтвержден! Вход выполнен.");
                    localStorage.setItem("token", response.data.token);
                    setTimeout(() => navigate("/profile"), 1500);
                }
            }
        } catch (error) {
            console.error("Ошибка запроса:", error);
            const message = error.response?.data?.error || "Ошибка подтверждения.";
            setError(message);
        }
    };

    return (
        <div className="login-container d-flex align-items-center justify-content-center">
            <div className="login-box p-5 rounded shadow">
                <h2 className="text-center mb-4 text-primary">
                    {isActivation ? "Активация аккаунта" : "Подтверждение входа"}
                </h2>
                <p className="text-center text-muted">
                    Введите код, отправленный на вашу почту
                </p>

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
