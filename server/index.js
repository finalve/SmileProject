function lot(price, size) {
	const decimalSize = size.toString().split('.')[1]?.length || 0;
	console.log(size.toString().split('.'))
	return Number(Math.floor(price / size) * size).toFixed(decimalSize);
}

console.log(lot('0.00094258','0.0000000001'))