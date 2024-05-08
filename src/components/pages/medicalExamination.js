import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import url from "../../services/url";

function MedicalExamination() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [requestTest, setRequestTest] = useState("");

    const handleSaveRequestTest = async (e) => {
        e.preventDefault(); // Ngăn chặn trình duyệt reset trang mặc định sau khi gửi form

        try {
            const update = await api.put(`${url.RESULT.LIST}/${id}`, { requestTest });
            console.log(update);
            // Chuyển hướng người dùng trở lại trang trước sau khi lưu thành công
            navigate(`/appointment`);
        } catch (error) {
            console.error("Lỗi khi lưu yêu cầu khám bệnh:", error);
        }
    };
    return (
        <div className="col-md-7 col-lg-8 col-xl-9">
            <h2>Medical Examination</h2>
            <form onSubmit={handleSaveRequestTest}>
                <div>
                    <label style={{float:"left"}} htmlFor="requestTest">Medical Examination Reason:</label>
                    <textarea className="form-control" value={requestTest} onChange={(e) => setRequestTest(e.target.value)} />
                </div>
                <div className="row">
                                <div className="col-md-12 text-end">
                                    <div className="submit-section">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary submit-btn" 
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
            </form>
        </div>
    );
}

export default MedicalExamination;
