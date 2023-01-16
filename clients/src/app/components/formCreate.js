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
		<div className='form'>
			<h1>Create Account</h1>
			<div className='input-group'>
				<span className='input-group-text'>Username</span>
				<input className='form-control' type='text' name='username' value={data.username} onChange={setInput} />
			</div>

			<div className='input-group'>
				<span className='input-group-text'>Password</span>
				<input className='form-control' type='password' name='password' value={data.password} onChange={setInput} />
			</div>

			<div className='input-group'>
				<span className='input-group-text'>API Key</span>
				<input className='form-control' type='text' name='apikey' value={data.apikey} onChange={setInput} />
			</div>

			<div className='input-group'>
				<span className='input-group-text'>API Serect</span>
				<input className='form-control' type='password' name='apiserect' value={data.apiserect} onChange={setInput} />
			</div>
			<div >
				<button className='my-btn' onClick={async () => {
					const response = await fetchData(data);
					if (response)
						console.log(response)
				}}>Create Account</button>
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
