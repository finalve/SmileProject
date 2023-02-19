import React from 'react';
import AuthService from "../../services/auth.service";
import { Modal, Button, Form, Alert } from 'react-bootstrap';
class Signup extends React.Component {
	constructor(props) {
		super(props);
		this.onChangeLabel = this.onChangeLabel.bind(this);
		this.onChangeUsername = this.onChangeUsername.bind(this);
		this.onChangePassword = this.onChangePassword.bind(this);
		this.onChangeRe_Password = this.onChangeRe_Password.bind(this);
		this.showModal = this.showModal.bind(this)
		this.hideModal = this.hideModal.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {
			label: '',
			username: '',
			password: '',
			re_password: '',
			modal: props.show,
			message: ''
		};
		this.stateLogin = props.stateLogin;
		this.stateSignup = props.stateSignup;
		this.navState = props.state;
	}
	onChangeLabel(e) {
		this.setState({
			label: e.target.value
		});
	}
	onChangeUsername(e) {
		this.setState({
			username: e.target.value
		});
	}

	onChangePassword(e) {
		this.setState({
			password: e.target.value
		});
	}
	onChangeRe_Password(e) {
		this.setState({
			re_password: e.target.value
		});
	}
	showModal() {
		this.setState({ modal: true })
	}
	hideModal() {
		window.location.replace('/')
		this.setState({ modal: false })
	}
	handleSubmit() {
		if (this.state.username === '' || this.state.password === '' || this.state.re_password === '') {
			this.setState({
				loading: false,
				message: 'Please provide a valid Username or Password.'
			});
			return
		}
		if (this.state.password !== this.state.re_password) {
			this.setState({
				loading: false,
				message: 'Invalid Password.'
			});
			return
		}
		AuthService.signup(this.state).then((res) => {
			const user = AuthService.getCurrentUser();
			if (user) {
				this.navState({
					currentUser: user,
					showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
					showAdminBoard: user.roles.includes("ROLE_ADMIN"),
				});
			}
			this.hideModal();
		},
			error => {
				const resMessage =
					(error.response &&
						error.response.data &&
						error.response.data.message) ||
					error.message ||
					error.toString()
				this.setState({
					loading: false,
					message: resMessage
				});
			}
		);
	};
	render() {
		return (
			<div className="container-scroller" onKeyDown={event => {
				if (event.key === 'Enter') {
					this.handleSubmit()
				}
			}}>
				<div className="container-fluid page-body-wrapper full-page-wrapper">
					<div className="content-wrapper d-flex align-items-center auth px-0">
						<div className="row w-100 mx-0">
							<div className="col-lg-4 mx-auto">
								<div className="card">
									<div className="card-body">
										<div className="auth-form-light text-left py-5 px-4 px-sm-5">
											{
												this.state.message && (
													<div className="alert alert-danger mb-4" role="alert">{this.state.message}</div>
												)
											}
											<div className="brand-logo text-center">
												<img src="https://seeklogo.com/images/B/binance-usd-busd-logo-1439204E1C-seeklogo.com.png" alt="logo" />
											</div>
											<h4>Hello! Welcome To Project ABT By Style-V</h4>
											<h6 className="fw-light">Sign up.</h6>
											<div className="pt-3">
												<div className="form-group">
													<input type="text" className="form-control form-control-lg" value={this.state.label} onChange={this.onChangeLabel} placeholder="Label" required />
												</div>
												<div className="form-group">
													<input type="text" className="form-control form-control-lg" value={this.state.username} onChange={this.onChangeUsername} placeholder="Username" required />
												</div>
												<div className="form-group">
													<input type="password" className="form-control form-control-lg" value={this.state.password} onChange={this.onChangePassword} placeholder="Password" required />
												</div>
												<div className="form-group">
													<input type="password" className="form-control form-control-lg" value={this.state.re_password} onChange={this.onChangeRe_Password} placeholder="Repeat-Password" required />
												</div>
												<div className="mt-3">
													<button className="btn btn-block btn-warning btn-lg font-weight-medium auth-form-btn w-100" onClick={this.handleSubmit}>SIGN UP</button>
												</div>
												<div className="text-center mt-4 fw-light">
													Have an account? <a href="#" className="text-warning" onClick={() => { this.stateLogin(true); this.stateSignup(false) }}>Signin</a>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
export default Signup;