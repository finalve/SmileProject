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
			label:'',
			username: '',
			password: '',
			re_password:'',
			modal: props.show,
			message: ''
		};
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
		if (this.state.username === '' || this.state.password === '' ||  this.state.re_password === '' ) {
			this.setState({
				loading: false,
				message: 'Please provide a valid Username or Password.'
			});
			return
		}
		if(this.state.password !== this.state.re_password){
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
			<Modal show={this.state.modal} onHide={this.hideModal} size="md" centered onKeyPress={event => {
				if (event.key === 'Enter') {
					this.handleSubmit()
				}
			}}>
				<Modal.Header closeButton>
					<Modal.Title>Sign Up</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={this.handleSubmit}>
						<Form.Group className="mb-3" controlId="formlabelname">
							<Form.Label>Label</Form.Label>
							<Form.Control type="text" placeholder="Enter Label" value={this.state.label} onChange={this.onChangeLabel} required />
						</Form.Group>
						<Form.Group className="mb-3" controlId="formusername">
							<Form.Label>Username</Form.Label>
							<Form.Control type="text" placeholder="Enter Username" value={this.state.username} onChange={this.onChangeUsername} required />
							<Form.Control.Feedback type="invalid">
								Username For Login
							</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="mb-3" controlId="formpassword">
							<Form.Label>Password</Form.Label>
							<Form.Control type="password" placeholder="Enter Password" value={this.state.password} onChange={this.onChangePassword} required />
						</Form.Group>
						<Form.Group className="mb-3" controlId="formre-password">
							<Form.Label>Repeat-Password</Form.Label>
							<Form.Control type="password" placeholder="Enter Password" value={this.state.re_password} onChange={this.onChangeRe_Password} required />
						</Form.Group>
						{
							this.state.message &&
							(<Form.Group className='mb-3'>
								<Alert key="danger" variant="danger">
									{this.state.message}
								</Alert>
							</Form.Group>)
						}
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="primary"
						onClick={this.handleSubmit}>Sign Up</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
export default Signup;