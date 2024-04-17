import logo from './logo.svg';
import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/layouts/header';
import BreadCrumb from './components/layouts/breadcrumb';
import Footer from './components/layouts/footer';
import Dashboard from './components/pages/dashboard';
import Appoinment from './components/pages/appointment';
import Widget from './components/layouts/widget';
import Test from './components/pages/test';

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
        <Route path='/test/:id' element={<Test/>}/>
      </Routes>
      </div>
      </div>
      </div>
      <Footer/>
        </div>
        
    </div>
  );
}

export default App;
