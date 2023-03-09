export default function AddWorker({ apiData, submitAdd, setInput, ipaddress, servers }) {
    return (
        <div className="row">
            <div className="col-12 grid-margin stretch-card">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body" onKeyDown={event => {
                            if (event.key === 'Enter') {
                                submitAdd(apiData)
                            }
                        }}>
                            <h4 className="card-title mb-0"><i className="menu-icon mdi mdi-lock me-2"></i>ไม่พบ API-KEY ของคุณ !<small className="card-description" style={{ marginLeft: "5px" }}>กรุณาเพิ่ม API-KEY Binance ก่อนใช้งาน</small></h4>
                            <hr></hr>
                            <div className="forms mt-3">
                                <div className="form-group">
                                    <label>API KEY</label>
                                    <input type="text" className="form-control form-control-lg" name='apikey' value={apiData.apikey} onChange={setInput} placeholder="API KEY" required />
                                </div>
                                <div className="form-group">
                                    <label>API SERECT</label>
                                    <input type="text" className="form-control form-control-lg" name='apiserect' value={apiData.apiserect} onChange={setInput} placeholder="API SERECT" required />
                                    <div className="alert alert-dark mb-4 mt-3" role="alert">
                                        <i className="mdi mdi-pin me-1"></i>
                                        กรุณา เพิ่ม Address Server ที่ ** <span className="text-warning">Binance API Management </span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Invest Per Order</label>
                                    <input type="number" className="form-control form-control-lg" name='invest' value={apiData.invest} onChange={setInput} placeholder="Invest Per Order ( Default 11 USDT )" />
                                </div>
                                <div className="form-group">
                                    <label>Server</label>
                                    <select className="form-select form-control-lg form-select-bg bg-dark" name='server' aria-label="Default select example" onChange={setInput}>
                                        {servers && (
                                            servers.map((server, index) => (<option value={server.name} key={index} >Server[ {server.name} ] Address[ {server.ip} ]</option>))
                                        )}
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-warning me-2" onClick={() => {
                                    submitAdd(apiData);
                                }}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}