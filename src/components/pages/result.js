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
    const [showImageModal, setShowImageModal] = useState(false);
    const [showMedicineModal, setShowMedicineModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');
    const [canSave, setCanSave] = useState(false);

    const openImageModal = (imageSrc) => {
        setModalImageSrc(imageSrc);
        setShowImageModal(true);
    };

    const closeImageModal = () => {
        setShowImageModal(false);
    };

    const openMedicineModal = () => {
        setShowMedicineModal(true);
    };

    const closeMedicineModal = () => {
        setShowMedicineModal(false);
    };
    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

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
        const fetchResultAndTests = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                
                const resultResponse = await api.get(`${url.RESULT.DETAIL}/${id}`);
                setResult(resultResponse.data);
    
                const patientsResponse = await api.get(url.PATIENT.REGISTER);
                const foundPatient = patientsResponse.data.find(
                    patient => patient.id === resultResponse.data.booking.patientId
                );
                setPatient(foundPatient);
    
                const testsResponse = await api.get(url.TEST.LIST);
                const filteredTests = testsResponse.data.filter(test => test.resultId === id);
    
                const devicesResponse = await api.get(url.DEVICE.LIST);
                const devices = devicesResponse.data;
    
                const updatedTests = filteredTests.map(test => {
                    const device = devices.find(device => device.id === test.deviceId);
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
            const updateResponse = await api.put(`${url.RESULT.LIST}/${id}`, { id: result.id, expense: tests.reduce((total, test) => total + test.expense, 0), requestTest: result.requestTest, diagnoseEnd: newDiagnose });
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
        setShowMedicineModal(true);
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

    const removeItem = async (index, isNew) => {
        try {
            if (isNew) {
                const updatedMedicines = resultMedicinesNew.filter((_, i) => i !== index);
                setResultMedicinesNew(updatedMedicines);
            } else {
                const updatedMedicines = resultMedicines.filter((_, i) => i !== index);
                setResultMedicines(updatedMedicines);
            }
        } catch (error) {
            console.error("Error removing medicine:", error);
        }
    };
    const removeItemFromAPI = async (id) => {
        try {
            await api.delete(`${url.RESULTMEDICINE.DELETE}${id}`);
            const updatedMedicines = resultMedicines.filter(medicine => medicine.id !== id);
            setResultMedicines(updatedMedicines);
        } catch (error) {
            console.error("Error removing medicine:", error);
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
    
    
            if (doctor && doctor.role === "DOCTOR") {
                if (result.booking.status < 4) {
                  
                  // Send email notification
                  const emailData = {
                    to: patient.email,
                    subject: "You have your medical results",
                    message: `
                      <html>
          <body style="font-family: Arial, sans-serif; color: black;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #0e82fd; text-align: center;">Medical Results</h2>
            <p>Dear ${patient.name},</p>
            <p>You have received your medical results. Here are the details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4;">Date</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${result.booking.date}</td>
              </tr>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4;">Expense</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${tests.reduce((total, test) => total + test.expense, 0)}$</td>
              </tr>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4;">Last Diagnose</th>
                <td style="border: 1px solid #ddd; padding: 8px;">${newDiagnose}</td>
              </tr>
            </table>
            <p style="margin: 20px 0;">Thank you for using our service. Have a great day!</p>
            <p style="margin: 20px 0;">Best regards,</p>
            <p>Doccure</p>
            <img src="https://doccure.dreamstechnologies.com/html/template/assets/img/logo.png" alt="User Image" />
            <p>
            <a href="http://localhost:3000/view_invoice/${result.id}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #0e82fd; text-decoration: none; border-radius: 5px; text-align: center;">View Results</a>
            </p>
            </div>
            </body>
        </html>`
                  };
                  await api.put(`${url.BOOKING.UPDATE}${result.bookingId}`);
                  await api.post(url.EMAIL.SENT, emailData);
                }
              
                navigate('/appointment');
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
        setShowMedicineModal(false);
    };

    const getAvailableMedicines = () => {
        const existingMedicineIds = [
            ...resultMedicines.map(m => m.medicineId),
            ...resultMedicinesNew.map(m => m.medicineId)
        ];

        return medicines.filter(medicine => !existingMedicineIds.includes(medicine.id));
    };

    const medicineOptions = getAvailableMedicines().map(medicine => ({
        value: medicine.id,
        label: medicine.name
    }));
    return (
        <div className="col-md-7 col-lg-8 col-xl-9">
            {patient && (
                <div className="appointment-list col-6">
                    <div className="profile-info-widget">
                        <a href="" className="booking-doc-img">
                            <img src="../assets/img/patients/ava.jpg" alt="User Image"/>
                        </a>
                        <div className="profile-det-info">
                            <h3><a href="">{patient.name}</a></h3>
                            <div className="patient-details">
                                <h5><i className="fas fa-transgender"></i> {patient.gender}</h5>
                                <h5><i className="fas fa-map-marker-alt"></i>{patient.city}, {patient.address}</h5>
                                <h5 className="mb-0"><i className="fas fa-phone"></i>{patient.phonenumber}</h5>
                                <p><span>Age:</span> {calculateAge(patient.birthday)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
<div className="row">
            <div className="card col-6">
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
                                                onClick={() => openImageModal(test.thumbnail)}
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
                        <Modal show={showImageModal} onHide={closeImageModal} centered>
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
                <div className="card col-6">
                    <div className="card-header">
                        <h4 className="card-title mb-0">Prescribe Medicines</h4>
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
                                                <button
                                                    type="button"
                                                    className="btn bg-danger-light trash remove-btn"
                                                    onClick={() => removeItemFromAPI(rm.id)}
                                                >
                                                    <i className="far fa-trash-alt"></i>
                                                </button>
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
                            <button 
                            type="button" 
                            className="btn btn-primary btn-sm"
                            onClick={handleAddMedicine}
                        >
                            Add Medicine
                        </button>
                        </div>
                    </div>
                </div>
            )}
</div>
            <Modal show={showMedicineModal} onHide={closeMedicineModal} centered>
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
                    <Button variant="secondary" onClick={closeMedicineModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
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
