import React from 'react';
import { useLocation } from 'react-router-dom';

function BreadCrumb({ currentLocation }){

    const location = useLocation();


    let breadcrumbName;

switch (true) {
    case currentLocation === '/':
        breadcrumbName = 'Dashboard';
        break;
    case currentLocation === '/appointment':
        breadcrumbName = 'Appointment';
        break;
    case currentLocation.startsWith('/result/'):
        breadcrumbName = 'Result';
        break;
    default:
        breadcrumbName = 'Unknown';
        break;
}
    return(
        <section>
                <div className="breadcrumb-bar-two">
                    <div className="container">
                        <div className="row align-items-center inner-banner">
                            <div className="col-md-12 col-12 text-center">
                                <h2 className="breadcrumb-title">{breadcrumbName}</h2>
                                <nav aria-label="breadcrumb" className="page-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><a href="index.html">Home</a></li>
                                        <li className="breadcrumb-item" aria-current="page">{breadcrumbName}</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
        </section>
    )
}

export default BreadCrumb;