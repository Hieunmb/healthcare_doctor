import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import url from "../../services/url";

function Result() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [tests, setTests] = useState([]);
    const [newDiagnose, setNewDiagnose] = useState("");
    const [patient, setPatient] = useState(null); // State to store the patient's data
    const [fileInputs, setFileInputs] = useState({}); // State to store file inputs
    const [medicines, setMedicines] = useState([]); // State to store the list of medicines
    const [resultMedicines, setResultMedicines] = useState([]); // State to store result medicine entries

    useEffect(() => {
        const fetchResultAndTests = async () => {
            try {
                // Fetch the result request test
                const resultResponse = await api.get(`${url.RESULT.DETAIL}/${id}`);
                setResult(resultResponse.data);

                // Fetch patient list and find the matching patient
                const patientsResponse = await api.get(url.PATIENT.REGISTER);
                const foundPatient = patientsResponse.data.find(
                    patient => patient.id == resultResponse.data.booking.patientId
                );
                setPatient(foundPatient);

                // Fetch the associated tests
                const testsResponse = await api.get(url.TEST.LIST);
                const filteredTests = testsResponse.data.filter(test => test.resultId == id);

                const devicesResponse = await api.get(url.DEVICE.LIST);
                const devices = devicesResponse.data;

                // Filter devices based on test.deviceId
                const updatedTests = filteredTests.map(test => {
                    const device = devices.find(device => device.id == test.deviceId);
                    return { ...test, device };
                });

                setTests(updatedTests);

                // Fetch medicines
                const medicinesResponse = await api.get(url.MEDICINE.LIST);
                setMedicines(medicinesResponse.data);
            } catch (error) {
                console.error("Error fetching result and test list:", error);
            }
        };

        fetchResultAndTests();
    }, [id]);

    const handleDiagnoseUpdate = async () => {
        try {
            const updateResponse = await api.put(`${url.RESULT.LIST}/${id}`, { id: result.id, expense: result.expense, requestTest: result.requestTest, diagnoseEnd: newDiagnose });
            // Assuming updateResponse contains updated result data
            setResult(updateResponse.data);
            // Navigate to appointment after saving
        } catch (error) {
            console.error("Error updating diagnose:", error);
        }
    };

    const handleFileChange = (e, testId) => {
        setFileInputs({
            ...fileInputs,
            [testId]: e.target.files[0],
        });
    };

    const handleAddMedicine = () => {
        setResultMedicines([
            ...resultMedicines,
            { medicineId: "", quantity: "", description: "" }
        ]);
    };

    const handleMedicineChange = (index, field, value) => {
        const updatedMedicines = [...resultMedicines];
        updatedMedicines[index][field] = value;
        setResultMedicines(updatedMedicines);
    };

    const removeItem = (index) => {
        const updatedMedicines = resultMedicines.filter((_, i) => i !== index);
        setResultMedicines(updatedMedicines);
    };

    const handleSave = async () => {
        try {
            await handleDiagnoseUpdate();

            for (const test of tests) {
                const file = fileInputs[test.id];
                const formData = new FormData();
                formData.append("diagnose", test.diagnose);
                formData.append("expense", test.expense);
                formData.append("resultId", test.resultId);
                formData.append("deviceId", test.deviceId);

                if (file) {
                    formData.append("thumbnail", file);
                } else if (test.thumbnail) {
                    formData.append("thumbnail", test.thumbnail);
                }

                await api.put(`${url.TEST.UPDATE}/${test.id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            for (const resultMedicine of resultMedicines) {
                await api.post(url.RESULTMEDICINE.CREATE, {
                    resultId: id,
                    medicineId: resultMedicine.medicineId,
                    quantity: resultMedicine.quantity,
                    description: resultMedicine.description
                });
            }
            console.log(resultMedicines)

            // Re-fetch tests after update to reflect changes
            const testsResponse = await api.get(url.TEST.LIST);
            const filteredTests = testsResponse.data.filter(test => test.resultId == id);
            setTests(filteredTests);

            // Navigate to appointment after saving
            navigate('/appointment');
        } catch (error) {
            console.error("Error updating tests or result medicines:", error);
        }
    };

    return (
        <div className="col-md-7 col-lg-8 col-xl-9">
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
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {result && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h4 className="card-title mb-0">Result Request Test</h4>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="biller-info">
                                    <span>Final Diagnose</span>
                                    <input 
                                        required
                                        value={newDiagnose} 
                                        onChange={(e) => setNewDiagnose(e.target.value)} 
                                        type="text" 
                                        className="form-control"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h4 className="card-title mb-0">Test Results</h4>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover table-center add-table-items">
                            <thead>
                                <tr>
                                    <th>Diagnose</th>
                                    <th>Expense</th>
                                    <th>Device</th>
                                    <th>Thumbnail Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tests.map((test, index) => (
                                    <tr key={index}>
                                        <td>{test.diagnose}</td>
                                        <td>{test.expense}</td>
                                        <td>{test.device.name} - ${test.device.expense}</td>
                                        <td>
                                            {test.thumbnail ? (
                                                <img src={test.thumbnail} alt="Thumbnail" className="img-thumbnail" />
                                            ) : (
                                                <input 
                                                    required
                                                    type="file" 
                                                    onChange={(e) => handleFileChange(e, test.id)} 
                                                    className="form-control"
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h4 className="card-title mb-0">Prescribe Medicines</h4>
                    <button 
                        type="button" 
                        className="btn btn-primary btn-sm"
                        onClick={handleAddMedicine}
                    >
                        Add Medicine
                    </button>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover table-center add-table-items">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Quantity</th>
                                    <th>Description</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultMedicines.map((rm, index) => (
                                    <tr key={index}>
                                        <td>
                                            <select
                                                required
                                                className="form-control"
                                                value={rm.medicineId}
                                                onChange={(e) => handleMedicineChange(index, 'medicineId', e.target.value)}
                                            >
                                                {medicines.map(med => (
                                                    <option key={med.id} value={med.id}>
                                                        {med.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input 
                                                required
                                                type="number"
                                                className="form-control"
                                                value={rm.quantity}
                                                onChange={(e) => handleMedicineChange(index, 'quantity', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                required
                                                type="text"
                                                className="form-control"
                                                value={rm.description}
                                                onChange={(e) => handleMedicineChange(index, 'description', e.target.value)}
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
                        <button 
                            type="button" 
                            className="btn btn-primary submit-btn" 
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Result;
