import React from "react";
import { Modal, Button, Form } from 'react-bootstrap';
class Signup extends React.Component {
	constructor(props) {
		super(props);
		this.showModal = this.showModal.bind(this)
		this.hideModal = this.hideModal.bind(this);
		this.state = { modal: props.show };
	}
	showModal() {
		this.setState({ modal: true })
	}
	hideModal() {
		this.setState({ modal: false })
	}
	render() {

		return (
			<>
				<Modal show={this.state.modal} onHide={this.hideModal}  size="md" centered>
					<Modal.Header closeButton>
						<Modal.Title>Sign up</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form>
							<Form.Group className="mb-3" controlId="formapikey">
								<Form.Label>API-KEY</Form.Label>
								<Form.Control type="text" placeholder="Enter API-KEY" />
							</Form.Group>
							<Form.Group className="mb-3" controlId="formusername">
								<Form.Label>Username</Form.Label>
								<Form.Control type="text" placeholder="Enter Username" />
							</Form.Group>
							<Form.Group className="mb-3" controlId="formpassword">
								<Form.Label>Password</Form.Label>
								<Form.Control type="password" placeholder="Enter Password" />
							</Form.Group>
							<Form.Group className="mb-3" controlId="formrepeatpassword">
								<Form.Label>Repeat-Password</Form.Label>
								<Form.Control type="password" placeholder="Enter Repeat-Password" />
							</Form.Group>
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="primary" onClick={this.hideModal}>
							Sign up
						</Button>
					</Modal.Footer>
				</Modal>
			</>
		);
	}
}

export default Signup;