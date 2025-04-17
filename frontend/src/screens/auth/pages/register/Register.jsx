import {Link, useNavigate} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../../styles/Login.css";
import React, {useState} from "react";
import {Alert} from "react-bootstrap";
import API from "../../../../api";
import CaptchaField from "../../components/CaptchaField";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [captchaToken, setCaptchaToken] = useState(null);
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
        setSuccess("");

        if (!username || !email || !password || !confirmPassword) {
            setError("Заполните все поля.");
            return;
        }

        if (!validateEmail(email)) {
            setError("Введите корректный email.");
            return;
        }

        if (!validatePassword(password)) {
            setError("Пароль должен содержать не менее 6 символов, включая цифры и заглавные и строчные буквы.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Пароли не совпадают.");
            return;
        }

        try {
            const response = await API.post("/auth/register/", {
                username,
                email,
                password,
                captcha: captchaToken,
            });

            if (response.status === 201) {
                setSuccess("Вы успешно зарегистрированы! Перенаправление...");
                setTimeout(() => navigate("/2fa", {
                    state: {
                        isActivation: true,
                        email: email
                    }
                }), 1500);
            }
        } catch (err) {
            if (err.response) {
                setError("Ошибка при регистрации: " + (err.response.data.detail || "Попробуйте снова."));
            } else {
                setError("Ошибка сети. Проверьте соединение.");
            }
        }
    };

    return (
        <div className="login-container d-flex align-items-center justify-content-center">
            <div className="login-box p-5 rounded shadow">
                <h2 className="text-center mb-4 text-primary">Регистрация</h2>
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

                    <div className="mb-3">
                        <label className="form-label">Повторите пароль</label>
                        <input type="password"
                               className="form-control"
                               placeholder="Повторите пароль"
                               value={confirmPassword}
                               onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <CaptchaField onChange={(token) => setCaptchaToken(token)} />
                    <button type="submit" className="btn btn-primary w-100" disabled={!captchaToken}>
                        Зарегистрироваться
                    </button>
                </form>

                <div className="text-center mt-3">
                    <p>
                        Уже есть аккаунт? <Link to="/login" className="text-decoration-none">Войти</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
