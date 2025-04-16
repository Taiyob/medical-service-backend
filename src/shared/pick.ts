const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> => {
  const finalObj: Partial<T> = {};

  for (const key of keys) {
    console.log("Key:", key);
    console.log("Has key?", Object.hasOwnProperty.call(obj, key));
    console.log("Value:", obj[key]);
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      console.log("Key:", key);
      console.log("Has key?", Object.hasOwnProperty.call(obj, key));
      console.log("Value:", obj[key]);
      finalObj[key] = obj[key];
    }
  }
  return finalObj;
};

export default pick;
