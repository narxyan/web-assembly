Module["onRuntimeInitialized"] = function () {
  console.log("WebAssembly module initialized");
  document.getElementById("executeButton").disabled = false;
  // Redirect WASM printf to the JavaScript console
  Module["print"] = function (text) {
    console.log(text); // This will log the output to the browser console
  };
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
    const groupSelection = document.getElementById("groupSelection");
    groupSelection.style.display = "block";
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
  const columnSelect1 = document.getElementById("group1Select");
  const columnSelect2 = document.getElementById("group2Select");
  columnSelect1.innerHTML = "";
  columnSelect2.innerHTML = "";
  headers.forEach((header, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = header;
    columnSelect1.add(option);
    columnSelect2.add(option);
  });
  // columnSelect.disabled = false;
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
  const startTime = performance.now(); // Start timing here

  const groupIndices = [];
  const numGroups = data.headers.length; // Number of groups (columns in your dataset)

  // Gather data for all selected groups (for ANOVA)
  for (let i = 0; i < numGroups; i++) {
    groupIndices.push(flattenedData.map((row) => row[i]));
  }

  // For ANOVA, we assume group indices are extracted for each group
  if (operation === "anova") {
    const group1Index = document.getElementById("group1Select").value;
    const group2Index = document.getElementById("group2Select").value;

    const group1Data = flattenedData.map((row) => row[group1Index]);
    const group2Data = flattenedData.map((row) => row[group2Index]);

    // Allocate memory for group data
    const group1Pointer = Module._malloc(group1Data.length * 8); // Allocate for group 1
    const group2Pointer = Module._malloc(group2Data.length * 8); // Allocate for group 2

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

    group1View.set(group1Data); // Copy data into WASM memory
    group2View.set(group2Data);

    // Allocate memory for double **groups (array of pointers)
    const groupsPointer = Module._malloc(2 * 4); // 2 groups, 4 bytes per pointer
    const groupsView = new Int32Array(Module.HEAP32.buffer, groupsPointer, 2);
    groupsView[0] = group1Pointer; // Pointer to the first group's data
    groupsView[1] = group2Pointer; // Pointer to the second group's data

    // Allocate memory for group sizes
    const groupSizesPointer = Module._malloc(2 * 4); // 2 group sizes, 4 bytes each
    const groupSizesView = new Int32Array(
      Module.HEAP32.buffer,
      groupSizesPointer,
      2
    );
    groupSizesView.set([group1Data.length, group2Data.length]); // Set group sizes

    // Call the ANOVA function from WASM
    const f_statistic = Module._anova(groupsPointer, 2, groupSizesPointer); // Correct arguments
    const roundedResult = f_statistic.toFixed(3);

    console.log("ANOVA result:", f_statistic);

    // Display the result in the UI
    document.getElementById(
      "result"
    ).innerText = `ANOVA F-statistic: ${roundedResult}`;

    // Clean up the memory allocated in WASM
    Module._free(group1Pointer);
    Module._free(group2Pointer);
    Module._free(groupsPointer);
    Module._free(groupSizesPointer);

    // Optionally render the box plot for the groups
    renderBoxPlotChart(["Group 1", "Group 2"], [group1Data, group2Data]);
  } else if (operation === "t-test") {
    const group1Index = document.getElementById("group1Select").value;
    const group2Index = document.getElementById("group2Select").value;
    const group1Data = flattenedData.map((row) => row[group1Index]);
    const group2Data = flattenedData.map((row) => row[group2Index]);

    const group1Pointer = Module._malloc(group1Data.length * 8);
    const group2Pointer = Module._malloc(group2Data.length * 8);

    // Prepare data for box plot
    const boxPlotData = [group1Data, group2Data];
    renderBoxPlotChart(["Group 1", "Group 2"], boxPlotData);

    const t_statistic = Module._t_test(
      group1Pointer,
      group1Data.length,
      group2Pointer,
      group2Data.length
    );

    const roundedResult = t_statistic.toFixed(3);

    // Display the result in the UI
    document.getElementById(
      "result"
    ).innerText = `T-test T-statistic: ${roundedResult}`;

    Module._free(group1Pointer);
    Module._free(group2Pointer);
  }

  const endTime = performance.now(); // End timing here
  const elapsedTime = endTime - startTime;
  console.log(`${operation} took ${elapsedTime.toFixed(2)} ms`);
}

// Function to render ECharts graph
function renderChart(labels, values, operation) {
  const chartDom = document.getElementById("chart");
  const myChart = echarts.init(chartDom);

  let option;
  // Box plot for t-test
  option = {
    title: { text: operation + " Results" },
    tooltip: { trigger: "item", formatter: "{a} <br/>{b}: {c}" },
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value" },
    series: [
      {
        name: "T-Test",
        type: "boxplot",
        data: [values],
        tooltip: {
          formatter: (param) => {
            return [
              `Min: ${param.data[1]}`,
              `Q1: ${param.data[2]}`,
              `Median: ${param.data[3]}`,
              `Q3: ${param.data[4]}`,
              `Max: ${param.data[5]}`,
            ].join("<br/>");
          },
        },
      },
    ],
  };

  myChart.setOption(option);
}

// include p-value for t-test

// Function to render box plot for group data
function renderBoxPlotChart(labels, data) {
  const chartDom = document.getElementById("chart");
  const myChart = echarts.init(chartDom);

  const boxData = data.map(
    (group) => echarts.dataTool.prepareBoxplotData([group]).boxData[0]
  );

  const option = {
    title: { text: "Box Plot for Group Data" },
    tooltip: {
      trigger: "item",
      formatter: function (param) {
        return [
          `Group: ${param.name}`,
          `Min: ${param.data[1]}`,
          `Q1: ${param.data[2]}`,
          `Median: ${param.data[3]}`,
          `Q3: ${param.data[4]}`,
          `Max: ${param.data[5]}`,
        ].join("<br/>");
      },
    },
    xAxis: { type: "category", data: labels, boundaryGap: true },
    yAxis: { type: "value", name: "Values" },
    series: [
      {
        name: "Boxplot",
        type: "boxplot",
        data: boxData,
      },
    ],
  };

  myChart.setOption(option);
}
