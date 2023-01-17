import axios from 'axios';
import React, { useState } from 'react';
const CreateUser = () => {
	const [data, setData] = useState(
		{
			username: '',
			password: '',
			apikey: '',
			apiserect: ''
		});

	const setInput = (e) => {
		const { name, value } = e.target;
		setData((prev) => {
			return {
				...prev,
				[name]: value
			}
		})
	}

	return (<>
		<div className='row mt-5 d-flex justify-content-center'>
			<div className='col-md-4'>
			<h1 className='text-center mt-5 mb-5'>Create Account</h1>
			<div className='input-group input-group-sm mb-3'>
				<div className="input-group-prepend w-25">
					<span className="input-group-text w-100">User</span>
				</div>
				<input className='form-control form-control-sm' type='text' name='username' value={data.username} onChange={setInput} />
			</div>

			<div className='input-group input-group-sm mb-3'>
				<div className="input-group-prepend w-25">
					<span className="input-group-text w-100">PWD</span>
				</div>
				<input className='form-control form-control-sm' type='password' name='password' value={data.password} onChange={setInput} />
			</div>

			<div className='input-group input-group-sm mb-3'>
				<div className="input-group-prepend w-25">
					<span className="input-group-text w-100">Key</span>
				</div>
				<input className='form-control form-control-sm' type='text' name='apikey' value={data.apikey} onChange={setInput} />
			</div>

			<div className='input-group input-group-sm mb-3'>
				<div className="input-group-prepend w-25">
					<span className="input-group-text w-100">Serect</span>
				</div>
				<input className='form-control form-control-sm' type='password' name='apiserect' value={data.apiserect} onChange={setInput} />
			</div>
			<div className='d-flex justify-content-center mb-3'>
				<button className='btn btn-primary' onClick={async () => {
					const response = await fetchData(data);
					if (response)
						console.log(response)
				}}>Create Account</button>
			</div>
		</div>
		</div>
	</>)
}

const fetchData = async (data) => {
	try {
		const response = await axios({
			method: 'post',
			url: 'http://171.6.138.115/api/create',
			data: data
		}
		);
		return response.data
	} catch (error) {
		console.log(error.response.data)
	}
};

export default CreateUser;
