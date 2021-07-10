import { last, zip } from 'lodash';

const resume = JSON.parse(localStorage.getItem('resume_playback')) || {};

export default class SavedPosition {
  constructor(segment) {
    this.streams = segment.streams;
    this.offsets = segment.offsets || [segment.abs_start];
  }

  set(t) {
    let match = null;
    t = Math.round(t);

    zip(this.streams, this.offsets).forEach(([stream, offset]) => {
      if (t >= offset) {
        match = { stream, offset };
      }

      delete resume[stream];
    });

    if (match) {
      const { stream, offset } = match;
      resume[stream] = t - offset;
      localStorage.setItem('resume_playback', JSON.stringify(resume));
    }
  }

  get() {
    return last(
      this.streams
        .map((id, i) => +resume[id] + this.offsets[i])
        .filter((x) => !Number.isNaN(x)),
    );
  }

  exists() {
    for (let i = 0; i < this.streams.length; i += 1) {
      if (resume[this.streams[i]]) {
        return true;
      }
    }

    return false;
  }
}
