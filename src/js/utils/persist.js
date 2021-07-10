import { merge } from 'lodash';
import shallowequal from 'shallowequal';

export default class Persist {
  static save(name, state, nextState, keys) {
    const nextData = {};
    const data = {};

    keys.forEach((key) => {
      nextData[key] = nextState[key];
      data[key] = state[key];
    });

    if (shallowequal(nextData, data)) {
      return;
    }

    localStorage.setItem(`state-${name}`, JSON.stringify(nextData));
  }

  static load(name, defaultValue = {}) {
    return merge(
      {},
      defaultValue,
      JSON.parse(localStorage.getItem(`state-${name}`)) || {},
    );
  }
}
