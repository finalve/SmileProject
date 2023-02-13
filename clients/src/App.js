import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Form } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AuthService from "./app/services/auth.service";
import { Signin, Home, Signup, Dashboard } from './app/components';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle';
import './App.css';

const logOut = (state) => {
	AuthService.logout();
	state({
		showModeratorBoard: false,
		showAdminBoard: false,
		currentUser: undefined,
	});
}

const App = () => {
	const [state, setState] = useState({
		showModeratorBoard: false,
		showAdminBoard: false,
		currentUser: undefined,
	});

	const [login, setLogin] = useState(false);
	const [signup, setSignup] = useState(false);
	useEffect(() => {
		const user = AuthService.getCurrentUser();
		if (user) {
			setState({
				currentUser: user,
				showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
				showAdminBoard: user.roles.includes("ROLE_ADMIN"),
			});
		}
	}, [])

	const { currentUser } = state;
	const navBar = currentUser ?
		(
			<Nav className="ms-auto">
				<Button variant="primary" onClick={() => logOut(setState)} >Sign Out</Button>
			</Nav>
		)
		:
		(
			<Nav className="ms-auto">
				<Button variant="primary" onClick={() => setLogin(true)}>Sign in</Button>
				<Button variant="primary" onClick={() => setSignup(true)}>Sign up</Button>
			</Nav>
		);
	return (<div className='font-monospace'>
		<Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
			<Navbar.Brand><Button variant="primary" onClick={()=>window.location.reload()}>Style-V</Button></Navbar.Brand>
			<Navbar.Toggle aria-controls="responsive-navbar-nav" />
			<Navbar.Collapse id="responsive-navbar-nav">{navBar}</Navbar.Collapse>
		</Navbar>
		<Container>
			{login &&
				(
					<Signin show={login} state={setState} />
				)}
				{signup && (
					<Signup show={signup} state={setState} />
				)}
			{currentUser ?
				(
					<Home logOut={logOut} state={setState}/>
				)
				:
				(
					<Dashboard />
				)
			}
		</Container>
	</div>
	)
}
export default App;
