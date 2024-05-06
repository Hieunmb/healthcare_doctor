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

    useEffect(() => {
        const fetchResultAndTests = async () => {
            try {
                // Fetch the result request test
                const resultResponse = await api.get(url.RESULT.DETAIL + `/${id}`);
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

    const handleDiagnoseUpdate = async () => {
        try {
            const updateResponse = await api.put(url.RESULT.LIST+'/'+id, { id: result.id,expense:result.expense,requestTest:result.requestTest, diagnoseEnd: newDiagnose });
            // Assuming updateResponse contains updated result data
            setResult(updateResponse.data);
            navigate("/appointment");
        } catch (error) {
            console.error("Error updating diagnose:", error);
        }
    };
    console.log(tests)
    return (
        <div className="col-md-7 col-lg-8 col-xl-9">
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
                                        value={newDiagnose} 
                                        onChange={(e) => setNewDiagnose(e.target.value)} 
                                        type="text" 
                                        className="form-control"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12 text-end">
                                    <div className="submit-section">
                                        <button 
                                            type="button" 
                                            className="btn btn-primary submit-btn" 
                                            onClick={handleDiagnoseUpdate}
                                        >
                                            Save
                                        </button>
                                    </div>
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
