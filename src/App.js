import './App.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/layouts/header';
import BreadCrumb from './components/layouts/breadcrumb';
import Footer from './components/layouts/footer';
import Dashboard from './components/pages/dashboard';
import Appoinment from './components/pages/appointment';
import Widget from './components/layouts/widget';
import Test from './components/pages/test';
import Login from './components/auth/login';
import { useJwt } from 'react-jwt';
import Result from './components/pages/result';
import MedicalExamination from './components/pages/medicalExamination';

function App() {
  const location = useLocation();
  
  // Check if the current path is /login
  const isLoginPath = location.pathname === '/login';
  const ProtectedRoute = ({ element }) => {
    const token = localStorage.getItem("accessToken");
    const { isExpired, isInvalid } = useJwt(token);

    if (!token || isExpired || isInvalid) {
      window.alert('You have to login first')
        localStorage.removeItem("accessToken");
        return <Navigate to="/login" />;
    }

    return element;
};

const ProtectedLoginRoute = ({ element }) => {
    const token = localStorage.getItem("accessToken");
    const { isExpired, isInvalid } = useJwt(token);

    if (token && !isExpired && !isInvalid) {
        return <Navigate to="/" />;
    }

    return element;
};
  return (
    <div className="App">
      <div className="main-wrapper">
        <Header />
        
        {/* Conditionally render Breadcrumb */}
        {!isLoginPath && <BreadCrumb currentLocation={location.pathname} />}
        
        <div className="content">
          <div className="container">
            <div className="row">
              
              {/* Conditionally render Widget */}
              {!isLoginPath && <Widget />}
              
              <Routes>
                <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
                <Route path="/appointment" element={<ProtectedRoute element={ <Appoinment />} />} />
                <Route path="/test/:id" element={<ProtectedRoute element={<Test />}/>} />
                <Route path="/login" element={<ProtectedLoginRoute element={<Login />} />} />
                <Route path='/result/:id' element={<ProtectedRoute element={<Result/>}/>}/>
                <Route path='/medical-examination/:id' element={<ProtectedRoute element={<MedicalExamination/>}/>}/>
              </Routes>
              
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;
