import React, { useState, useEffect } from 'react';
import AuthService from "./app/services/auth.service";
import { Signin, Signup, Content, Dashboard } from './app/components';
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

	return (
		<>
			{!currentUser ?
				(
					<>
						{signup ?
							< Signup show={signup} state={setState} stateLogin={setLogin} stateSignup={setSignup} />
							:
							<Signin show={login} state={setState} stateLogin={setLogin} stateSignup={setSignup} />
						}
					</>
				)
				:
				(
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<Content logOut={logOut} state={setState}/>}>
								<Route index element={<Content logOut={logOut} state={setState}/>} />
								<Route path="/dashboard" element={<Dashboard />} />
							</Route>
						</Routes>
					</BrowserRouter>
				)
			}
		</>
	);
}
export default App;
