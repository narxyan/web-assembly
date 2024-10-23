// Emscripten provides the 'Module' object that wraps the WebAssembly instance
Module["onRuntimeInitialized"] = function () {
  console.log("WebAssembly module loaded");

  // Enable the execute button only after the module is loaded
  document.getElementById("executeButton").disabled = false;

  // Parse CSV file
  document
    .getElementById("fileInput")
    .addEventListener("change", function (event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        const text = e.target.result;
        const data = csvToArray(text); // Convert CSV text to array
        console.log("Data from CSV: ", data);
        document.getElementById("executeButton").onclick = function () {
          runOperation(data);
        };
      };

      reader.readAsText(file);
    });
};

// Convert CSV text to array
function csvToArray(str, delimiter = ",") {
  const rows = str.split("\n");
  return rows.map((row) => row.split(delimiter).map(Number)); // Convert each value to number
}

// Function to run the selected operation
function runOperation(data) {
  const operation = document.getElementById("operation").value;

  // Flatten the 2D array (just in case)
  const flattenedData = data.flat();

  // Allocate memory in WebAssembly for the dataset
  const dataPointer = Module._malloc(flattenedData.length * 8); // Allocate memory (64-bit = 8 bytes per number)

  // Access WebAssembly memory as a Float64Array
  const dataView = new Float64Array(
    Module.HEAPF64.buffer,
    dataPointer,
    flattenedData.length
  );

  // Copy the data from JavaScript to WebAssembly memory
  dataView.set(flattenedData); // Copy the data into the WebAssembly memory

  let result;
  if (operation === "mean") {
    result = Module._calculate_mean(dataPointer, flattenedData.length); // Call calculate_mean
  } else if (operation === "variance") {
    result = Module._calculate_variance(dataPointer, flattenedData.length); // Call calculate_variance
  }

  // Display the result in the HTML
  document.getElementById("result").innerText = result;

  // Free the allocated memory in WebAssembly
  Module._free(dataPointer);
}
