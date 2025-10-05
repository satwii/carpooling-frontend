import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import DriverDashboard from '../components/DriverDashboard';
import RiderDashboard from '../components/RiderDashboard';

const DashboardPage = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="dashboard">
            {user.role_id === 1 && <DriverDashboard />}
            {user.role_id === 2 && <RiderDashboard />}
        </div>
    );
};

export default DashboardPage;