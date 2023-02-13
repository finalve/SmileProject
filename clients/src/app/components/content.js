import React, { useState, useEffect } from 'react';
import AuthService from "../services/user.service";
import { Button, Form, Modal } from 'react-bootstrap';

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
	const [loaded, Loading] = useState(false);
	const [timerUser, setUsertimer] = useState(false);
	const [timerAlive, setAlivetimer] = useState(false);
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
		AuthService.getUserBoard().then((res) => {
			response(res.data.data);
		}, error => {
			if (error.response.data?.status === 1022) {
				prop.logOut(prop.state);
			}
			console.log(error.response.data)

		})
		if(!timerUser){
			setUsertimer(true);
			setInterval(() => {
				AuthService.getUserBoard().then((res) => {
					response(res.data.data);
				}, error => {
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
	}, [loaded]);
	useEffect(() => {
		if (data) {
			if(!timerAlive)
			{
				setAlivetimer(true);
				setInterval(() => {
					setTime(timeConvert(data.alive))
				}, 1000);
			}
		}
	}, [data]);
	return (
		<div>
			{data ?
				(
					<div className='mt-5'>
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
							<div className='p-2 flex-fill text-end'><Button variant='primary' onClick={handleShow}>VIEW</Button></div>
							<div className='p-2 flex-fill text-start'><Button variant='danger' onClick={() => {
								AuthService.userDelete();
								response();
							}}>REMOVE</Button></div>
						</div>
						<div className='d-flex justify-content-center'>
							<div className='flex-fill bg-primary bg-opacity-75 border-bottom text-light'>Messages</div>
						</div>
						{data.success.reverse().map((element, index) =>
						(<div className='d-flex justify-content-center' key={index}>
							<div className='flex-fill bg-secondary bg-opacity-75 border-bottom text-light'>{element}</div>
						</div>)
						)}
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
				) :
				(
					<div className='mt-5'>
						<Form.Group className="mb-3" controlId="formKey">
							<Form.Label>API KEY</Form.Label>
							<Form.Control type="text" placeholder="Enter KEY" name='apikey' value={apiData.apikey} onChange={setInput} />
						</Form.Group>

						<Form.Group className="mb-3" controlId="formSerect">
							<Form.Label>API SERECT</Form.Label>
							<Form.Control type="password" placeholder="Enter Serect" name='apiserect' value={apiData.apiserect} onChange={setInput} />
							<Form.Text className="text-muted">
								Add IP Address to Binance API Management ** 171.6.140.125
							</Form.Text>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formInvest">
							<Form.Label>Invest Per Rate</Form.Label>
							<Form.Control type="number" name='invest' value={apiData.invest} onChange={setInput} />
							<Form.Text className="text-muted">
								Defalut = 11 USDT
							</Form.Text>
						</Form.Group>

						<Button variant="primary" type="submit" onClick={() => {
							submitAdd(apiData);
						}}>
							Submit
						</Button>
					</div>
				)
			}

		</div>
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