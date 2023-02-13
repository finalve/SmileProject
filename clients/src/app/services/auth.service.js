import axios from "axios";
import { config } from "../config";
import authHeader from './auth-header';
const API_URL = `http://${config.base}/api/`;
class AuthService {
	login({ username, password }) {
		return axios
			.post(API_URL + "signin", {
				username,
				password
			})
			.then(response => {
				if (response.data.accessToken) {
					localStorage.setItem("user", JSON.stringify(response.data));
				}

				return response.data;
			});
	}

	logout() {
		axios.delete(API_URL + "logout", { headers: authHeader() });
		localStorage.removeItem("user");
		window.location.reload();
	}

	signup({label,username, password,re_password}) {
		return axios.post(API_URL + "signup", {
			label,
			username,
			password
		}).then(response => {
			if (response.data.accessToken) {
				localStorage.setItem("user", JSON.stringify(response.data));
			}

			return response.data;
		});
	}

	getCurrentUser() {
		return JSON.parse(localStorage.getItem('user'));;
	}
}

export default new AuthService();