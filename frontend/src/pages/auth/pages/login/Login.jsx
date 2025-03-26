import {Link, useNavigate} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../../styles/Login.css";
import React, {useState} from "react";
import {Alert} from 'react-bootstrap';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // Заглушка для проверки логина и пароля
    const mockUsers = [
        {email: "test@example.com", password: "Test123"},
        {email: "admin@example.com", password: "Admin123"}
    ];

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Введите и email, и пароль.");
            return;
        }

        if (!validateEmail(email)) {
            setError("Введите корректный email.");
            return;
        }

        if (!validatePassword(password)) {
            setError("Неверный email или пароль.");
            return;
        }

        // TODO: запрос на бэкенд
        const user = mockUsers.find(
            (user) => user.email === email && user.password === password);

        if (!user) {
            setError("Неверный email или пароль.");
            return;
        }

        setSuccess("Вход успешен!");
        setTimeout(() => navigate("/2fa"), 1500);
        console.log("Пользователь вошел:", {email});
    };

    return (
        <div className="login-container d-flex align-items-center justify-content-center">
            <div className="login-box p-5 rounded shadow">
                <h2 className="text-center mb-4 text-primary">Вход</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email"
                               className="form-control"
                               placeholder="Введите email"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
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
