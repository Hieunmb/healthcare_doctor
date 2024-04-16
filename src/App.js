import logo from './logo.svg';
import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/layouts/header';
import BreadCrumb from './components/layouts/breadcrumb';
import Footer from './components/layouts/footer';
import Dashboard from './components/pages/dashboard';
import Appoinment from './components/pages/appointment';
import Widget from './components/layouts/widget';

function App() {
  const location = useLocation();
  return (
    <div className="App">
      <div className="main-wrapper">
      <Header/>
      <BreadCrumb currentLocation={location.pathname} />
      <div className="content">
<div className="container">
<div className="row">
  <Widget/>
      <Routes>
        <Route  path="/" element={<Dashboard />}/>
        <Route path='/appointment' element={<Appoinment/>}/>
      </Routes>
      </div>
      </div>
      </div>
      <Footer/>
        </div>
        <div className="modal fade custom-modal" id="appt_details">
<div className="modal-dialog modal-dialog-centered">
<div className="modal-content">
<div className="modal-header">
<h5 className="modal-title">Appointment Details</h5>
<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
</button>
</div>
<div className="modal-body">
<ul className="info-details">
<li>
<div className="details-header">
<div className="row">
<div className="col-md-6">
<span className="title">#APT0001</span>
<span className="text">21 Oct 2023 10:00 AM</span>
</div>
<div className="col-md-6">
<div className="text-end">
<button type="button" className="btn bg-success-light btn-sm" id="topup_status">Completed</button>
</div>
</div>
</div>
</div>
</li>
<li>
<span className="title">Status:</span>
<span className="text">Completed</span>
</li>
<li>
<span className="title">Confirm Date:</span>
<span className="text">29 Jun 2023</span>
</li>
<li>
<span className="title">Paid Amount</span>
<span className="text">$450</span>
</li>
</ul>
</div>
</div>
</div>
</div>
    </div>
  );
}

export default App;
