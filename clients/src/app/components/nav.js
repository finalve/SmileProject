const Navbar = ({ home, create }) => {
	return <>
		<nav className="nav">
			<ul>
				<li><p onClick={home}>Home</p></li>
				<li><p onClick={create}>Create</p></li>
			</ul>

		</nav>

	</>
}
export default Navbar;