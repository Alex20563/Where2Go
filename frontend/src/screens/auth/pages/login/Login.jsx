import {Link, useNavigate} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../../styles/Login.css";
import API from "../../../../api";
import React, {useState} from "react";
import {Alert} from 'react-bootstrap';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async (event) => {
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

        try {
            const response = await API.post("/login/", {email, password});
            console.log(response.data);

            if (response.status === 201) {
                setSuccess("Вход успешен!");
                console.log("Успешный вход:", response.data);
                setTimeout(() => navigate("/2fa"), 1500);
            }
        } catch (error) {
            setError("Ошибка входа. Проверьте данные.");
            console.error("Ошибка запроса:", error);
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
