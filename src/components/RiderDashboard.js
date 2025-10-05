import React, { useState, useEffect, useCallback } from 'react';
import { getAvailableTrips, getRiderBookings, createBooking, makePayment, cancelRiderBooking } from '../services/api';

const RiderDashboard = () => {
    const [trips, setTrips] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState({ source: '', destination: '' });

    const fetchAllData = useCallback(async () => {
        try {
            const [tripsRes, bookingsRes] = await Promise.all([
                getAvailableTrips(search),
                getRiderBookings()
            ]);
            setTrips(tripsRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error("Failed to fetch rider data", error);
        }
    }, [search]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleBooking = async (tripId, price) => {
        const seats = prompt("How many seats would you like to book?", "1");
        if (seats && !isNaN(seats)) {
            try {
                const res = await createBooking({ trip_id: tripId, seats_booked: parseInt(seats) });
                const { bookingId } = res.data;
                alert(`Booking pending! Please complete payment for booking ID ${bookingId}`);
                // Simulate payment
                if (window.confirm(`Confirm payment of $${price * parseInt(seats)} for booking ${bookingId}?`)) {
                    await makePayment({ booking_id: bookingId, amount: price * parseInt(seats) });
                    alert("Payment successful! Your booking is confirmed.");
                    fetchAllData();
                } else {
                    alert("Payment cancelled. Your booking will expire shortly.");
                }
            } catch (error) {
                alert(error.response?.data?.msg || "Booking failed.");
            }
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                await cancelRiderBooking(bookingId);
                alert("Booking cancelled successfully.");
                fetchAllData();
            } catch (error) {
                 alert(error.response?.data?.msg || "Failed to cancel booking.");
            }
        }
    };
    
    return (
        <div>
            <h2>Rider Dashboard</h2>

            <div className="card">
                <h3>Find a Ride</h3>
                <input placeholder="Source" onChange={e => setSearch({...search, source: e.target.value})} />
                <input placeholder="Destination" onChange={e => setSearch({...search, destination: e.target.value})} />
                {/* Search button is implicit - search happens on typing */}
            </div>

            <div className="card">
                <h3>Available Trips</h3>
                {trips.length > 0 ? trips.map(trip => (
                    <div key={trip.Trip_ID} className="trip-card">
                        <p><b>From:</b> {trip.Source} <b>To:</b> {trip.Destination}</p>
                        <p><b>Departs:</b> {new Date(trip.DepartureTime).toLocaleString()}</p>
                        <p><b>Seats Left:</b> {trip.AvailableSeats}</p>
                        <p><b>Price:</b> ${trip.PricePerSeat}</p>
                        <button className="btn" onClick={() => handleBooking(trip.Trip_ID, trip.PricePerSeat)}>Book Now</button>
                    </div>
                )) : <p>No trips match your search.</p>}
            </div>

            <div className="card">
                <h3>My Bookings</h3>
                {bookings.map(booking => (
                    <div key={booking.Booking_ID} className="booking-card">
                         <p><b>From:</b> {booking.Source} <b>To:</b> {booking.Destination}</p>
                         <p><b>Departs:</b> {new Date(booking.DepartureTime).toLocaleString()}</p>
                         <p><b>Seats:</b> {booking.SeatsBooked}</p>
                         <p><b>Status:</b> <span style={{fontWeight: 'bold', color: booking.Status === 'confirmed' ? 'green' : 'orange'}}>{booking.Status}</span></p>
                         {booking.Status !== 'cancelled' && (
                             <button className="btn btn-danger" onClick={() => handleCancelBooking(booking.Booking_ID)}>Cancel Booking</button>
                         )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiderDashboard;