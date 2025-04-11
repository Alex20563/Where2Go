import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import './App.css';
import Login from "./screens/auth/pages/login/Login";
import Register from "./screens/auth/pages/register/Register";
import Home from "./screens/home/Home";
import Profile from "./screens/profile/Profile";
import TwoFactorAuth from "./screens/auth/pages/twofactor/TwoFactorAuth";
import CreateGroup from "./screens/group/CreateGroup";
import CreatePoll from "./screens/poll/CreatePoll";
import AllGroups from "./screens/group/AllGroups";
import ManageGroup from "./screens/group/ManageGroup";

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
                <Route path="/create-group" element={<CreateGroup/>}/>
                <Route path="/create-poll" element={<CreatePoll/>}/>
                <Route path="/groups" element={<AllGroups/>}/>
                <Route path="/groups/:groupId" element={<ManageGroup/>}/>
            </Routes>
        </Router>
    );
}

export default App;
