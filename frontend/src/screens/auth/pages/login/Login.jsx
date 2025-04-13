import {Link, useNavigate} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../../styles/Login.css";
import API from "../../../../api";
import React, {useState} from "react";
import {Alert} from 'react-bootstrap';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!username || !password || !validatePassword(password)) {
            setError("Неверные имя пользователя или пароль.");
            return;
        }

        try {
            const response = await API.post("/auth/login-2fa", {
                username: username,
                password: password
            });

            if (response.status === 200) {
                setSuccess("Вход успешен! Перенаправление...");
                setTimeout(() => navigate("/2fa", {
                    state: {username, password}
                }), 1500);

            }
        } catch (error) {
            console.error("Ошибка запроса:", error);
            if (error.response?.status === 400) {
                setError("Неверный код 2FA.");
            } else if (error.response?.status === 401) {
                setError("Неверные имя пользователя или пароль.");
            } else {
                setError("Ошибка входа. Попробуйте позже.");
            }
        }
    };

    return (
        <div className="login-container d-flex align-items-center justify-content-center">
            <div className="login-box p-5 rounded shadow">
                <h2 className="text-center mb-4 text-primary">Вход</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Имя пользователя</label>
                        <input type="text"
                               className="form-control"
                               placeholder="Введите имя пользователя"
                               value={username}
                               onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Пароль</label>
                        <input type="password"
                               className="form-control"
                               placeholder="Введите пароль"
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Войти
                    </button>
                </form>

                <div className="text-center mt-3">
                    <p>
                        Нет аккаунта? <Link to="/register" className="text-decoration-none">Зарегистрируйтесь</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
