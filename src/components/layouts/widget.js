import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Widget() {
    const [activeLink, setActiveLink] = useState('/'); // Initial active link
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Update active link based on the current pathname
        const path = location.pathname.split('/')[1]; // Get first part of the pathname
        setActiveLink(path || 'Dashboard'); // Set active link or default to 'Dashboard'
    }, [location]);

    const handleNavigation = (path) => {
        setActiveLink(path);
        navigate(`/${path}`);
    };

    return (
        <div className="col-md-5 col-lg-4 col-xl-3 theiaStickySidebar">
            <div className="profile-sidebar">
                <div className="widget-profile pro-widget-content">
                    <div className="profile-info-widget">
                        <div className="booking-doc-img">
                            <img src="assets/img/doctors/anonymous-user.webp" alt="User Image" />
                        </div>
                        <div className="profile-det-info">
                            <h3>Dr. Darren Elder</h3>
                            <div className="patient-details">
                                <h5 className="mb-0">BDS, MDS - Oral & Maxillofacial Surgery</h5>
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
                            <li className={activeLink === 'doctor-profile-settings' ? 'active' : ''}>
                                <a onClick={() => handleNavigation('doctor-profile-settings')}>
                                    <i className="fas fa-user-cog"></i>
                                    <span>Profile Settings</span>
                                </a>
                            </li>
                            <li className={activeLink === 'doctor-change-password' ? 'active' : ''}>
                                <a onClick={() => handleNavigation('doctor-change-password')}>
                                    <i className="fas fa-lock"></i>
                                    <span>Change Password</span>
                                </a>
                            </li>
                            <li className={activeLink === 'login' ? 'active' : ''}>
                                <a onClick={() => handleNavigation('login')}>
                                    <i className="fas fa-sign-out-alt"></i>
                                    <span>Logout</span>
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
