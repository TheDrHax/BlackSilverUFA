import update from 'immutability-helper';

function updateState(obj, spec, callback) {
  obj.setState(update(obj.state, spec), callback);
}

export default updateState;
