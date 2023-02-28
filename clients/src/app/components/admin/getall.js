import React, { useState, useEffect } from 'react';
import AuthService from "../../services/user.service";
const GetAll = ({servers}) => {
    const [isServer, setServer] = useState('server-1');
    const [users, setUsers] = useState();
    const submit = () => {
        let data;
        AuthService.admin_getAll({ server: isServer }).then(e => {
            data = e.data.data
            setUsers(data)
        }, error => console.log(error.response.data))
    }

    const remove = (index) => {
        const userlabel = users[index].label;
        AuthService.admin_remove({
            userlabel,
            server: isServer
        }).then(e=>{
            submit();
        },error =>console.log(error.response.data));
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
                                    {data.started ?
                                        <span className="bg-success">Available</span>
                                        :
                                        <span className="bg-danger">{data.errorMessage}</span>
                                    }
                                </small></h4>
                                <hr></hr>
                                <div className="form-group">
                                    <div style={{ borderRadius: "50%" }}>
                                        <div className='d-flex justify-content-center'>
                                            <div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>Balance</div>
                                            <div className='p-2 flex-fill text-light text-end  '>{data.Invesment}</div>
                                        </div>
                                        <div className='d-flex justify-content-start'>
                                            <div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>IPR</div>
                                            <div className='p-2 flex-fill text-light text-end'>{data.ipr}</div>
                                        </div>
                                        <div className='d-flex justify-content-start'>
                                            <div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>Order</div>
                                            <div className='p-2 flex-fill text-light text-end'>{data.openOrder.length}/{data.orderLength}</div>
                                        </div>
                                        <div className='d-flex justify-content-start'>
                                            <div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>USDT</div>
                                            <div className='p-2 flex-fill text-light text-end'>{data.pnl.toFixed(8)}</div>
                                        </div>
                                        <div className='d-flex justify-content-start'>
                                            <div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>BTC</div>
                                            <div className='p-2 flex-fill text-light text-end'>{data.btc.toFixed(8)}</div>
                                        </div>
                                        <div className='d-flex justify-content-start'>
                                            <div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>BNB</div>
                                            <div className='p-2 flex-fill text-light text-end'>{data.BNB.toFixed(8)}</div>
                                        </div>
                                        <div className='d-flex justify-content-start'>

                                        </div>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-end'>
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
                                        {servers&&servers.map((value,index)=>(<option key={index} value={value.name}>{value.name}</option>))}
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