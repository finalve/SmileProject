export default function Remove({remove,cancel}) {
	return (
		<div className="container-fluid page-body-wrapper full-page-wrapper">
			<div className="content-wrapper d-flex px-0">
				<div className="row w-100 mx-0">
					<div className="col-lg-4 mx-auto">
						<div className="card">
							<div className="card-body">
								<h4 className="text-center pt-5 pb-5">Hello! Comfirm Remove Worker ?</h4>
								<div className="vstack gap-2 col-md-5 mx-auto pb-5">
									<div className="">
										<button type="submit" className="btn btn-block btn-danger btn-lg font-weight-medium auth-form-btn w-100" onClick={remove}>Confirm</button>
									</div>
									<div className="">
										<button type="submit" className="btn btn-block btn-secondary btn-lg font-weight-medium auth-form-btn w-100" onClick={cancel}>Cancel</button>
									</div>
								</div>


							</div>
						</div>
					</div>
				</div>
			</div>

		</div>)
}