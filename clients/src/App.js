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
	const [toggle, setToggle] = useState(true);
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
						{toggle ?
							<Signin state={setState} stateToggle={setToggle} />
							:
							< Signup state={setState} stateToggle={setToggle} />
						}
					</>
				)
				:
				(
					<Content logOut={logOut} state={setState} isAdmin={showAdminBoard}/>
				)
			}
		</>
	);
}
export default App;
