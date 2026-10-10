const { requireThat } = require('./errors.cjs');
function fields(body, allowed) {
  requireThat(body && typeof body === 'object' && !Array.isArray(body), 400, 'INVALID_BODY', 'Provide a JSON object.');
  requireThat(Object.keys(body).every(k => allowed.includes(k)), 400, 'UNKNOWN_FIELD', 'The request contains an unsupported field.');
}
function text(value, name, max = 250, optional = false) {
  if (optional && (value === undefined || value === '')) return '';
  requireThat(typeof value === 'string' && value.trim().length > 0 && value.length <= max,
    400, 'INVALID_FIELD', `${name} must be nonempty text up to ${max} characters.`);
  return value.trim();
}
function number(value, name, min, max, integer = false) {
  requireThat(typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value)),
    400, 'INVALID_FIELD', `${name} is out of range.`);
  return value;
}
function enumValue(value, name, values) {
  requireThat(values.includes(value), 400, 'INVALID_FIELD', `${name} must be one of: ${values.join(', ')}.`);
  return value;
}
function location(value) {
  if (value === undefined || value === null) return null;
  fields(value, ['latitude','longitude','accuracy','sampledAt']);
  number(value.latitude, 'Latitude', -90, 90); number(value.longitude, 'Longitude', -180, 180);
  number(value.accuracy, 'Location accuracy', 0, 100000);
  const time = Date.parse(value.sampledAt);
  requireThat(Number.isFinite(time) && Math.abs(Date.now() - time) < 5 * 60 * 1000,
    400, 'STALE_LOCATION', 'Location must have been sampled within five minutes.');
  return value;
}
module.exports = { fields, text, number, enumValue, location };
