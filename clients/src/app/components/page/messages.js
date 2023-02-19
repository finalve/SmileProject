export default function Messages({ data }) {
	return (<>
		<div className='d-flex justify-content-center'>
			<div className='flex-fill bg-primary bg-opacity-75 border-bottom text-light'>Messages</div>
		</div>
		{data.success.map((element, index) =>
		(<div className='d-flex justify-content-center' key={index}>
			<div className='flex-fill bg-secondary bg-opacity-75 border-bottom text-light'>{element}</div>
		</div>)
		)}
	</>)
}