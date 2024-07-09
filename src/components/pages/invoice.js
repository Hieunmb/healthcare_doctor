import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import api from '../../services/api';
import url from '../../services/url';

function Invoice() {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [doctorData, setDoctorData] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [tests, setTests] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState('');

    useEffect(() => {
        const fetchInvoiceData = async () => {
            try {
                const resultResponse = await api.get(`${url.RESULT.DETAIL}/${id}`);
                const invoice = resultResponse.data;
                setResult(invoice);

                const doctorResponse = await api.get(`${url.DOCTOR.LIST}/${invoice.doctor.id}`);
                setDoctorData(doctorResponse.data);

                const patientResponse = await api.get(`${url.PATIENT.REGISTER}/${invoice.booking.patientId}`);
                setPatientData(patientResponse.data);

                const testsResponse = await api.get(url.TEST.LIST);
                const filteredTests = testsResponse.data.filter(test => test.resultId == id);
                const devicesResponse = await api.get(url.DEVICE.LIST);
                const devices = devicesResponse.data;

                const updatedTests = filteredTests.map(test => {
                    const device = devices.find(device => device.id == test.deviceId);
                    return { ...test, device };
                });

                setTests(updatedTests);

                const medicinesResponse = await api.get(url.RESULTMEDICINE.CREATE);
                const filteredMedicines = medicinesResponse.data.filter(medicine => medicine.resultId == id);
                setMedicines(filteredMedicines);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchInvoiceData();
    }, [id]);

    const openModal = (image) => {
        setModalImage(image);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalImage('');
    };

    return (
        <div className="content">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8 offset-lg-2">
                        <div className="invoice-content">
                            <div className="invoice-item">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="invoice-logo">
                                            <img src="../assets/img/logo.png" alt="logo" />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="invoice-details">
                                            <strong>Order:</strong> #{result?.id} <br />
                                            <strong>Issued:</strong> {result?.booking?.date}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="invoice-item">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="invoice-info">
                                            <strong className="customer-text">Invoice From</strong>
                                            <p className="invoice-details invoice-details-two">
                                                {doctorData?.name} <br />
                                                {doctorData?.department?.name}<br />
                                                {doctorData?.phonenumber}<br />
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="invoice-info invoice-info2">
                                            <strong className="customer-text">Invoice To</strong>
                                            <p className="invoice-details">
                                                {patientData?.name} <br />
                                                {patientData?.address}, {patientData?.city} <br />
                                                {patientData?.phonenumber} <br />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="invoice-content">
                                    <h3 className="table-title">Tests</h3>
                                    <div className="table-responsive">
                                        <table className="invoice-table table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Test</th>
                                                    <th className="text-center">Result</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tests.map(test => (
                                                    <tr key={test.id}>
                                                        <td>{test.device?.name}</td>
                                                        <td className="text-center">
                                                            <img
                                                                src={test.thumbnail}
                                                                alt="Thumbnail"
                                                                width={'200px'}
                                                                className="img-thumbnail"
                                                                onClick={() => openModal(test.thumbnail)}
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="invoice-table-two table">
                                            <tbody>
                                                <tr>
                                                    <th>Subtotal:</th>
                                                    <td><span>${tests.reduce((total, test) => total + test.expense, 0)}</span></td>
                                                </tr>
                                                <tr>
                                                    <th>Total Amount:</th>
                                                    <td><span>${tests.reduce((total, test) => total + test.expense, 0)}</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="invoice-content">
                                    <h3 className="table-title">Medicines</h3>
                                    <div className="table-responsive">
                                        <table className="invoice-table table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Medicine</th>
                                                    <th className="text-center">Quantity</th>
                                                    <th className="text-center">Note</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {medicines.map(medicine => (
                                                    <tr key={medicine.id}>
                                                        <td>{medicine.medicine?.name}</td>
                                                        <td className="text-center">{medicine.quantity}</td>
                                                        <td className="text-center">{medicine.description}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="other-info">
                            <h4>Other information</h4>
                            <p className="text-muted mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sed dictum ligula, cursus blandit risus. Maecenas eget metus non tellus dignissim aliquam ut a ex. Maecenas sed vehicula dui, ac suscipit lacus. Sed finibus leo vitae lorem interdum, eu scelerisque tellus fermentum. Curabitur sit amet lacinia lorem. Nullam finibus pellentesque libero.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={closeModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Test Result</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <img src={modalImage} alt="Test Result" className="img-fluid" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Invoice;
