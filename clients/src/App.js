import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Form } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AuthService from "./app/services/auth.service";
import { Signin, Home, Signup } from './app/components';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle';
import './App.css';
class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showModeratorBoard: false,
			showAdminBoard: false,
			currentUser: undefined,
		};
	}
	componentDidMount() {
		const user = AuthService.getCurrentUser();

		if (user) {
			this.setState({
				currentUser: user,
				showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
				showAdminBoard: user.roles.includes("ROLE_ADMIN"),
			});
		}
		
	}

	logOut() {
		AuthService.logout();
		this.setState({
		  showModeratorBoard: false,
		  showAdminBoard: false,
		  currentUser: undefined,
		});
	}
	
	render() {
		const { currentUser } = this.state;
		const navsign = currentUser ? (
			<Nav className="ms-auto">
				<Link className="nav-link" to='/signin' onClick={this.logOut}>Sign Out</Link>
			</Nav>
		)
			:
			(
				<Nav className="ms-auto">
					<Link className="nav-link" to='/signin'>Sign in</Link>
					<Link className="nav-link" to='/signup'>Sign up</Link>
				</Nav>
			);


		return (
			<Router>
				<Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
					<Container>
						<Navbar.Brand><Link className="nav-link" to='/'>React-Bootstrap</Link></Navbar.Brand>
						<Navbar.Toggle aria-controls="responsive-navbar-nav" />
						<Navbar.Collapse id="responsive-navbar-nav">
							{navsign}
						</Navbar.Collapse>
					</Container>
				</Navbar>
				<Container>
					<Routes>
						<Route exact path="/" element={<Home />} />
						<Route path="/" element={<Home />} />
						{
							!currentUser ? (
								<>
									<Route path="/signin" element={<Signin show={true} />} />
									<Route path="/signup" element={<Signup show={true} />} />
								</>
							):(<>
								<Route path="/signout"element={<Signin show={true} />} />
							</>)
						}
					</Routes>
				</Container>
			</Router>
		);
	}
}
export default App;
