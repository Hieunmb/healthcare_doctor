import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import url from '../../services/url';

function Widget() {
    const [activeLink, setActiveLink] = useState('/'); // Initial active link
    const navigate = useNavigate();
    const location = useLocation();
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [doctors,setDoctors]=useState([]);
    useEffect(() => {
        // Update active link based on the current pathname
        const path = location.pathname.split('/')[1]; // Get first part of the pathname
        setActiveLink(path || 'Dashboard'); // Set active link or default to 'Dashboard'
    }, [location]);

    const handleNavigation = (path) => {
        setActiveLink(path);
        navigate(`/${path}`);
    };
    useEffect(() => {
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
    }, []);

    return (
        <div className="col-md-5 col-lg-4 col-xl-3 theiaStickySidebar">
            <div className="profile-sidebar">
                <div className="widget-profile pro-widget-content">
                    <div className="profile-info-widget">
                        <div className="booking-doc-img">
                            <img src={doctors.thumbnail} alt="User Image" />
                        </div>
                        <div className="profile-det-info">
                            <h3>{doctors.name}</h3>
                            <div className="patient-details">
                                <h5 className="mb-0">{doctors.email}</h5>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="dashboard-widget">
                    <nav className="dashboard-menu">
                        <ul>
                            <li className={activeLink === '' ? 'active' : ''}>
                                <a onClick={() => handleNavigation('')}>
                                    <i className="fas fa-columns"></i>
                                    <span>Dashboard</span>
                                </a>
                            </li>
                            <li className={activeLink === 'appointment' ? 'active' : ''}>
                                <a onClick={() => handleNavigation('appointment')}>
                                    <i className="fas fa-calendar-check"></i>
                                    <span>Appointments</span>
                                </a>
                            </li>
                            <li className={activeLink === 'my-patients' ? 'active' : ''}>
                                <a onClick={() => handleNavigation('my-patients')}>
                                    <i className="fas fa-user-injured"></i>
                                    <span>My Patients</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default Widget;
