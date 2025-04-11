import {Link} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../../assets/logo.png";
import "../../styles/Home.css";

function Home() {
    return (
        <div
            className="container flex-column align-items-center min-vh-100 min-vw-100 text-center text-black home-container">
            <img src={logo} alt="Where2Go Logo" className="mb-4" style={{width: "300px"}}/>
            <p className="lead">Cпонтанность, организованная с умом</p>

            <div className="mt-4 d-flex gap-3">
                <Link to="/login">
                    <button className="btn btn-lg btn-outline-secondary px-5 py-3 rounded-pill">
                        Войти
                    </button>
                </Link>
                <Link to="/register">
                    <button className="btn btn-lg btn-primary px-5 py-3 rounded-pill">
                        Регистрация
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default Home;
