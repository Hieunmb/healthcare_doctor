import logo from './logo.svg';
import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/layouts/header';
import BreadCrumb from './components/layouts/breadcrumb';
import Footer from './components/layouts/footer';
import Dashboard from './components/pages/dashboard';

function App() {
  const location = useLocation();
  return (
    <div className="App">
      <div className="main-wrapper">
      <Header/>
      <BreadCrumb currentLocation={location.pathname} />
      <Routes>
        <Route  path="/" element={<Dashboard />}/>
      </Routes>
      <Footer/>
        </div>
    </div>
  );
}

export default App;
