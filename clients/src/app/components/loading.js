export default function Loading() {
    return (<div className='d-flex justify-content-center align-items-center' style={{ height: "80%" }}>
        <div className="spinner-border me-3" role="status">
            <span className="sr-only"></span>
        </div>
        <span className="d-block">Loading ...</span>
    </div>)
}