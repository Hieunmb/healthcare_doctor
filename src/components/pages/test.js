import React, { useEffect, useState } from 'react';
function Test(){
    const [items, setItems] = useState([
        { diagnose: '', amount: '' }
    ]);

    const addItem = () => {
        setItems([...items, { diagnose: '', amount: '' }]);
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
                                            <th>Amount</th>
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
                                                        type="text"
                                                        className="form-control"
                                                        name="amount"
                                                        value={item.amount}
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

<div class="row">
<div class="col-md-12 text-end">
<div class="signature-wrap">
<div class="signature">
Click here to sign
</div>
<div class="sign-name">
<p class="mb-0">( Dr. Darren Elder )</p>
<span class="text-muted">Signature</span>
</div>
</div>
</div>
</div>


<div class="row">
<div class="col-md-12">
<div class="submit-section">
<button type="submit" class="btn btn-primary submit-btn">Save</button>
<button type="reset" class="btn btn-secondary submit-btn">Clear</button>
</div>
</div>
</div>

</div>
</div>
</div>
    )
}
export default Test;