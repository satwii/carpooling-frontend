import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AuthContext from './context/AuthContext';

function App() {
    const { user, logout } = useContext(AuthContext);

    return (
        <Router>
            <nav>
                <NavLink to="/"><h1>RideShare</h1></NavLink>
                <div>
                    {user ? (
                        <>
                            <NavLink to="/dashboard">Dashboard</NavLink>
                            <button onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login">Login</NavLink>
                            <NavLink to="/register">Register</NavLink>
                        </>
                    )}
                </div>
            </nav>
            <div className="container">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
                    <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
                    <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;