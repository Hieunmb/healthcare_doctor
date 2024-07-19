import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import url from '../../services/url';
import { useParams, useNavigate } from 'react-router-dom';

function MedicalExamination() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [requestTest, setRequestTest] = useState("");
    const [items, setItems] = useState([]); // Initialize with an empty array
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [doctor, setDoctor] = useState({ id: '' });
    const [devices, setDevices] = useState([]);
    const [deviceExpenses, setDeviceExpenses] = useState({});
    const [tempItemExpenses, setTempItemExpenses] = useState([]);
    const [patient, setPatient] = useState(null); // State to store the patient's data
    const [result, setResult] = useState({}); // State to store the result data

    const calculateAge = (birthday) => {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const doctorResponse = await api.get(url.DOCTOR.PROFILE, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                setDoctor(doctorResponse.data);

                const devicesResponse = await api.get(url.DEVICE.LIST);
                setDevices(devicesResponse.data);

                // Fetch result data
                const resultResponse = await api.get(`${url.RESULT.DETAIL}/${id}`);
                setResult(resultResponse.data);

                // Fetch patient list and find the matching patient
                const patientsResponse = await api.get(url.PATIENT.REGISTER);
                const foundPatient = patientsResponse.data.find(
                    patient => patient.id == resultResponse.data.booking.patientId
                );
                setPatient(foundPatient);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id, accessToken]);

    const addItem = () => {
        setItems([...items, { expense: '0', doctorId: '', deviceId: '1', resultId: '' }]);
    }

    const removeItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    }

    const handleDeviceChange = (e, index) => {
        const { value } = e.target;
        const newItems = [...items];
        newItems[index]['deviceId'] = value;
        
        const selectedDevice = devices.find(device => device.id == value);
        if (selectedDevice && selectedDevice.expense) {
            const updatedTempItemExpenses = [...tempItemExpenses];
            updatedTempItemExpenses[index] = selectedDevice.expense;
            setTempItemExpenses(updatedTempItemExpenses);
        } else {
            console.error("Selected device or device expense is undefined.");
        }
    }

    const handleSaveAll = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        try {
            await api.put(`${url.RESULT.LIST}/${id}`, { requestTest });
            
            const updatedItems = items.map((item, index) => ({
                ...item,
                resultId: id,
                doctorId: doctor.id,
                expense: (parseFloat(item.expense) + parseFloat(tempItemExpenses[index] || devices[0].expense)).toFixed(2)
            }));

            for (let i = 0; i < updatedItems.length; i++) {
                const item = updatedItems[i];
                await api.post(url.TEST.CREATE, item);
            }

            alert('Data saved successfully!');
            navigate(`/result/${id}`);
        } catch (error) {
            console.error("Error saving data:", error);
            alert('Failed to save data. Please try again.');
        }
    };

    return (
        <div className="col-md-7 col-lg-8 col-xl-9">
            <h2>Medical Examination</h2>
            {patient && (
            <div className="appointment-list">
                <div className="profile-info-widget">
                    <a href="patient-profile.html" className="booking-doc-img">
                        <img src="../assets/img/patients/ava.jpg" alt="User Image"/>
                    </a>
                    <div className="profile-det-info">
                        <h3><a href="patient-profile.html">{patient.name}</a></h3>
                        <div className="patient-details">
                            <h5><i className="fas fa-transgender"></i> {patient.gender}</h5>
                            <h5><i className="fas fa-map-marker-alt"></i>{patient.city}, {patient.address}</h5>
                            <h5><i className="fas fa-envelope"></i>{patient.email}</h5>
                            <h5 className="mb-0"><i className="fas fa-phone"></i>{patient.phonenumber}</h5>
                            <p><span>Age:</span> {calculateAge(patient.birthday)}</p>
                        </div>
                    </div>
                </div>
            </div>
            )}
            <form onSubmit={handleSaveAll}>
                <div>
                    <label style={{ float: "left" }} htmlFor="requestTest">Medical Examination Reason:</label>
                    <textarea className="form-control" required value={requestTest} onChange={(e) => setRequestTest(e.target.value)} />
                </div>

                {/* Test items */}
                <div className="add-more-item text-end">
                    <a className="add-items" onClick={addItem}><i className="fas fa-plus-circle"></i> Add Test</a>
                </div>

                {items.length > 0 && (
                <div className="card card-table">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover table-center add-table-items">
                                <thead>
                                    <tr>
                                        <th>TEST LIST</th>
                                        <th className="custom-class"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select
                                                    className="form-control"
                                                    value={item.deviceId}
                                                    name='deviceId'
                                                    onChange={(e) => handleDeviceChange(e, index)}
                                                >
                                                    {devices.map(device => (
                                                        <option key={device.id} value={device.id}>{device.name} </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn bg-danger-light trash remove-btn"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <i className="far fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                )}

                <div className="row">
                    <div className="col-md-12 text-end">
                        <div className="submit-section">
                            <button
                                type="submit"
                                className="btn btn-primary submit-btn"
                            >
                                Save All
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default MedicalExamination;
