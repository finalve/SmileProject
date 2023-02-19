import React, { useState, useEffect } from 'react';
export default function Info({ data,time }) {
	return (<>
		<h4 className="card-title mb-0"><i className="enu-icon mdi mdi-label me-2"></i>{data.label}<small className="card-description" style={{ marginLeft: "5px" }}>
			{data.status ?
				<span className="text-success">TRUE</span>
				:
				<span className="text-danger">{data.error}</span>
			}
		</small></h4>
		<hr></hr>
		<div style={{ borderRadius: "50%" }}>
			<div className='d-flex justify-content-start'>
				<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>Balance</div>
				<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.invesment}</div>
			</div>
			<div className='d-flex justify-content-start'>
				<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>IPR</div>
				<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.ipr}</div>
			</div>
			<div className='d-flex justify-content-start'>
				<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>Order</div>
				<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.len}/{data.maxlen}</div>
			</div>
			<div className='d-flex justify-content-start'>
				<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>USDT</div>
				<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.pnl}</div>
			</div>
			<div className='d-flex justify-content-start'>
				<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>BTC</div>
				<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.btc}</div>
			</div>
			<div className='d-flex justify-content-start'>
				<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>BNB</div>
				<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{data.bnb}</div>
			</div>
			<div className='d-flex justify-content-start'>
				<div className='p-2 w-25 bg-primary border-bottom bg-opacity-75 text-light'>Alive</div>
				<div className='p-2 flex-fill bg-secondary border-bottom bg-opacity-75 text-light text-end'>{time}</div>
			</div>
			
		</div>
	</>)
}