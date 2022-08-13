
// don't even import prisma, just checking how much size plays a part.
module.exports = async (ctx, req) => {
	return {
		res: {
			status: 200,
			body: JSON.stringify({name: "HELLO WORLD"}),
			headers: {
				"content-type": "application/json"
			}
		},
	}
}