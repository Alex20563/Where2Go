import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const response = await fetch("   ", {  // URL бэкенда
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem("token", data.token); // Сохранение токена
      navigate("/dashboard"); // Перенаправление после входа
    } else {
      alert("Ошибка: " + data.message);
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Введите email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default Login;
