async function loadWasm() {
  // Fetch the WebAssembly file
  const response = await fetch("hello.wasm");
  const buffer = await response.arrayBuffer();

  // Provide the imports object with common imports
  const imports = {
    env: {
      memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }), // Example memory import
      table: new WebAssembly.Table({ initial: 0, element: "anyfunc" }), // Table import for function calls
      __memory_base: 0, // Emscripten typically uses this for memory base
      __table_base: 0, // Emscripten typically uses this for table base
      abort: () => console.log("Abort called"), // Optional abort function
    },
  };

  // Compile and instantiate the WebAssembly module with the imports object
  const wasmModule = await WebAssembly.instantiate(buffer, imports);
  const { add } = wasmModule.instance.exports; // Get the 'add' function from exports

  // Set up the button click event listener
  document.getElementById("addBtn").addEventListener("click", () => {
    // Get the input values from the form
    const num1 = parseInt(document.getElementById("num1").value);
    const num2 = parseInt(document.getElementById("num2").value);

    // Call the WebAssembly 'add' function and display the result
    const result = add(num1, num2);
    document.getElementById("result").textContent = result;
  });
}

// Load the WebAssembly module when the page loads
loadWasm();
