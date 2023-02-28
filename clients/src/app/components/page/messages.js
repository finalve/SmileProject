export default function Messages({ data }) {
	return (<>
		<div className="main-panel">
			<div className="content-wrapper">
				{data.success.map((element, index) =>
				(
					<div className="row">
						<div className="col-12 grid-margin stretch-card">
								<div className="card">
									<div className="card-body">
										<div className='p-2 flex-fill bg-secondary bg-opacity-50 border-bottom text-light'><span className="bg-success">Time :: {element.localtime} Arbitrage Success</span> </div>
										<div className='d-flex justify-content-center bg-secondary bg-opacity-50 border-bottom'>
											<div className='p-2 w-25  text-light'>Symbol</div>
											<div className='p-2 w-25  text-light '>Price</div>
											<div className='p-2 w-25  text-light '>Quantity</div>
										</div>
										<div className='d-flex justify-content-center'>
											<div className='p-2 w-25  text-light'>{element.symbol[0].symbol}</div>
											<div className='p-2 w-25  text-light '>{element.symbol[0].price}</div>
											<div className='p-2 w-25  text-light '> {element.symbol[0].quantity}</div>
										</div>
										<div className='d-flex justify-content-center'>
											<div className='p-2 w-25  text-light'>{element.symbol[1].symbol}</div>
											<div className='p-2 w-25  text-light '>{element.symbol[1].price}</div>
											<div className='p-2 w-25  text-light '> {element.symbol[1].quantity}</div>
										</div>
										<div className='d-flex justify-content-center border-bottom '>
											<div className='p-2 w-25  text-light'>{element.symbol[2].symbol}</div>
											<div className='p-2 w-25  text-light '>{element.symbol[2].price}</div>
											<div className='p-2 w-25  text-light '> {element.symbol[2].quantity}</div>
										</div>
										<div className='d-flex justify-content-center border-bottom bg-secondary bg-opacity-50'>
											<div className='p-2 w-25  text-light'>Invest</div>
											<div className='p-2 w-25  text-light text-center'>{element.invest}</div>
											<div className='p-2 w-25  text-light'>Profit</div>
											<div className='p-2 w-25  text-light text-center'>{element.profit}</div>
										</div>
									</div>
								</div>
							</div>
						
					</div>)
				)}
			</div>
		</div>
	</>)
}