export const dictIntersection = <T = Record<string, any>>(
  dictA: T,
  dictB: T
) => {
  // @ts-ignore
  const intersection: T = {};
  for (let k in dictB) {
    if (k in dictA) {
      intersection[k] = dictA[k];
    }
  }
  return intersection;
};

export const dictDifference = <T = Record<string, any>>(dictA: T, dictB: T) => {
  const diff = { ...dictA };
  for (let k in dictB) {
    delete diff[k];
  }
  return diff;
};

export const throttle = (callback: VoidFunction, limit: number) => {
  var wait = false; // Initially, we're not waiting
  return function () {
    // We return a throttled function
    if (!wait) {
      // If we're not waiting
      callback(); // Execute users function
      wait = true; // Prevent future invocations
      setTimeout(function () {
        // After a period of time
        wait = false; // And allow future invocations
      }, limit);
    }
  };
};
