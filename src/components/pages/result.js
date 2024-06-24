import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import url from "../../services/url";
import { Modal, Button } from "react-bootstrap";
import Select from 'react-select';

function Result() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [result, setResult] = useState({});
    const [tests, setTests] = useState([]);
    const [newDiagnose, setNewDiagnose] = useState("");
    const [patient, setPatient] = useState(null);
    const [fileInputs, setFileInputs] = useState({});
    const [medicines, setMedicines] = useState([]);
    const [resultMedicines, setResultMedicines] = useState([]);
    const [resultMedicinesNew, setResultMedicinesNew] = useState([]);
    const [doctor, setDoctor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [canSave, setCanSave] = useState(false);


    const openModal = (imageSrc) => {
        setModalImageSrc(imageSrc);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        const fetchResultAndTests = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                
                const resultResponse = await api.get(`${url.RESULT.DETAIL}/${id}`);
                setResult(resultResponse.data);
    
                const patientsResponse = await api.get(url.PATIENT.REGISTER);
                const foundPatient = patientsResponse.data.find(
                    patient => patient.id == resultResponse.data.booking.patientId
                );
                setPatient(foundPatient);
    
                const testsResponse = await api.get(url.TEST.LIST);
                const filteredTests = testsResponse.data.filter(test => test.resultId == id);
    
                const devicesResponse = await api.get(url.DEVICE.LIST);
                const devices = devicesResponse.data;
    
                const updatedTests = filteredTests.map(test => {
                    const device = devices.find(device => device.id == test.deviceId);
                    return { ...test, device };
                });
    
                setTests(updatedTests);
    
                // Check if all tests have images initially
                const allTestsHaveImages = updatedTests.every(test => test.thumbnail);
                setCanSave(allTestsHaveImages);
    
                const medicinesResponse = await api.get(url.MEDICINE.LIST);
                setMedicines(medicinesResponse.data);
    
                const resultMedicinesResponse = await api.get(`${url.RESULTMEDICINE.DETAIL}${id}`);
                const existingResultMedicines = resultMedicinesResponse.data.map(medicine => ({ ...medicine, isNew: false }));
                setResultMedicines(existingResultMedicines);
    
                const doctorResponse = await api.get(url.DOCTOR.PROFILE, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setDoctor(doctorResponse.data);
            } catch (error) {
                console.error("Error fetching result and test list:", error);
            }
        };
    
        fetchResultAndTests();
    }, [id]);
    
    const handleDiagnoseUpdate = async () => {
        try {
            const updateResponse = await api.put(`${url.RESULT.LIST}/${id}`, { id: result.id, expense: result.expense, requestTest: result.requestTest, diagnoseEnd: newDiagnose });
            setResult(updateResponse.data);
        } catch (error) {
            console.error("Error updating diagnose:", error);
        }
    };

    const handleFileChange = (e, testId) => {
        setFileInputs({
            ...fileInputs,
            [testId]: e.target.files[0],
        });
        // Check if all tests have images
        const allTestsHaveImages = tests.every(test => fileInputs[test.id] || test.thumbnail || (test.id === testId && e.target.files[0]));
        setCanSave(allTestsHaveImages);
    };
    

    const handleAddMedicine = () => {
        setShowModal(true);
    };

    const handleMedicineChange = (index, field, value, isNew) => {
        if (isNew) {
            const updatedMedicines = [...resultMedicinesNew];
            updatedMedicines[index][field] = value;
            setResultMedicinesNew(updatedMedicines);
        } else {
            const updatedMedicines = [...resultMedicines];
            updatedMedicines[index][field] = value;
            setResultMedicines(updatedMedicines);
        }
    };

    const removeItem = (index, isNew) => {
        if (isNew) {
            const updatedMedicines = resultMedicinesNew.filter((_, i) => i !== index);
            setResultMedicinesNew(updatedMedicines);
        } else {
            const updatedMedicines = resultMedicines.filter((_, i) => i !== index);
            setResultMedicines(updatedMedicines);
        }
    };

    const handleSave = async () => {
        if (!canSave) return;
    
        try {
            if (doctor && doctor.role === "DOCTOR") {
                await handleDiagnoseUpdate();
            }
    
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
    
            if (doctor && doctor.role === "DOCTOR") {
                for (const resultMedicine of resultMedicinesNew) {
                    if (!resultMedicine.isNew) {
                        await api.post(`${url.RESULTMEDICINE.CREATE}`, resultMedicine);
                    }
                }
    
                for (const newMedicine of resultMedicinesNew) {
                    await api.post(url.RESULTMEDICINE.CREATE, {
                        resultId: id,
                        medicineId: newMedicine.medicineId,
                        quantity: newMedicine.quantity,
                        description: newMedicine.description,
                    });
                }
            }
    
            const testsResponse = await api.get(url.TEST.LIST);
            const filteredTests = testsResponse.data.filter(test => test.resultId == id);
            setTests(filteredTests);
    
            if (doctor && doctor.role === "DOCTOR") {
                await api.put(`${url.BOOKING.UPDATE}${result.bookingId}`);
                navigate('/invoice-view/' + id);
            } else if (doctor && doctor.role === "TESTDOCTOR") {
                window.location.reload();
            }
        } catch (error) {
            console.error("Error updating tests or result medicines:", error);
        }
    };
    

    const handleModalSelect = (selectedOption) => {
        setResultMedicinesNew([
            ...resultMedicinesNew,
            { medicineId: selectedOption.value, quantity: "", description: "", isNew: true }
        ]);
        setShowModal(false);
    };

    const medicineOptions = medicines.map(medicine => ({
        value: medicine.id,
        label: medicine.name
    }));

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
            {doctor && doctor.role === "DOCTOR" && result && (
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
                    <h4 className="card-title mb=0">Test Results</h4>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover table-center add-table-items">
                            <thead>
                                <tr>
                                    <th>Test Diagnose</th>
                                    <th>Thumbnail Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tests.map((test, index) => (
                                    <tr key={index}>
                                        <td>{test.device.name}</td>
                                        <td>
                                            {test.thumbnail ? (
                                                <img
                                                src={test.thumbnail}
                                                alt="Thumbnail"
                                                width={'200px'}
                                                className="img-thumbnail"
                                                onClick={() => openModal(test.thumbnail)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            ) : (
                                                doctor && (
                                                    doctor.role === "TESTDOCTOR" ? (
                                                        <input 
                                                            required
                                                            type="file" 
                                                            onChange={(e) => handleFileChange(e, test.id)} 
                                                            className="form-control"
                                                        />
                                                    ) : doctor.role === "DOCTOR" && (
                                                        <span>No result yet</span>
                                                    )
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Modal show={showModal} onHide={closeModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Enlarged Image</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <img src={modalImageSrc} alt="Enlarged Thumbnail" width={'1000px'} className="img-fluid" />
                            </Modal.Body>
                        </Modal>
                    </div>
                </div>
            </div>

            {doctor && doctor.role === "DOCTOR" && (
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
                                                    onChange={(e) => handleMedicineChange(index, 'medicineId', e.target.value, false)}
                                                    disabled={!rm.isNew}
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
                                                    onChange={(e) => handleMedicineChange(index, 'quantity', e.target.value, false)}
                                                    disabled={!rm.isNew}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    required
                                                    type="text"
                                                    className="form-control"
                                                    value={rm.description}
                                                    onChange={(e) => handleMedicineChange(index, 'description', e.target.value, false)}
                                                    disabled={!rm.isNew}
                                                />
                                            </td>
                                            <td>
                                                {rm.isNew && (
                                                    <button
                                                        type="button"
                                                        className="btn bg-danger-light trash remove-btn"
                                                        onClick={() => removeItem(index, false)}
                                                    >
                                                        <i className="far fa-trash-alt"></i>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {resultMedicinesNew.map((rm, index) => (
                                        <tr key={`new-${index}`}>
                                            <td>
                                                <select
                                                    required
                                                    className="form-control"
                                                    value={rm.medicineId}
                                                    onChange={(e) => handleMedicineChange(index, 'medicineId', e.target.value, true)}
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
                                                    onChange={(e) => handleMedicineChange(index, 'quantity', e.target.value, true)}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    required
                                                    type="text"
                                                    className="form-control"
                                                    value={rm.description}
                                                    onChange={(e) => handleMedicineChange(index, 'description', e.target.value, true)}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn bg-danger-light trash remove-btn"
                                                    onClick={() => removeItem(index, true)}
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

            <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Select Medicine</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Select 
                        options={medicineOptions}
                        onChange={handleModalSelect}
                        placeholder="Search for a medicine..."
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="row">
    <div className="col-md-12 text-end">
        <div className="submit-section">
            <button 
                type="button" 
                className={`btn submit-btn ${canSave ? "btn-primary" : "btn-secondary"}`} 
                onClick={handleSave}
                disabled={!canSave}
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
