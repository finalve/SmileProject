export default function Errors({ data }) {
	return (<>
		<div className="main-panel">
			<div className="content-wrapper">
				{data.length && data.error.map((element, index) =>
				(
					<div className="row" key={index}>
						<div className="col-12 grid-margin stretch-card">
								<div className="card">
									<div className="card-body">
										<div className='p-2 flex-fill bg-primary bg-opacity-75 border-bottom text-light'>Time :: {element.localtime} </div>
										<div className='d-flex justify-content-center bg-primary bg-opacity-75 border-bottom'>
											<div className='p-2 w-25  text-light'>Symbol</div>
											<div className='p-2 w-25  text-light text-center'>Price</div>
											<div className='p-2 w-25  text-light text-center'>Quantity</div>
										</div>
										<div className='d-flex justify-content-center bg-secondary bg-opacity-75'>
											<div className='p-2 w-25  text-light'>{element.symbol[0].symbol}</div>
											<div className='p-2 w-25  text-light text-center'>{element.symbol[0].price}</div>
											<div className='p-2 w-25  text-light text-center'> {element.symbol[0].quantity}</div>
										</div>
										<div className='d-flex justify-content-center bg-secondary bg-opacity-75'>
											<div className='p-2 w-25  text-light'>{element.symbol[1].symbol}</div>
											<div className='p-2 w-25  text-light text-center'>{element.symbol[1].price}</div>
											<div className='p-2 w-25  text-light text-center'> {element.symbol[1].quantity}</div>
										</div>
										<div className='d-flex justify-content-center bg-secondary bg-opacity-75 border-bottom '>
											<div className='p-2 w-25  text-light'>{element.symbol[2].symbol}</div>
											<div className='p-2 w-25  text-light text-center'>{element.symbol[2].price}</div>
											<div className='p-2 w-25  text-light text-center'> {element.symbol[2].quantity}</div>
										</div>
										<div className='d-flex justify-content-center bg-secondary bg-opacity-75 border-bottom '>
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