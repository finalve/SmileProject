export default function Tables({ data }) {
	return (<>

		<div className='d-flex justify-content-center bg-primary bg-opacity-75'>
			<div className='p-2 w-25 border text-light'>Arbitrage</div>
			<div className='p-2 w-25 border text-light text-center'>Status</div>
			<div className='p-2 w-25 border text-light text-center'>Symbol</div>
			<div className='p-2 w-25 border text-light text-center'>Profit</div>
		</div>
		{data.orderOpen.map((element, index) =>
		(<div className='d-flex justify-content-center bg-secondary bg-opacity-75' key={index}>
			<div className='p-2 w-25 border text-light text-start'>{element.data[1].symbol} {element.data[2].symbol} {element.data[3].symbol}</div>
			<div className='p-2 w-25 border text-light text-center'>{element.response.status}</div>
			<div className='p-2 w-25 border text-light text-center'>{element.response.symbol}</div>
			<div className='p-2 w-25 border text-light text-center'>{element.data[0].result} %</div>
		</div>)
		)}

	</>)
}