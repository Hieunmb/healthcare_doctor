import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import url from "../../services/url";

function Appointment() {
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [doctors, setDoctors] = useState({
        id: 0,
        name: ''
    });
    const [results, setResults] = useState([{}]);
    const [bookings, setBookings] = useState([]);
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resultsResponse, bookingsResponse, patientsResponse] = await Promise.all([
                    api.get(url.RESULT.LIST),
                    api.get(url.BOOKING.LIST),
                    api.get(url.PATIENT.REGISTER)
                ]);

                const doctorResponse = await api.get(url.DOCTOR.PROFILE, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                const filteredResults = resultsResponse.data.filter(result => result.doctorId === doctorResponse.data.id);

                setResults(filteredResults);
                setBookings(bookingsResponse.data);
                setPatients(patientsResponse.data);
                setDoctors(doctorResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const navigate = useNavigate();

    const handleCreateTest = (resultId) => {
        navigate(`/test/${resultId}`);
    };

    const handleViewResult = (resultId) => {
        navigate(`/result/${resultId}`);
    };

    const handleViewInvoice = (resultId) => {
        navigate(`/invoice-view/${resultId}`);
    };

    return (
        <div className="col-md-7 col-lg-8 col-xl-9">
            <div className="appointments">
                {results.map((result, index) => {
                    const booking = bookings.find(booking => booking.id === result.bookingId);
    
                    if (!booking) {
                        return null;
                    }
    
                    const patient = patients.find(patient => patient.id === booking.patientId);
    
                    if (!patient) {
                        return null;
                    }
    
                    return (
                        <div className="appointment-list" key={index}>
                            <div className="profile-info-widget">
                                <a href="" className="booking-doc-img">
                                    <img src="assets/img/patients/ava.jpg" alt="User Image" />
                                </a>
                                <div className="profile-det-info">
                                <h5 type="button" class="btn btn-rounded btn-primary">#{result.id}</h5>
                                <h3>
                                    <a href="">
                                        {patient.name} - {result.diagnoseEnd ? result.diagnoseEnd : result.requestTest}
                                    </a>
                                </h3>

                                    <div className="patient-details">
                                        <h5><i className="far fa-clock"></i> {booking.date} - {booking.shift.time}</h5>
                                        <h5><i className="fas fa-map-marker-alt"></i> {patient.address}</h5>
                                        <h5><i className="fas fa-envelope"></i> {patient.email}</h5>
                                        <h5 className="mb-0"><i className="fas fa-phone"></i> {patient.phonenumber}</h5>
                                    </div>
                                </div>
                            </div>
                            <div className="appointment-action">
                                {booking.status >= 4 ? (
                                    <>
                                    <a href="" onClick={() => handleViewInvoice(result.id)} className="btn btn-sm bg-warning-light">
                                        <i className="fa-solid fa-file-invoice"></i> View Invoice
                                    </a>
                                    <a href="" onClick={() => handleViewResult(result.id)} className="btn btn-sm bg-success-light">
                                    <i className="fa-solid fa-pen"></i> Edit
                                </a>
                                </>
                                ) : (
                                    <>
                                        <a href="" onClick={() => handleViewResult(result.id)} className="btn btn-sm bg-success-light">
                                            <i className="fa-solid fa-eye"></i> View Result
                                        </a>
                                        <a href="" onClick={() => handleCreateTest(result.id)} className="btn btn-sm bg-info-light">
                                            <i className="fa-solid fa-plus"></i> Create test
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Appointment;
