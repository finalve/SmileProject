import React from 'react';
import AuthService from "../../services/auth.service";
import { Modal, Button, Form, Alert } from 'react-bootstrap';
class Signin extends React.Component {
	constructor(props) {
		super(props);
		this.onChangeUsername = this.onChangeUsername.bind(this);
		this.onChangePassword = this.onChangePassword.bind(this);
		this.showModal = this.showModal.bind(this)
		this.hideModal = this.hideModal.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {
			username: '',
			password: '',
			modal: props.show,
			message: ''
		};
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
	showModal() {
		this.setState({ modal: true })
	}
	hideModal() {
		this.setState({ modal: false })
	}
	handleSubmit() {
		if(this.state.username==='' || this.state.password==='' ) {
			this.setState({
				loading: false,
				message: 'Please provide a valid Username or Password.'
			});
			return
		}
		
		AuthService.login(this.state).then((res) => {

			window.location.replace('/')
		},
			error => {
				const resMessage =
					(error.response &&
						error.response.data &&
						error.response.data.message) ||
					error.message ||
					error.toString();

				this.setState({
					loading: false,
					message: resMessage
				});
			}
		);
	};
	render() {
		return (
			<Modal show={this.state.modal} onHide={this.hideModal}  size="md" centered>
				<Modal.Header closeButton>
					<Modal.Title>Sign in</Modal.Title>
				</Modal.Header>
				<Modal.Body>
				<Form onSubmit={this.handleSubmit}>
						<Form.Group className="mb-3" controlId="formusername">
							<Form.Label>Username</Form.Label>
							<Form.Control type="text" placeholder="Enter Username" value={this.state.username} onChange={this.onChangeUsername} required />
							<Form.Control.Feedback type="invalid">
								Please provide a valid city.
							</Form.Control.Feedback>
						</Form.Group>
						<Form.Group className="mb-3" controlId="formpassword">
							<Form.Label>Password</Form.Label>
							<Form.Control type="password" placeholder="Enter Password" value={this.state.password} onChange={this.onChangePassword} required />
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
					<Button variant="primary" onClick={this.handleSubmit}>Sign In</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
export default Signin;