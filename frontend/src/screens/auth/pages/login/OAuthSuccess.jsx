import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function OAuthSuccess() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = params.get("token");

        if (token) {
            localStorage.setItem("token", token);
            setTimeout(() => navigate("/profile"), 1500);
        } else {
            navigate("/login", { state: { error: "Ошибка входа через OAuth" } });
        }
    }, [params, navigate]);

    return <p>Загрузка...</p>;
}

export default OAuthSuccess;
