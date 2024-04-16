import { useEffect, useState } from "react";
import api from "../../services/api";
import url from "../../services/url";

function Appoinment() {
    const [results, setResults] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await api.get(`${url.RESULT.LIST}?booking.status=3&doctorId=1`); // Updated API endpoint with query parameters
                const filteredResults = response.data.filter(result => result.doctorId === 1);
                setResults(filteredResults);
            } catch (error) {
                console.error("Error fetching results:", error);
            }
        };

        const fetchBookings = async () => {
            try {
                const response = await api.get(url.BOOKING.LIST); // Fetch all bookings
                setBookings(response.data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };
        const fetchPatients = async () => {
            try {
                const response = await api.get(url.PATIENT.REGISTER); // Assuming this is the correct endpoint
                setPatients(response.data);
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };

        fetchPatients();
        fetchResults();
        fetchBookings();
    }, []);
    return (
        <div className="col-md-7 col-lg-8 col-xl-9">
            <div className="appointments">
                {results.map((result, index) => {
                    // Find the matching booking for the result
                    const booking = bookings.find(booking => booking.id === result.bookingId);
                    const patient = patients.find(patient => patient.id === booking.patientId);

                    return (
                        <div className="appointment-list" key={index}>
                            <div className="profile-info-widget">
                                <a href="patient-profile.html" className="booking-doc-img">
                                    <img src="assets/img/patients/ava.jpg" alt="User Image" />
                                </a>
                                <div className="profile-det-info">
                                    <h3><a href="patient-profile.html">{patient.name}</a></h3>
                                    <div className="patient-details">
                                        <h5><i className="far fa-clock"></i> {booking.date}</h5>
                                        <h5><i className="fas fa-map-marker-alt"></i> {result.location}</h5>
                                        <h5><i className="fas fa-envelope"></i> {result.email}</h5>
                                        <h5 className="mb-0"><i className="fas fa-phone"></i> {result.phoneNumber}</h5>
                                    </div>
                                </div>
                            </div>
                            <div className="appointment-action">
                                <a href="#" className="btn btn-sm bg-info-light" data-bs-toggle="modal" data-bs-target="#appt_details">
                                    <i className="far fa-eye"></i> View
                                </a>
                                <a href="javascript:void(0);" className="btn btn-sm bg-success-light">
                                    <i className="fas fa-check"></i> Accept
                                </a>
                                <a href="javascript:void(0);" className="btn btn-sm bg-danger-light">
                                    <i className="fas fa-times"></i> Cancel
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Appoinment;
