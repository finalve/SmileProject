import React, { useState, useEffect } from 'react';
import AuthService from "../../services/user.service";
const GetAll = ({ servers }) => {
    const [isServer, setServer] = useState(servers && servers[0].name);
    const [users, setUsers] = useState();
    const submit = () => {
        let data;
        AuthService.admin_getAll({ server: isServer }).then(e => {
            data = e.data.data
            setUsers(data)
        }, error => console.log(error.response.data))
    }

    const submitView = (userLabel) => {
        let data;
        AuthService.admin_view({ userlabel: userLabel }).then(e => {
            console.log(e.data)
        }, error => console.log(error.response.data))
    }

    const remove = (index) => {
        const userlabel = users[index].label;
        AuthService.admin_remove({
            userlabel,
            server: isServer
        }).then(e => {
            submit();
        }, error => console.log(error.response.data));
    }
    return (<>
        <div className="main-panel">
            <div className="content-wrapper">
                {users && (
                    <>
                        <h4 className="card-title mb-0"><i className="enu-icon mdi mdi-label me-2"></i>All Users<small className="card-description" style={{ marginLeft: "5px" }}>
                            <span > {isServer}</span>
                        </small></h4>
                        <hr></hr>
                    </>

                )}
                <div className="card">
                    {users ? (<div>
                        {users.map((data, index) => (
                             <div className="card-body" key={index} >
                             <h4 className="card-title mb-0"><i className="enu-icon mdi mdi-label me-2"></i>{data.label}<small className="card-description" style={{ marginLeft: "5px" }}>
                                 {data.statis ?
                                     <span className="bg-success">Available</span>
                                     :
                                     <span className="bg-danger">{data.error}</span>
                                 }
                             </small></h4>
                             <hr></hr>
                                <div className='d-flex justify-content-end'>
                                    <button type="submit" className="btn btn-warning me-2" onClick={() => submitView(data.label)}>VIEW</button>
                                    <button type="submit" className="btn btn-danger me-2" onClick={() => remove(index)}>Remove</button>
                                </div>

                            </div>
                        ))}

                    </div>) : (
                        <div>
                            <div className="card-body" onKeyDown={event => {
                                if (event.key === 'Enter') {
                                    submit()
                                }
                            }}>
                                <h4 className="card-title mb-0"><i className="menu-icon mdi mdi-lock me-2"></i>กรุณาเลือก Server ที่คุณต้องการตรวจสอบ !</h4>
                                <hr></hr>
                                <div className="form-group">
                                    <label>Server</label>
                                    <select className="form-select form-control-lg form-select-bg bg-dark" name='server' aria-label="Default select example" onChange={(e) => { setServer(e.target.value) }}>
                                        {servers && servers.map((value, index) => (<option key={index} value={value.name}>{value.name}</option>))}
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-warning me-2" onClick={submit}>Submit</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </>)
}

export default GetAll;