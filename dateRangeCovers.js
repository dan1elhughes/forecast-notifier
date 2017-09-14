module.exports = dt => ({ start, end }) => {
	let c = new Date(end.getTime());
	c.setDate(c.getDate()+1);
	return dt >= start && dt < c;
};
