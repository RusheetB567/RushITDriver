class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
function requireThat(condition, status, code, message) {
  if (!condition) throw new ApiError(status, code, message);
}
module.exports = { ApiError, requireThat };
