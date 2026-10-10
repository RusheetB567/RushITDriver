const transitions = Object.freeze({
  accept: ['ASSIGNED', 'ACCEPTED'],
  travel_pickup: ['ACCEPTED', 'EN_ROUTE_PICKUP'],
  arrive_pickup: ['EN_ROUTE_PICKUP', 'ARRIVED_PICKUP'],
  pickup: ['ARRIVED_PICKUP', 'PICKED_UP'],
  travel_delivery: ['PICKED_UP', 'EN_ROUTE_DELIVERY'],
  arrive_delivery: ['EN_ROUTE_DELIVERY', 'ARRIVED_DELIVERY'],
  fail: ['ARRIVED_DELIVERY', 'FAILED']
});
function nextState(state, action) {
  const transition = transitions[action];
  return transition && transition[0] === state ? transition[1] : null;
}
module.exports = { transitions, nextState };
