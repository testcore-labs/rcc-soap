console.debug = (debug: boolean = true, ...params) => {
  if(debug) console.log(...params);
}

export default console;