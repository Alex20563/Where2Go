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
import AllPolls from "./screens/poll/AllPools";
import PrivateRoute from "./components/PrivateRoute";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/2fa" element={<TwoFactorAuth/>}/>
                {/* Защита от перехода на страницы без авторизации */}
                <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
                <Route path="/create-group" element={<PrivateRoute><CreateGroup/></PrivateRoute>}/>
                <Route path="/create-poll" element={<PrivateRoute><CreatePoll/></PrivateRoute>}/>
                <Route path="/groups" element={<PrivateRoute><AllGroups/></PrivateRoute>}/>
                <Route path="/groups/:groupId" element={<PrivateRoute><ManageGroup/></PrivateRoute>}/>
                <Route path="/polls" element={<PrivateRoute><AllPolls/></PrivateRoute>}/>
            </Routes>
        </Router>
    );
}

export default App;
