import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import url from "../../services/url";

function Result() {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [tests, setTests] = useState([]);

    useEffect(() => {
        const fetchResultAndTests = async () => {
            try {
                // Fetch the result request test
                const resultResponse = await api.get(url.RESULT.LIST + `/`+id);
                setResult(resultResponse.data);

                // Fetch the associated tests
                const testsResponse = await api.get(url.TEST.LIST);
                const filteredTests = testsResponse.data.filter(test => test.resultId == id);
                setTests(filteredTests);
            } catch (error) {
                console.error("Error fetching result and test list:", error);
            }
        };

        fetchResultAndTests();
    }, [id]);
    console.log(result)

    return (
        <div className="col-md-7 col-lg-8 col-xl-9">
            {result && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h4 className="card-title mb-0">Result Request Test</h4>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="biller-info">
                                    <h4 className="d-block">{result.doctorName}</h4>
                                    <span className="d-block text-sm text-muted">{result.specialization}</span>
                                    <span className="d-block text-sm text-muted">{result.location}</span>
                                </div>
                            </div>
                            <div className="col-sm-6 text-sm-end">
                                <div className="billing-info">
                                    <h4 className="d-block">{result.date}</h4>
                                    <span className="d-block text-muted">Result ID: {result.id}</span>
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
                                </tr>
                            </thead>
                            <tbody>
                                {tests.map((test, index) => (
                                    <tr key={index}>
                                        <td>{test.diagnose}</td>
                                        <td>{test.expense}</td>
                                        <td>{test.deviceId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Result;
