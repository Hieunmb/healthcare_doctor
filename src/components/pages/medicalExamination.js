import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import url from '../../services/url';
import { useParams, useNavigate } from 'react-router-dom';

function MedicalExamination() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [requestTest, setRequestTest] = useState("");
    const [items, setItems] = useState([
        { diagnose: '', expense: '', doctorId: '', deviceId: "1", resultId: '' }
    ]);
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [doctor, setDoctor] = useState({ id: '' });
    const [devices, setDevices] = useState([]);
    const [deviceExpenses, setDeviceExpenses] = useState({});
    const [tempItemExpenses, setTempItemExpenses] = useState([]);

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
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const addItem = () => {
        setItems([...items, { diagnose: '', expense: '', doctorId: '', deviceId: '1', resultId: '' }]);
    }

    const removeItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    }

    const handleChange = (e, index) => {
        const { name, value } = e.target;
        const newItems = [...items];
        newItems[index][name] = value;
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
            navigate('/appointment');
        } catch (error) {
            console.error("Error saving data:", error);
            alert('Failed to save data. Please try again.');
        }
    };

    return (
        <div className="col-md-7 col-lg-8 col-xl-9">
            <h2>Medical Examination</h2>
            <form onSubmit={handleSaveAll}>
                <div>
                    <label style={{ float: "left" }} htmlFor="requestTest">Medical Examination Reason:</label>
                    <textarea className="form-control" value={requestTest} onChange={(e) => setRequestTest(e.target.value)} />
                </div>

                {/* Test items */}
                <div className="add-more-item text-end">
                    <a className="add-items" onClick={addItem}><i className="fas fa-plus-circle"></i> Add Item</a>
                </div>

                <div className="card card-table">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover table-center add-table-items">
                                <thead>
                                    <tr>
                                        <th>Diagnose</th>
                                        <th>Expense</th>
                                        <th>Device</th>
                                        <th className="custom-class"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="diagnose"
                                                    value={item.diagnose}
                                                    onChange={(e) => handleChange(e, index)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="expense"
                                                    value={item.expense}
                                                    onChange={(e) => handleChange(e, index)}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    className="form-control"
                                                    value={item.deviceId}
                                                    name='deviceId'
                                                    onChange={(e) => handleDeviceChange(e, index)}
                                                >
                                                    {devices.map(device => (
                                                        <option key={device.id} value={device.id}>{device.name} - ${device.expense}</option>
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
