import { useState, useCallback } from "react";

/** Reusable controlled-input logic (custom hook). */
export function useForm(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e) => setValue(e.target.value), []);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return { value, setValue, handleChange, reset };
}
