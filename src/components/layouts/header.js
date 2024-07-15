import { useEffect, useState } from "react";
import { decodeToken, useJwt } from "react-jwt";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import url from "../../services/url";
function Header(){
    const [customerName, setCustomerName] = useState("");
    const { isExpired, isInvalid } = useJwt();
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            try {
                const response = await api.get(url.DOCTOR.PROFILE, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const customerName = response.data.name;
                setCustomerName(customerName);
            } catch (error) {
                console.error("Error fetching doctor profile:", error);
            }
        };
fetchDoctorProfile();
    }, [isExpired, isInvalid]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        setCustomerName("");
    };
    const accessTokenExists = !!localStorage.getItem("accessToken");
     // Get the current location
  const location = useLocation();
  // Check if the current path is '/'
  const isHomePage = location.pathname === '/';
    return(
        <header className="header header-custom header-fixed header-one">
            <div className="container">
                <nav className="navbar navbar-expand-lg header-nav">
                <div className="navbar-header">
                    <a id="mobile_btn" href="javascript:void(0);">
                    <span className="bar-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                    </a>
                    <a href="/" className="navbar-brand logo">
                    <img src="../assets/img/logo.png" className="img-fluid" alt="Logo"/>
                    </a>
                </div>
                <div className="main-menu-wrapper">
                    <div className="menu-header">
                    <a href="/" className="menu-logo">
                        <img src="../assets/img/logo.png" className="img-fluid" alt="Logo"/>
                    </a>
                    <a id="menu_close" className="menu-close" href="javascript:void(0);">
                        <i className="fas fa-times"></i>
                    </a>
                    </div>
                    <ul className="main-nav">
                    
                    {accessTokenExists ? (
                    <>
                        <li className="login-link">
                            <a href="login.html">Login / Signup</a>
                        </li>
                        <li className="register-btn">
                            <span className="btn log-btn">Welcome, {customerName}</span>
                        </li>
                        <li className="register-btn">
                        <a href="login" onClick={handleLogout} className="btn btn-danger"><i className="fa-solid fa-arrow-left"></i>Logout</a>
                        </li>
                    </>
                ) : (
                    <>
                        
                        <li className="register-btn">
                            <a href="register" className="btn reg-btn"><i className="feather-user"></i>Register</a>
                        </li>
                        <li className="register-btn">
                            <a href="login" className="btn btn-primary log-btn"><i className="feather-lock"></i>Login</a>
                        </li>
                    </>
                )}
                    </ul>
                </div>
                </nav>
            </div>
        </header>
    )
}
export default Header;