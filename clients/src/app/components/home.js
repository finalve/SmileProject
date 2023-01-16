import axios from 'axios';
import React, { useState, useEffect } from 'react';

const Home = () => {
	const [data, response] = useState();
	const [username, setUser] = useState(null);
	const fetchUsers = async () => {
		const res = await axios.get('http://171.6.138.115/api');
		response(res.data)
	}

	useEffect(() => {
		fetchUsers();
	}, []);
	return (
		<div>
			<div><br /></div>
			<div className='text-end'>
				refresh
			</div>
			<div className='row bg-secondary text-light bg-gradient rounded-top text-center'>
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
			<div><br /></div>
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
								<button type="button" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#exampleModalToggle"  onClick={() => setUser(user.username)}>
									Remove
								</button>
								<button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModalToggle"  onClick={() => setUser(user.username)}>
									View
								</button>
							</div>
						</div>
					)
					: <div className='text-center'><h1>Loading...</h1></div>
			}
			{ <Remove username={username} close={setUser} />}
		</div>
	)
}

const Remove = ({ username, close }) => {
	const [data, setData] = useState(
		{
			username: '',
			password: '',
		});
	const clean = () =>{
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
		if (data.username === username)
			{
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
			<div className="modal fade" id="exampleModalToggle" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabIndex="-1">
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
							<button type="button" className="btn btn-danger" onClick={post}>Confirm</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
// const FormRemove = ({ data }) => {
	const remove = (req) => {
		axios({
			method: 'post',
			url: 'http://171.6.138.115/api/delete',
			data: req
		}).then((res) =>
			console.log(res.data)
		)
	}
// 	return (<>
// 		<div className='popup'>
// 			<div className='Container popup-content'>
// 				<div className='box'>
// 					<span>User-Confirm</span>
// 					<input type='text' name='username' value={data.username} />
// 				</div>

// 				<div className='box'>
// 					<span>Password</span>
// 					<input type='password' name='password' value={data.password} />
// 				</div>
// 			</div>
// 		</div>
// 	</>)
// }
export default Home;