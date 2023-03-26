/**
 * A uniform method of returning results
 * @param data
 * @param code
 * @param msg
 * @returns {{msg: *, code: *, data: *}}
 */
exports.sendResultResponse = (data, code, msg) => {
	const result = {
		"code": code,
		"msg": msg,
		"data": data
	}
	return result
}

