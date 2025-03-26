import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/pages/login/Login";
import Register from "./pages/auth/pages/register/Register";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import TwoFactorAuth from "./pages/auth/pages/twofactor/TwoFactorAuth";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* TODO: защитить от перехода на страницы без авторизации */}
          <Route path="/profile" element={<Profile />}/>
          <Route path="/2fa" element={<TwoFactorAuth />}/>
      </Routes>
    </Router>
  );
}

export default App;
