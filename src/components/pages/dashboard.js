import { useEffect, useState } from "react";
import api from "../../services/api";
import url from "../../services/url";
function Dashboard(){
    const [bookings, setBookings] = useState([]);
    const [shifts, setShifts] = useState({});
    const [patient, setPatient] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [doctors,setDoctors]=useState([]);
    useEffect(() => {
        // Call your API to fetch booking data
        const fetchBookings = async () => {
            try {
                const response = await api.get(url.BOOKING.LIST); // Replace with your API endpoint
                const filteredBookings = response.data.filter(booking => booking.status === 2);
                setBookings(filteredBookings);
                const uniquePatientIds = [...new Set(filteredBookings.map(booking => booking.patientId))];
            
            // Fetch patient data based on unique patientIds
            const patientsResponse = await api.get(`${url.PATIENT.REGISTER}?ids=${uniquePatientIds.join(',')}`);
            setPatient(patientsResponse.data);
            const uniqueDepartmentIds = [...new Set(filteredBookings.map(booking => booking.departmentId))];
            
            // Fetch department data based on unique departmentIds
            const departmentsResponse = await api.get(`${url.DEPARTMENT.LIST}?ids=${uniqueDepartmentIds.join(',')}`);
            setDepartments(departmentsResponse.data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };

        const fetchShifts = async () => {
            try {
                const response = await api.get(url.SHIFT.LIST); // Replace with your API endpoint for shifts
                const shiftsData = {};
                response.data.forEach(shift => {
                    shiftsData[shift.id] = shift.time;
                });
                setShifts(shiftsData);
            } catch (error) {
                console.error("Error fetching shifts:", error);
            }
        };
        const fetchDoctorProfile = async () => {
            try {
                const response = await api.get(url.DOCTOR.PROFILE, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                setDoctors(response.data)
            } catch (error) {
                console.error("Error fetching doctor profile:", error);
            }
        };
fetchDoctorProfile();
        fetchBookings();
        fetchShifts();
    }, []);
    const handleAccept = async (bookingId) => {
        try {
            await api.put(`${url.BOOKING.UPDATE}${bookingId}`);
            await api.post(`${url.RESULT.CREATE}`, {
                bookingId: bookingId,
                doctorId: doctors.id
            });
            // Update bookings state or fetch updated data from the API
            const updatedBookings = bookings.map(booking => 
                booking.id === bookingId ? { ...booking, status: '2' } : booking
            );
            setBookings(updatedBookings);
            alert("Doctor has accepted the patient.");
            window.location.reload();
        } catch (error) {
            console.error("Error updating booking:", error);
        }
    };
    return(
   
<div className="col-md-7 col-lg-8 col-xl-9">
<div className="row">
<div className="col-md-12">
<h4 className="mb-4">Patient Appoinment</h4>
<div className="appointment-tab">

<ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded">
<li className="nav-item">
<a className="nav-link active" href="#upcoming-appointments" data-bs-toggle="tab">Today</a>
</li>
</ul>

<div className="tab-content">

<div className="tab-pane show active" id="upcoming-appointments">
<div className="card card-table mb-0">
<div className="card-body">
<div className="table-responsive">
<table className="table table-hover table-center mb-0">
<thead>
<tr>
<th>Patient Name</th>
<th>Appt Date</th>
<th>Patient Number</th>
<th>Departments</th>
<th>Gender</th>
<th>Action</th>
</tr>
</thead>
<tbody>
{bookings.map((booking, index) => (
                                        <tr key={index}>
                                            <td>
                                                <h2 className="table-avatar">
                                                    <a href="" className="avatar avatar-sm me-2">
                                                        <img className="avatar-img rounded-circle" src="assets/img/patients/ava.jpg" alt="User Image" />
                                                    </a>
                                                    <a href="">{patient.find(p => p.id === booking.patientId)?.name}</a>
                                                </h2>
                                            </td>
                                            <td>{booking.date}<span className="d-block text-info">{shifts[booking.shiftId]}</span></td>
                                            <td>{patient.find(p => p.id === booking.patientId)?.phonenumber}</td>
                                            <td>{departments.find(dept => dept.id === booking.departmentId)?.name}</td>
                                            <td>{patient.find(p => p.id === booking.patientId)?.gender}</td>
                                            <td>
                                                <div className="table-action">
                                                    
                                                    <a href="javascript:void(0);" className="btn btn-sm bg-success-light" onClick={() => handleAccept(booking.id)}>
                                                        <i className="fas fa-check"></i> Accept
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
</tbody>
</table>
</div>
</div>
</div>
</div>



</div>
</div>
</div>
</div>
</div>

    )
}
export default Dashboard;