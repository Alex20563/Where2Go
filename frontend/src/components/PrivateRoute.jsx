import { Navigate, useLocation } from 'react-router-dom';

const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

const PrivateRoute = ({ children }) => {
    const location = useLocation();

    return isAuthenticated() ? (
        children
    ) : (
        <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
};

export default PrivateRoute;
