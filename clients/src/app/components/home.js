import axios from 'axios';
import React, { useState, useEffect } from 'react';

const Home = () => {
	const [data, response] = useState();
	const [username, setUser] = useState({
		username: '',
		password: '',
	});
	const fetchUsers = async () => {
		const res = await axios({
			method: 'get',
			url: 'http://171.6.138.115/api',

		});

		response(res.data)
	}

	useEffect(() => {
		fetchUsers();
	}, []);
	return (
		<div>
			<div className='text-end mt-5'>
				<span className='navbar-refresh-icon'>X</span>
			</div>
			<div className='row bg-secondary text-light bg-gradient rounded-top text-center mb-3'>
				<div className='col'>
					<h2>Username</h2>
				</div>
				<div className='col'>
					<h2>Status</h2>
				</div>
				<div className='col'>
					<h2>Event</h2>
				</div>
			</div>
			{
				data ?
					data.map((user, index) =>
						<div className="row text-center" key={index}>
							<div className='col'>
								<p>{user.username}</p>
							</div>
							<div className='col'>
								{user.status ? <p className='text-success'>Running</p> : <p className='text-danger'>Error</p>}
							</div>
							<div className='col'>
								<button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#view" onClick={() => setUser(user)}>
									View
								</button>
							</div>
						</div>
					)
					: <div className='text-center'><h1>Loading...</h1></div>
			}
			{<View users={username} />}
		</div>
	)
}
const timeConvert = (time) => {
	// Get todays date and time
	var now = new Date().getTime();

	// Find the distance between now and the count down date
	let distance = now - time;

	// Time calculations for days, hours, minutes and seconds
	let days = Math.floor(distance / (1000 * 60 * 60)/24);
	let hours = Math.floor(distance / (1000 * 60 * 60));
	let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	let seconds = Math.floor((distance % (1000 * 60)) / 1000);

	if (days < 10) days = '0' + days;
	if (hours < 10) hours = '0' + hours;
	if (minutes < 10) minutes = '0' + minutes;
	if (seconds < 10) seconds = '0' + seconds;

	return `Day ${days} / ${hours}:${minutes}:${seconds} Hour`
}
const View = ({ users }) => {
	const [username, setUser] = useState(null);
	return (<div>
		<div className="modal fade" id="view" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header bg-secondary text-light">
						<h1 className="modal-title fs-5" id="exampleModalLabel">Property</h1>
						<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div className="modal-body">
						<div className='row align-middle' >
							<div className='col-4'>
								<h5>Username</h5>
							</div>
							<div className='col-8'>
							<span>{users.username}</span>	
							</div>
							
							<div className='col-4'>
								<h5>Invesment</h5>
							</div>
							<div className='col-8'>
							<span>{users.invesment} USDT</span>
							</div>

							<div className='col-4'>
								<h5>Process</h5>
							</div>
							<div className='col-8'>
							<span>{users.len}/{users.maxlen}</span>
							</div>

							<div className='col-4'>
								<h5>IPR</h5>
							</div>
							<div className='col-8'>
							<span>{users.ipr} USDT</span>
							</div>

							<div className='col-4'>
								<h5>Alive</h5>
							</div>
							<div className='col-8'>
							<span>{timeConvert(users.alive)}</span>
							</div>

							<div className='col-4'>
								<h4>PNL</h4>
							</div>
							<div className='col-8'>
							<span>{users.pnl}</span>
							</div>


						</div>
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
						<button type="button" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#remove" onClick={() => setUser(users.username)} >Remove</button>
					</div>
				</div>
			</div>
		</div>
		{<Remove username={username} close={setUser} />}
	</div>)
}
const Remove = ({ username, close }) => {
	const [data, setData] = useState(
		{
			username: '',
			password: '',
		});
	const clean = () => {
		setData({
			username: '',
			password: '',
		});
		close(null)
	}
	const setInput = (e) => {
		const { name, value } = e.target;
		setData((prev) => {
			return {
				...prev,
				[name]: value
			}
		})
	}
	const post = () => {
		if (data.username === username) {
			axios({
				method: 'post',
				url: 'http://171.6.138.115/api/delete',
				data: data
			}).then((res) =>
				console.log(res.data)
			)
		}
	}
	return (
		<div >
			<div className="modal fade" id="remove" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabIndex="-1">
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="exampleModalLabel">Confirm Remove</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={clean}></button>
						</div>
						<div className="modal-body">
							<div className="input-group mb-3">
								<div className="input-group-prepend w-25">
									<span className="input-group-text w-100">Username</span>
								</div>
								<input type="text" className="form-control" aria-label="Username" aria-describedby="basic-addon1" name='username' value={data.username} onChange={setInput} />
							</div>
							<div className="input-group mb-3">
								<div className="input-group-prepend w-25">
									<span className="input-group-text w-100">Password</span>
								</div>
								<input type="password" className="form-control" aria-label="Username" aria-describedby="basic-addon1" name='password' value={data.password} onChange={setInput} />
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={clean}>Close</button>
							<button type="button" className="btn btn-danger" onClick={post} data-bs-dismiss="modal">Confirm</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home;