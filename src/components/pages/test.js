import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import url from '../../services/url';
import { useNavigate, useParams } from 'react-router-dom';

function Test() {
    const { id } = useParams();
    const navigate= useNavigate();
    const [items, setItems] = useState([
        { diagnose: '', expense: '', doctorId: '', deviceId: '', resultId: '' }
    ]);
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [doctor, setDoctor] = useState({ id: '' });
    const [devices, setDevices] = useState([]);
    const [deviceExpenses, setDeviceExpenses] = useState({
    }); // State mới để lưu giá trị device.expense

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            try {
                const response = await api.get(url.DOCTOR.PROFILE, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                setDoctor(response.data);
            } catch (error) {
                console.error("Error fetching doctor profile:", error);
            }
        };

        const fetchDevices = async () => {
            try {
                const response = await api.get(url.DEVICE.LIST);
                setDevices(response.data);
            } catch (error) {
                console.error("Error fetching devices:", error);
            }
        };

        fetchDoctorProfile();
        fetchDevices();
    }, []);

    const addItem = () => {
        setItems([...items, { diagnose: '', expense: '', doctorId: '', deviceId: '', resultId: '' }]);
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

    const [tempItemExpenses, setTempItemExpenses] = useState([]); // State tạm thời để lưu giá trị mới của chi phí

    const handleDeviceChange = (e, index) => {
        const { value } = e.target;
        const newItems = [...items];
        newItems[index]['deviceId'] = value;
        
        // Lấy thông tin của thiết bị được chọn
        const selectedDevice = devices.find(device => device.id == value);
        if (selectedDevice && selectedDevice.expense) {
            // Lưu giá trị expense của thiết bị vào state tạm thời
            const updatedTempItemExpenses = [...tempItemExpenses];
            updatedTempItemExpenses[index] = selectedDevice.expense;
            setTempItemExpenses(updatedTempItemExpenses);
        } else {
            console.error("Selected device or device expense is undefined.");
        }
    }

    const handleSubmit = async () => {
        try {
            const updatedItems = items.map((item, index) => ({
                ...item,
                resultId: id,
                doctorId: doctor.id,
                expense: (parseFloat(item.expense) + parseFloat(tempItemExpenses[index] || 0)).toFixed(2) // Cập nhật giá trị expense dựa trên state tạm thời
            }));
            for (let i = 0; i < updatedItems.length; i++) {
                const item = updatedItems[i];
                await api.post(url.TEST.CREATE, item);
            }
            alert('Tests created successfully!');
            navigate('/result/' + id);

        } catch (error) {
            console.error("Error creating test:", error);
            alert('Failed to create test. Please try again.');
        }
    }
    
    return(
<div class="col-md-7 col-lg-8 col-xl-9">
<div class="card">
<div class="card-header">
<h4 class="card-title mb-0">Add Test</h4>
</div>
<div class="card-body">
<div class="row">
<div class="col-sm-6">
<div class="biller-info">
<h4 class="d-block">Dr. Darren Elder</h4>
<span class="d-block text-sm text-muted">Dentist</span>
<span class="d-block text-sm text-muted">Newyork, United States</span>
</div>
</div>
<div class="col-sm-6 text-sm-end">
<div class="billing-info">
<h4 class="d-block">1 November 2023</h4>
<span class="d-block text-muted">#INV0001</span>
</div>
</div>
</div>

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
                                <button type="button" className="btn btn-primary submit-btn" onClick={handleSubmit}>Save</button>
                            </div>
                        </div>
                    </div>


</div>
</div>
</div>
    )
}
export default Test;