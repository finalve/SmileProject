export default function Tables({ data }) {
	return (<>
		<div className="main-panel">
			<div className="content-wrapper">

				{data.orderOpen.map((element, index) =>
				(
					<div className="row">
						<div className="col-12 grid-margin stretch-card">
							<div className="card">
								<div className="card-body">
									<div className='d-flex justify-content-center bg-secondary bg-opacity-50 border-bottom'>
										<div className='p-2 w-25  text-light'>Arbitrage</div>
										<div className='p-2 w-25  text-light text-center'>Status</div>
										<div className='p-2 w-25  text-light text-center'>Symbol</div>
										<div className='p-2 w-25  text-light text-center'>Profit</div>
									</div>

									<div className='d-flex justify-content-center  bg-opacity-50 border-bottom' key={index}>
										<div className='p-2 w-25  text-light text-start'>{element.data[1].symbol} {element.data[2].symbol} {element.data[3].symbol}</div>
										<div className='p-2 w-25  text-light text-center'>{element.response.status}</div>
										<div className='p-2 w-25  text-light text-center'>{element.response.symbol}</div>
										<div className='p-2 w-25  text-light text-center'>{element.data[0].result} %</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)
				)}
			</div>
		</div>

	</>)
}