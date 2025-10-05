import React, { useState, useEffect, useCallback } from 'react';
import { getDriverStats, getDriverVehicles, addVehicle, createTrip, cancelDriverTrip } from '../services/api';

const DriverDashboard = () => {
    const [stats, setStats] = useState({ earnings: 0, totalTrips: 0, todaysTrips: [], upcomingTrips: [] });
    const [vehicles, setVehicles] = useState([]);
    const [showVehicleForm, setShowVehicleForm] = useState(false);
    const [showTripForm, setShowTripForm] = useState(false);

    const [newVehicle, setNewVehicle] = useState({ registrationNo: '', model: '', type: '', color: '', capacity: 4 });
    const [newTrip, setNewTrip] = useState({ source: '', destination: '', departure_time: '', vehicle_id: '', available_seats: '', price: '' });
    
    const fetchData = useCallback(async () => {
        try {
            const [statsRes, vehiclesRes] = await Promise.all([getDriverStats(), getDriverVehicles()]);
            setStats(statsRes.data);
            setVehicles(vehiclesRes.data);
            if (vehiclesRes.data.length > 0) {
                setNewTrip(prev => ({ ...prev, vehicle_id: vehiclesRes.data[0].Vehicle_ID }));
            }
        } catch (error) {
            console.error("Failed to fetch driver data", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleVehicleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addVehicle(newVehicle);
            alert('Vehicle added successfully!');
            setShowVehicleForm(false);
            fetchData(); // Refresh data
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to add vehicle.');
        }
    };
    
    const handleTripSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTrip(newTrip);
            alert('Trip created successfully!');
            setShowTripForm(false);
            fetchData(); // Refresh data
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to create trip.');
        }
    };

    const handleCancelTrip = async (tripId) => {
        if (window.confirm("Are you sure you want to cancel this trip? This will cancel all bookings and issue refunds.")) {
            try {
                await cancelDriverTrip(tripId);
                alert("Trip cancelled successfully.");
                fetchData();
            } catch (error) {
                alert(error.response?.data?.msg || 'Failed to cancel trip.');
            }
        }
    }

    return (
        <div>
            <h2>Driver Dashboard</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Earnings</h3>
                    <p>${parseFloat(stats.earnings).toFixed(2)}</p>
                </div>
                 <div className="stat-card">
                    <h3>Active Trips</h3>
                    <p>{stats.totalTrips}</p>
                </div>
                 <div className="stat-card">
                    <h3>Upcoming Trips</h3>
                    <p>{stats.upcomingTrips.length}</p>
                </div>
            </div>

            <div className="card">
                <h3>Your Vehicles</h3>
                <ul>{vehicles.map(v => <li key={v.Vehicle_ID}>{v.Model} ({v.RegistrationNo})</li>)}</ul>
                <button className="btn" onClick={() => setShowVehicleForm(!showVehicleForm)}>+ Add Vehicle</button>
                {showVehicleForm && (
                    <form onSubmit={handleVehicleSubmit} className="form-container" style={{maxWidth: '100%', margin: '20px 0'}}>
                        <input placeholder="Registration No" onChange={e => setNewVehicle({...newVehicle, registrationNo: e.target.value})} required/>
                        <input placeholder="Model (e.g., Toyota Camry)" onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
                        <input type="number" placeholder="Capacity" onChange={e => setNewVehicle({...newVehicle, capacity: e.target.value})} required/>
                        <button type="submit" className="btn">Save Vehicle</button>
                    </form>
                )}
            </div>

            <div className="card">
                <h3>Create New Trip</h3>
                <button className="btn" onClick={() => setShowTripForm(!showTripForm)}>+ New Trip</button>
                 {showTripForm && (
                    <form onSubmit={handleTripSubmit} className="form-container" style={{maxWidth: '100%', margin: '20px 0'}}>
                        <input placeholder="Source" onChange={e => setNewTrip({...newTrip, source: e.target.value})} required/>
                        <input placeholder="Destination" onChange={e => setNewTrip({...newTrip, destination: e.target.value})} required/>
                        <input type="datetime-local" onChange={e => setNewTrip({...newTrip, departure_time: e.target.value})} required/>
                        <select value={newTrip.vehicle_id} onChange={e => setNewTrip({...newTrip, vehicle_id: e.target.value})} required>
                            <option value="">Select Vehicle</option>
                            {vehicles.map(v => <option key={v.Vehicle_ID} value={v.Vehicle_ID}>{v.Model} ({v.RegistrationNo})</option>)}
                        </select>
                        <input type="number" placeholder="Available Seats" onChange={e => setNewTrip({...newTrip, available_seats: e.target.value})} required/>
                        <input type="number" placeholder="Price per Seat" onChange={e => setNewTrip({...newTrip, price: e.target.value})} required/>
                        <button type="submit" className="btn">Create Trip</button>
                    </form>
                )}
            </div>
            
            <div className="card">
                <h3>Upcoming Trips</h3>
                {stats.upcomingTrips.map(trip => (
                    <div key={trip.Trip_ID} className="trip-card">
                        <p><b>From:</b> {trip.Source} <b>To:</b> {trip.Destination}</p>
                        <p><b>Departs:</b> {new Date(trip.DepartureTime).toLocaleString()}</p>
                        <p><b>Status:</b> {trip.Status_Name}</p>
                        
                        {/* --- THIS IS THE FIX --- */}
                        {/* Only show the button if the trip is NOT cancelled */}
                        {trip.Status_Name !== 'Cancelled' && (
                           <button className="btn btn-danger" onClick={() => handleCancelTrip(trip.Trip_ID)}>
                               Cancel Trip
                           </button>
                        )}
                        {/* --- END OF FIX --- */}

                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriverDashboard;