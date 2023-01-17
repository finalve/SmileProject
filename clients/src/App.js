import React, { useState } from 'react';
import { Home, CreateUser } from './app/components';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css';

function App() {
	return (
		<Router>
			<nav className="navbar navbar-expand-sm navbar-dark bg-primary sticky-top">
				<div className="container-fluid">
					<Link className="navbar-brand" to='/'>Logo</Link>
					<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
						<span className="navbar-toggler-icon"></span>
					</button>
					<div className="collapse navbar-collapse" id="mynavbar">
						<ul className="navbar-nav me-auto">
							<li className="nav-item">
								<Link className="nav-link" to='/'>Dashboard</Link>
							</li>
							<li className="nav-item">
								<Link className="nav-link" to='/signup'>Sign up</Link>
							</li>
						</ul>
					</div>
				</div>
			</nav>
			<div className='container-fluid'>
				<div className="container">
					<Routes>
						<Route exact path="/" element={<Home />} />
						<Route path="/" element={<Home />} />
						<Route path="/signup" element={<CreateUser />} />
					</Routes>
				</div>
			</div>
		</Router>
	);
}

export default App;
