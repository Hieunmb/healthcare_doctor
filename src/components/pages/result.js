import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import url from "../../services/url";

function Result() {
    const { id } = useParams();
    const [tests, setTests] = useState([]);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await api.get(url.TEST.LIST);
                const filteredTests = response.data.filter(tests => tests.resultId == id);
                setTests(filteredTests);
            } catch (error) {
                console.error("Error fetching test list:", error);
            }
        };

        fetchTests();
    }, [id]);

    return (
        <div class="col-md-7 col-lg-8 col-xl-9">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title mb-0">Test Results</h4>
                </div>
                <div class="card-body">
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
