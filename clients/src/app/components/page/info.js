import React, { useState, useEffect } from 'react';
export default function Info({ data, time }) {
	return (<>
		<div className="card-body">
			<h4 className="card-title mb-0"><i className="enu-icon mdi mdi-label me-2"></i>{data.label}<small className="card-description" style={{ marginLeft: "5px" }}>
				{data.status ?
					<span className="bg-success">Available</span>
					:
					<span className="bg-danger">{data.error}</span>
				}
			</small></h4>
			<hr></hr>
			<div style={{ borderRadius: "50%" }}>
				<div className='d-flex justify-content-center'>
					<div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>Balance</div>
					<div className='p-2 flex-fill text-light text-end  '>{data.investment}</div>
				</div>
				<div className='d-flex justify-content-start'>
					<div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>IPO</div>
					<div className='p-2 flex-fill text-light text-end'>{data.ipo}</div>
				</div>
				<div className='d-flex justify-content-start'>
					<div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>Order</div>
					<div className='p-2 flex-fill text-light text-end'>{data.len}/{data.maxlen}</div>
				</div>
				<div className='d-flex justify-content-start'>
					<div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>Successful</div>
					<div className='p-2 flex-fill text-light text-end'>{data.takeorder}</div>
				</div>
				<div className='d-flex justify-content-start'>
					<div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>USDT</div>
					<div className='p-2 flex-fill text-light text-end'>{data.pnl}</div>
				</div>
				<div className='d-flex justify-content-start'>
					<div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>BTC</div>
					<div className='p-2 flex-fill text-light text-end'>{data.btc}</div>
				</div>
				<div className='d-flex justify-content-start'>
					<div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>BNB</div>
					<div className='p-2 flex-fill text-light text-end'>{data.bnb}</div>
				</div>
				<div className='d-flex justify-content-start'>
					<div className='p-2 w-25 text-light bg-secondary bg-opacity-50'>Alive</div>
					<div className='p-2 flex-fill text-light text-end'>{time}</div>
				</div>
			</div>
		</div>
	</>)
}