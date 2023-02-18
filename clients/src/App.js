import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Form } from 'react-bootstrap';
import AuthService from "./app/services/auth.service";
import { Signin, Content, Signup, Dashboard } from './app/components';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
const userDefault = {
	showModeratorBoard: false,
	showAdminBoard: false,
	currentUser: undefined,
}
const logOut = (state) => {
	AuthService.logout();
	state(userDefault);
}

const App = () => {
	const [state, setState] = useState(userDefault);

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

	const { currentUser, showAdminBoard } = state;
	const navBar = currentUser ?
		(
			<>
				{
					showAdminBoard && (
						<Nav >
							<Button variant="primary" onClick={() => <Dashboard />} >Users</Button>
						</Nav>
					)
				}
				<Nav className="ms-auto">
					<Button variant="primary" onClick={() => logOut(setState)} >Sign Out</Button>
				</Nav>
			</>
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
			<Navbar.Brand><Button variant="primary" onClick={() => window.location.reload()}>Style-V</Button></Navbar.Brand>
			<Navbar.Toggle aria-controls="responsive-navbar-nav" />
			<Navbar.Collapse id="responsive-navbar-nav">{navBar}</Navbar.Collapse>
		</Navbar>
		<Container>
			{login &&
				(
					<Signin show={login} state={setState} />
				)}
			{signup &&
				(
					<Signup show={signup} state={setState} />
				)}
			{currentUser ?
				(
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<Content logOut={logOut} state={setState} />}>
								<Route index element={<Content logOut={logOut} state={setState} />} />
								<Route path="/dashboard" element={<Dashboard />} />
							</Route>
						</Routes>
					</BrowserRouter>
				)
				:
				(
					<div style={{ fontSize: "5vw" }} >
						Welcome To Project By Style-V
					</div>
				)
			}
		</Container>
	</div>
	)
}
export default App;
