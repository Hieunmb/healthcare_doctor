import React, { useState } from 'react';
import api from '../../services/api';
import url from '../../services/url';

function Test() {
    const [items, setItems] = useState([
        { diagnose: '', expense: '', doctorId: '', deviceId: '', resultId: '' }
    ]);

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

    const handleSubmit = async () => {
        try{
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await api.post(url.TEST.CREATE, item);
        }
        alert('Tests created successfully!');
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
                                            <th>Doctor ID</th>
                                            <th>Device ID</th>
                                            <th>Result ID</th>
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
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="doctorId"
                                                        value={item.doctorId}
                                                        onChange={(e) => handleChange(e, index)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="deviceId"
                                                        value={item.deviceId}
                                                        onChange={(e) => handleChange(e, index)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="resultId"
                                                        value={item.resultId}
                                                        onChange={(e) => handleChange(e, index)}
                                                    />
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
                                <button type="reset" className="btn btn-secondary submit-btn">Clear</button>
                            </div>
                        </div>
                    </div>


</div>
</div>
</div>
    )
}
export default Test;