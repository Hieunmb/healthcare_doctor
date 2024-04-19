import { useEffect, useState } from "react";
import api from "../../services/api";
import url from "../../services/url";
import { useNavigate } from "react-router-dom";

function Appoinment() {
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [doctors,setDoctors]=useState({
        id:0,
        name:''
    });
    const [results, setResults] = useState([{}]);
    const [bookings, setBookings] = useState([]);
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data simultaneously
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
    const handleCreateTest = (bookingId) => {
        navigate(`/test/${bookingId}`);  // <-- Navigate to /test/:bookingId using navigate
    };
    return (
        <div className="col-md-7 col-lg-8 col-xl-9">
            <div className="appointments">
                {results.map((result, index) => {
                    // Find the matching booking for the result
                    const booking = bookings.find(booking => booking.id === result.bookingId);
                    
                    if (!booking) {
                        return null; // Skip this result if there's no matching booking
                    }

                    // Find the matching patient for the booking
                    const patient = patients.find(patient => patient.id === booking.patientId);

                    if (!patient) {
                        return null; // Skip this result if there's no matching patient
                    }

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
                                        <h5><i className="fas fa-map-marker-alt"></i> {patient.address}</h5>
                                        <h5><i className="fas fa-envelope"></i> {patient.email}</h5>
                                        <h5 className="mb-0"><i className="fas fa-phone"></i> {patient.phonenumber}</h5>
                                    </div>
                                </div>
                            </div>
                            <div className="appointment-action">
                                <a href="javascript:void(0);" className="btn btn-sm bg-success-light">
                                <i class="fa-regular fa-pen-to-square"></i> Result
                                </a>
                                <a href="" onClick={() => handleCreateTest(result.id)} className="btn btn-sm bg-info-light">
                                <i class="fa-solid fa-plus"></i> Create test
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
