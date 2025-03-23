import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css"; // Используем те же стили

function Register() {
  return (
      <div className="login-container d-flex align-items-center justify-content-center">
        <div className="login-box p-5 rounded shadow">
          <h2 className="text-center mb-4 text-primary">Регистрация</h2>

          <form>
            <div className="mb-3">
              <label className="form-label">Имя</label>
              <input type="text" className="form-control" placeholder="Введите имя" />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="Введите email" />
            </div>

            <div className="mb-3">
              <label className="form-label">Пароль</label>
              <input type="password" className="form-control" placeholder="Введите пароль" />
            </div>

            <div className="mb-3">
              <label className="form-label">Повторите пароль</label>
              <input type="password" className="form-control" placeholder="Повторите пароль" />
            </div>

            <button type="submit" className="btn btn-primary w-100">
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
