import React, { useState, useEffect } from 'react';
import AuthService from "../services/user.service";
import { Button, Modal } from 'react-bootstrap';
const submitAdd = (apiData) => {
	AuthService.userAdd(apiData).then((res) => {
		window.location.reload()
	}, error => {
		alert(error.response.data.message)
	})
}
const parseJwt = (token) => {
	try {
		return JSON.parse(atob(token.split('.')[1]));
	} catch (e) {
		return null;
	}
};
const Content = (prop) => {
	const [data, response] = useState();
	const [time, setTime] = useState(null);
	const [apiData, setData] = useState({
		apikey: '',
		apiserect: '',
		invest: 11
	});
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const [_error, setError] = useState(false);
	const [timerUser, setUsertimer] = useState(false);
	const [timerAlive, setAlivetimer] = useState(false);
	const [ipaddress, setIPaddress] = useState([]);

	const [page, setPage] = useState();

	const setInput = (e) => {
		const { name, value } = e.target;
		setData((prev) => {
			return {
				...prev,
				[name]: value
			}
		})
	}

	useEffect(() => {
		let userData;
		AuthService.getIPAddress().then((res) => {
			const ip = res.data.ip;
			const setAddress = new Set(ip);
			setIPaddress(Array.from(setAddress));
		}, error => {
			console.log(error.response.data)

		})
		AuthService.getUserBoard().then((res) => {
			userData = res.data.data;
			userData.success = userData.success.reverse();
			response(userData);
			setError(false);
		}, error => {
			if (error.response.data?.status === 1022) {
				prop.logOut(prop.state);
			}
			if (error.response.data?.status === 1021) {
				prop.logOut(prop.state);
			}
			setError(true);
			console.log(error.response.data)
			if (error.response.data?.status !== 400)
				alert(error.response.data?.message)

		})

		if (!timerUser) {
			setUsertimer(true);
			setInterval(() => {
				AuthService.getUserBoard().then((res) => {
					userData = res.data.data;
					userData.success = userData.success.reverse();
					response(userData);
				}, error => {
					if (error.response.data?.status === 1021) {
						prop.logOut(prop.state);
					}
					if (error.response.data?.status === 1022) {
						prop.logOut(prop.state);
					}
				})
				const user = JSON.parse(localStorage.getItem("user"));
				if (user) {
					const decodedJwt = parseJwt(user.accessToken);

					if (decodedJwt.exp * 1000 < Date.now()) {
						prop.logOut(prop.state);
					}
				}
			}, 10000);
		}
	}, []);
	useEffect(() => {
		if (data) {
			if (!timerAlive) {
				setAlivetimer(true);
				setInterval(() => {
					setTime(timeConvert(data.alive))
				}, 1000);
			}
		}
	}, [data]);
	return (
		<div className="container-scroller">
			<nav className="navbar default-layout col-lg-12 col-12 p-0 fixed-top d-flex align-items-top flex-row">
				<div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-start">
					<div className="me-3">
						<button className="navbar-toggler navbar-toggler align-self-center" type="button" data-bs-toggle="minimize">
							<span className="icon-menu"></span>
						</button>
					</div>
					<div>
						<a className="navbar-brand brand-logo" href="/">
							<img src="https://seeklogo.com/images/B/binance-usd-busd-logo-1439204E1C-seeklogo.com.png" alt="logo" />
						</a>
						<a className="navbar-brand brand-logo-mini" href="/">
							<img src="https://seeklogo.com/images/B/binance-usd-busd-logo-1439204E1C-seeklogo.com.png" alt="logo" />
						</a>
					</div>
				</div>
				<div className="navbar-menu-wrapper d-flex align-items-top">
					<ul className="navbar-nav ms-auto"></ul>
					<button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-bs-toggle="offcanvas">
						<span className="mdi mdi-menu"></span>
					</button>
				</div>
			</nav>
			<div className="container-fluid page-body-wrapper">
				<nav className="sidebar sidebar-offcanvas" id="sidebar">
					<ul className="nav">
						<li className="nav-item">
							<a className="active nav-link" href="/">
								<i className="mdi mdi-grid-large menu-icon"></i>
								<span className="menu-title">Dashboard</span>
							</a>
						</li>
						<li className="nav-item nav-category">Account</li>
						<li className="nav-item">
							<a className="nav-link" data-bs-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
								<i className="menu-icon mdi mdi-account-circle"></i>
								<span className="menu-title">Account</span>
								<i className="menu-arrow"></i>
							</a>
							<div className="collapse" id="ui-basic">
								<ul className="nav flex-column sub-menu">
									<li className="nav-item"> <a className="nav-link" href="#"><i className="menu-icon mdi mdi-account-card-details"></i>Info</a></li>
									<li className="nav-item" onClick={() => {
										prop.logOut(prop.state);
									}}> <a className="nav-link" href="#"><i className="menu-icon mdi mdi-logout"></i>Sign out</a></li>
								</ul>
							</div>
						</li>
						<li className="nav-item nav-category">Process</li>
						<li className="nav-item">
							<a className="nav-link" data-bs-toggle="collapse" href="#ui-process" aria-expanded="false" aria-controls="ui-basic">
								<i className="menu-icon mdi mdi-folder"></i>
								<span className="menu-title">Process</span>
								<i className="menu-arrow"></i>
							</a>
							<div className="collapse" id="ui-process">
								<ul className="nav flex-column sub-menu">
								<li className="nav-item"> <a className="nav-link" href="#"><i className="menu-icon mdi mdi-message-text"></i>Messages</a></li>
									<li className="nav-item" onClick={handleShow}> <a className="nav-link" href="#"><i className="menu-icon mdi mdi-library-books"></i>Tebles</a></li>
									<li className="nav-item" onClick={() => {
										AuthService.userDelete();
										response();
										setError(true);
									}}> <a className="nav-link" href="#"><i className="menu-icon mdi mdi-folder-remove"></i>Remove</a></li>
								</ul>
							</div>
						</li>
						<li className="nav-item nav-category">Contact</li>
						<li className="nav-item">
							<a className="nav-link" href="https://www.facebook.com/Veeangkub" target="_blank">
								<i className="menu-icon mdi mdi-facebook-box"></i>
								<span className="menu-title">Facebook</span>
							</a>
						</li>
					</ul>
				</nav>

				<div className="main-panel">
					<div className="content-wrapper">
						{
							data ? (
								<>
									<div className="row">
										<div className="col-md-12 grid-margin stretch-card">
											<div className="card">
												<div className="card-body">
													<h4 className="card-title mb-0"><i className="enu-icon mdi mdi-label me-2"></i>{data.label}<small className="card-description" style={{ marginLeft: "5px" }}>
														{data.status ?
															<span className="text-success">TRUE</span>
															:
															<span className="text-danger">{data.error}</span>
														}
													</small></h4>
													<hr></hr>
													<div style={{ borderRadius: "50%" }}>
														<div className='d-flex justify-content-start'>
															<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>Label</div>
															<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.label}</div>
														</div>
														<div className='d-flex justify-content-start'>
															<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>Status</div>
															{data.status ?
																<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-success text-end'>TRUE</div>
																: <div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-danger text-end'>{data.error}</div>
															}
														</div>
														<div className='d-flex justify-content-start'>
															<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>Balance</div>
															<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.invesment}</div>
														</div>
														<div className='d-flex justify-content-start'>
															<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>IPR</div>
															<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.ipr}</div>
														</div>
														<div className='d-flex justify-content-start'>
															<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>Order</div>
															<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.len}/{data.maxlen}</div>
														</div>
														<div className='d-flex justify-content-start'>
															<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>USDT</div>
															<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.pnl}</div>
														</div>
														<div className='d-flex justify-content-start'>
															<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>BTC</div>
															<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.btc}</div>
														</div>
														<div className='d-flex justify-content-start'>
															<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>Alive</div>
															<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{time}</div>
														</div>
														<div className='d-flex justify-content-center'>
															<div className='flex-fill bg-primary bg-opacity-75 border-bottom text-light'>Messages</div>
														</div>
														{data.success.map((element, index) =>
														(<div className='d-flex justify-content-center' key={index}>
															<div className='flex-fill bg-secondary bg-opacity-75 border-bottom text-light'>{element}</div>
														</div>)
														)}
													</div>
													<Modal
														show={show}
														onHide={handleClose}
														backdrop="static"
														keyboard={false}
														size="xl"
													>
														<Modal.Header closeButton>
															<Modal.Title>Arbitrage</Modal.Title>
														</Modal.Header>
														<Modal.Body>
															<div className='d-flex justify-content-center bg-primary bg-opacity-75'>
																<div className='p-2 w-25 border text-light'>Arbitrage</div>
																<div className='p-2 w-25 border text-light text-center'>Status</div>
																<div className='p-2 w-25 border text-light text-center'>Symbol</div>
																<div className='p-2 w-25 border text-light text-center'>Profit</div>
															</div>
															{data.orderOpen.map((element, index) =>
															(<div className='d-flex justify-content-center bg-secondary bg-opacity-75' key={index}>
																<div className='p-2 w-25 border text-light text-start'>{element.data[1].symbol} {element.data[2].symbol} {element.data[3].symbol}</div>
																<div className='p-2 w-25 border text-light text-center'>{element.response.status}</div>
																<div className='p-2 w-25 border text-light text-center'>{element.response.symbol}</div>
																<div className='p-2 w-25 border text-light text-center'>{element.data[0].result} %</div>
															</div>)
															)}
														</Modal.Body>
														<Modal.Footer>
															<Button variant="secondary" onClick={handleClose}>
																Close
															</Button>
														</Modal.Footer>
													</Modal>
												</div>
											</div>
										</div>
									</div>
								</>
							)
								: _error ?
									(
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
																		Add IP Address to Binance API Management ** <span className="text-warning">{ipaddress}</span></div>
																</div>
																<div className="form-group">
																	<label>Invest Per Rate</label>
																	<input type="text" className="form-control form-control-lg" name='invest' value={apiData.invest} onChange={setInput} placeholder="Invest Per Rate ( Default 11 USDT )" />
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
									)
									:
									(
										<div className='d-flex justify-content-center align-items-center' style={{ height: "80%" }}>
											<div className="spinner-border me-3" role="status">
												<span className="sr-only"></span>
											</div>
											<span className="d-block">Loading ...</span>
										</div>
									)
						}
					</div>
				</div>
			</div>
		</div >
	)
}
const timeConvert = (time) => {
	// Get todays date and time
	var now = new Date().getTime();

	// Find the distance between now and the count down date
	let distance = now - time;

	// Time calculations for days, hours, minutes and seconds
	let days = Math.floor(distance / (1000 * 60 * 60) / 24);
	let hours = Math.floor(distance / (1000 * 60 * 60));
	let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	let seconds = Math.floor((distance % (1000 * 60)) / 1000);

	if (days < 10) days = '0' + days;
	if (hours < 10) hours = '0' + hours;
	if (minutes < 10) minutes = '0' + minutes;
	if (seconds < 10) seconds = '0' + seconds;

	return `Day ${days} / ${hours}:${minutes}:${seconds} Hour`
}

export default Content;