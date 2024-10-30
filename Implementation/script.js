Module["onRuntimeInitialized"] = function () {
  console.log("WebAssembly module initialized");
  document.getElementById("executeButton").disabled = false;

  document
    .getElementById("fileInput")
    .addEventListener("change", function (event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        const csvData = e.target.result;
        const data = csvToArray(csvData);
        populateColumnSelector(data.headers); // Populate column selection
        populateGroupSelectors(data.headers); // Populate group selection for t-test
        document.getElementById("executeButton").onclick = function () {
          runOperation(data);
        };
      };

      reader.readAsText(file);
    });

  // Show or hide the group selectors for t-test based on selected operation
  document.getElementById("operation").addEventListener("change", function () {
    const operation = document.getElementById("operation").value;
    const groupSelection = document.getElementById("groupSelection");
    const columnSelect = document.getElementById("columnSelect");

    if (operation === "t-test") {
      groupSelection.style.display = "block";
      columnSelect.disabled = true; // Disable column selection for t-test
    } else {
      groupSelection.style.display = "none";
      columnSelect.disabled = false; // Enable column selection for mean/variance
    }
  });
};

// Helper function to parse CSV
function csvToArray(str, delimiter = ",") {
  const rows = str.split("\n");
  const headers = rows[0].split(delimiter);
  const data = rows
    .slice(1)
    .map((row) =>
      row.split(delimiter).map((val) => (isNaN(val) ? val : Number(val)))
    );
  return { headers, data };
}

// Function to populate column selector
function populateColumnSelector(headers) {
  const columnSelect = document.getElementById("columnSelect");
  columnSelect.innerHTML = "";
  headers.forEach((header, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = header;
    columnSelect.add(option);
  });
  columnSelect.disabled = false;
}

// Function to populate group selectors for t-test
function populateGroupSelectors(headers) {
  const group1Select = document.getElementById("group1Select");
  const group2Select = document.getElementById("group2Select");
  group1Select.innerHTML = "";
  group2Select.innerHTML = "";
  headers.forEach((header, index) => {
    const option1 = document.createElement("option");
    option1.value = index;
    option1.text = header;
    group1Select.add(option1);

    const option2 = document.createElement("option");
    option2.value = index;
    option2.text = header;
    group2Select.add(option2);
  });
  group1Select.disabled = false;
  group2Select.disabled = false;
}

// Function to run the selected operation
function runOperation(data) {
  const operation = document.getElementById("operation").value;
  const flattenedData = data.data;

  if (operation === "mean" || operation === "variance") {
    const columnIndex = document.getElementById("columnSelect").value;
    const columnData = flattenedData.map((row) => row[columnIndex]);

    const dataPointer = Module._malloc(columnData.length * 8);
    const dataView = new Float64Array(
      Module.HEAPF64.buffer,
      dataPointer,
      columnData.length
    );
    dataView.set(columnData);

    let result;
    if (operation === "mean") {
      result = Module._calculate_mean(dataPointer, columnData.length);
      document.getElementById("result").innerText = `Mean: ${result}`;
    } else if (operation === "variance") {
      result = Module._calculate_variance(dataPointer, columnData.length);
      document.getElementById("result").innerText = `Variance: ${result}`;
    }

    renderChart([`Column ${+columnIndex + 1}`], [result]); // Render chart
    Module._free(dataPointer); // Free WebAssembly memory
  } else if (operation === "t-test") {
    const group1Index = document.getElementById("group1Select").value;
    const group2Index = document.getElementById("group2Select").value;
    const group1Data = flattenedData.map((row) => row[group1Index]);
    const group2Data = flattenedData.map((row) => row[group2Index]);

    const group1Pointer = Module._malloc(group1Data.length * 8);
    const group2Pointer = Module._malloc(group2Data.length * 8);

    const group1View = new Float64Array(
      Module.HEAPF64.buffer,
      group1Pointer,
      group1Data.length
    );
    const group2View = new Float64Array(
      Module.HEAPF64.buffer,
      group2Pointer,
      group2Data.length
    );

    group1View.set(group1Data);
    group2View.set(group2Data);

    const t_statistic = Module._t_test(
      group1Pointer,
      group1Data.length,
      group2Pointer,
      group2Data.length
    );
    document.getElementById(
      "result"
    ).innerText = `T-test statistic: ${t_statistic}`;

    renderChart(
      [`Group 1: ${+group1Index + 1}`, `Group 2: ${+group2Index + 1}`],
      [t_statistic]
    );
    Module._free(group1Pointer);
    Module._free(group2Pointer);
  }
}

// Function to render ECharts graph
function renderChart(labels, values) {
  const chartDom = document.getElementById("chart");
  const myChart = echarts.init(chartDom);
  const option = {
    title: { text: "Statistical Results" },
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: values }],
  };
  myChart.setOption(option);
}
