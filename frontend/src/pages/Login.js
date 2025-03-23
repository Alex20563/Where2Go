import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css"; 

function Login() {
  return (
      <div className="login-container d-flex align-items-center justify-content-center">
        <div className="login-box p-5 rounded shadow">
          <h2 className="text-center mb-4 text-primary">Вход</h2>

          <form>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="Введите email" />
            </div>

            <div className="mb-3">
              <label className="form-label">Пароль</label>
              <input type="password" className="form-control" placeholder="Введите пароль" />
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
