import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import './App.css';
import Login from "./screens/auth/pages/login/Login";
import Register from "./screens/auth/pages/register/Register";
import Home from "./screens/home/Home";
import Profile from "./screens/profile/Profile";
import TwoFactorAuth from "./screens/auth/pages/twofactor/TwoFactorAuth";
import CreateGroup from "./screens/profile/CreateGroup";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>

                {/* TODO: защитить от перехода на страницы без авторизации */}
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/2fa" element={<TwoFactorAuth/>}/>
                <Route path="/create-group" element={<CreateGroup/>} />
            </Routes>
        </Router>
    );
}

export default App;
