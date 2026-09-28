import React, { useState, useEffect } from "react";

export const IntervalCounter = () => {
  const [count, setCount] = useState(0);

  // INCORRECT IMPLEMENTATION (Demonstrating Stale Closure & Memory Leak)
  /*
  useEffect(() => {
    const id = setInterval(() => {
      // Stale closure: 'count' is locked at its initial value of 0 permanently
      setCount(count + 1);
    }, 1000);
    // Missing cleanup leads to memory leak if component unmounts
  }, []);
  */

  // CORRECT IMPLEMENTATION
  useEffect(() => {
    const id = setInterval(() => {
      // Functional updater avoids capturing the stale state variable
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    // Cleanup runs when the component unmounts
    return () => {
      clearInterval(id);
    };
  }, []); // Empty deps are safe because we use the functional update pattern

  return <p className="ticker">Real-time counter: {count}s</p>;
};
