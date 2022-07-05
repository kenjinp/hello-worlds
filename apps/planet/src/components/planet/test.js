// Copyright Â© 2014 Andy Gainey <andy@experilous.com>
//
// Usage of the works is permitted provided that this instrument
// is retained with the works, so that any entity that uses the
// works is notified of this instrument.
//
// DISCLAIMER: THE WORKS ARE WITHOUT WARRANTY.

var scene = null;
var camera = null;
var renderer = null;
var projector = null;
var directionalLight = null;
var activeAction = null;
var planet = null;
var tileSelection = null;
var zoom = 1.0;
var zoomAnimationStartTime = null;
var zoomAnimationDuration = null;
var zoomAnimationStartValue = null;
var zoomAnimationEndValue = null;
var cameraLatitude = 0;
var cameraLongitude = 0;
var surfaceRenderMode = "terrain";
var renderSunlight = true;
var renderPlateBoundaries = false;
var renderPlateMovements = false;
var renderAirCurrents = false;
var sunTimeOffset = 0;
var pressedKeys = {};
var disableKeys = false;
var ui = {};

var generationSettings = {
  subdivisions: 20,
  distortionLevel: 1,
  plateCount: 36,
  oceanicRate: 0.7,
  heatLevel: 1.0,
  moistureLevel: 1.0,
  seed: null,
};

var Vector3 = THREE.Vector3;

var KEY_ENTER = 13;
var KEY_SHIFT = 16;
var KEY_ESCAPE = 27;
var KEY_SPACE = 32;
var KEY_LEFTARROW = 37;
var KEY_UPARROW = 38;
var KEY_RIGHTARROW = 39;
var KEY_DOWNARROW = 40;
var KEY_PAGEUP = 33;
var KEY_PAGEDOWN = 34;
var KEY_NUMPAD_PLUS = 107;
var KEY_NUMPAD_MINUS = 109;
var KEY_FORWARD_SLASH = 191;

var KEY = {};
for (var k = 0; k < 10; ++k) KEY[String.fromCharCode(k + 48)] = k + 48;
for (var k = 0; k < 26; ++k) KEY[String.fromCharCode(k + 65)] = k + 65;

$(document).ready(function onDocumentReady() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 1, 0.2, 2000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  projector = new THREE.Projector();

  renderer.setFaceCulling(THREE.CullFaceFront, THREE.FrontFaceDirectionCW);

  var ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(-3, 3, 7).normalize();
  scene.add(directionalLight);

  requestAnimationFrame(render);

  resetCamera();
  updateCamera();

  ui.body = $("body");
  ui.frame = $("#viewportFrame");
  ui.rendererElement = $(renderer.domElement);
  ui.frame.append(ui.rendererElement);
  ui.rendererElement.on("mousewheel", zoomHandler);
  ui.rendererElement.on("click", clickHandler);
  ui.body.on("keydown", keyDownHandler);
  ui.body.on("keyup", keyUpHandler);
  ui.body.focus();

  ui.helpPanel = $("#helpPanel");

  ui.controlPanel = $("#controlPanel");
  ui.surfaceDisplayButtons = {
    terrain: $("#showTerrainButton"),
    plates: $("#showPlatesButton"),
    elevation: $("#showElevationButton"),
    temperature: $("#showTemperatureButton"),
    moisture: $("#showMoistureButton"),
  };

  ui.surfaceDisplayButtons.terrain.click(
    setSurfaceRenderMode.bind(null, "terrain")
  );
  ui.surfaceDisplayButtons.plates.click(
    setSurfaceRenderMode.bind(null, "plates")
  );
  ui.surfaceDisplayButtons.elevation.click(
    setSurfaceRenderMode.bind(null, "elevation")
  );
  ui.surfaceDisplayButtons.temperature.click(
    setSurfaceRenderMode.bind(null, "temperature")
  );
  ui.surfaceDisplayButtons.moisture.click(
    setSurfaceRenderMode.bind(null, "moisture")
  );

  ui.showSunlightButton = $("#showSunlightButton");
  ui.showPlateBoundariesButton = $("#showPlateBoundariesButton");
  ui.showPlateMovementsButton = $("#showPlateMovementsButton");
  ui.showAirCurrentsButton = $("#showAirCurrentsButton");

  ui.showSunlightButton.click(showHideSunlight);
  ui.showPlateBoundariesButton.click(showHidePlateBoundaries);
  ui.showPlateMovementsButton.click(showHidePlateMovements);
  ui.showAirCurrentsButton.click(showHideAirCurrents);

  ui.lowDetailButton = $("#lowDetailButton");
  ui.mediumDetailButton = $("#mediumDetailButton");
  ui.highDetailButton = $("#highDetailButton");
  ui.generatePlanetButton = $("#generatePlanetButton");
  ui.advancedSettingsButton = $("#advancedSettingsButton");

  ui.lowDetailButton.click(setSubdivisions.bind(null, 20));
  ui.mediumDetailButton.click(setSubdivisions.bind(null, 40));
  ui.highDetailButton.click(setSubdivisions.bind(null, 60));
  ui.generatePlanetButton.click(generatePlanetAsynchronous);
  ui.advancedSettingsButton.click(showAdvancedSettings);

  ui.dataPanel = $("#dataPanel");

  ui.progressPanel = $("#progressPanel");
  ui.progressActionLabel = $("#progressActionLabel");
  ui.progressBarFrame = $("#progressBarFrame");
  ui.progressBar = $("#progressBar");
  ui.progressBarLabel = $("#progressBarLabel");
  ui.progressCancelButton = $("#progressCancelButton");
  ui.progressCancelButton.click(cancelButtonHandler);
  ui.progressPanel.hide();

  ui.tileCountLabel = $("#tileCountLabel");
  ui.pentagonCountLabel = $("#pentagonCountLabel");
  ui.hexagonCountLabel = $("#hexagonCountLabel");
  ui.heptagonCountLabel = $("#heptagonCountLabel");
  ui.plateCountLabel = $("#plateCountLabel");
  ui.waterPercentageLabel = $("#waterPercentageLabel");
  ui.rawSeedLabel = $("#rawSeedLabel");
  ui.originalSeedLabel = $("#originalSeedLabel");

  ui.minAirCurrentSpeedLabel = $("#minAirCurrentSpeedLabel");
  ui.avgAirCurrentSpeedLabel = $("#avgAirCurrentSpeedLabel");
  ui.maxAirCurrentSpeedLabel = $("#maxAirCurrentSpeedLabel");

  ui.minElevationLabel = $("#minElevationLabel");
  ui.avgElevationLabel = $("#avgElevationLabel");
  ui.maxElevationLabel = $("#maxElevationLabel");

  ui.minTemperatureLabel = $("#minTemperatureLabel");
  ui.avgTemperatureLabel = $("#avgTemperatureLabel");
  ui.maxTemperatureLabel = $("#maxTemperatureLabel");

  ui.minMoistureLabel = $("#minMoistureLabel");
  ui.avgMoistureLabel = $("#avgMoistureLabel");
  ui.maxMoistureLabel = $("#maxMoistureLabel");

  ui.minPlateMovementSpeedLabel = $("#minPlateMovementSpeedLabel");
  ui.avgPlateMovementSpeedLabel = $("#avgPlateMovementSpeedLabel");
  ui.maxPlateMovementSpeedLabel = $("#maxPlateMovementSpeedLabel");

  ui.minTileAreaLabel = $("#minTileAreaLabel");
  ui.avgTileAreaLabel = $("#avgTileAreaLabel");
  ui.maxTileAreaLabel = $("#maxTileAreaLabel");

  ui.minPlateAreaLabel = $("#minPlateAreaLabel");
  ui.avgPlateAreaLabel = $("#avgPlateAreaLabel");
  ui.maxPlateAreaLabel = $("#maxPlateAreaLabel");

  ui.minPlateCircumferenceLabel = $("#minPlateCircumferenceLabel");
  ui.avgPlateCircumferenceLabel = $("#avgPlateCircumferenceLabel");
  ui.maxPlateCircumferenceLabel = $("#maxPlateCircumferenceLabel");

  ui.generationSettingsPanel = $("#generationSettingsPanel");

  ui.detailLevelLabel = $("#detailLevelLabel");
  ui.detailLevelRange = $("#detailLevelRange");
  ui.distortionLevelLabel = $("#distortionLevelLabel");
  ui.distortionLevelRange = $("#distortionLevelRange");
  ui.tectonicPlateCountLabel = $("#tectonicPlateCountLabel");
  ui.tectonicPlateCountRange = $("#tectonicPlateCountRange");
  ui.oceanicRateLabel = $("#oceanicRateLabel");
  ui.oceanicRateRange = $("#oceanicRateRange");
  ui.heatLevelLabel = $("#heatLevelLabel");
  ui.heatLevelRange = $("#heatLevelRange");
  ui.moistureLevelLabel = $("#moistureLevelLabel");
  ui.moistureLevelRange = $("#moistureLevelRange");
  ui.seedTextBox = $("#seedTextBox");
  ui.advancedGeneratePlanetButton = $("#advancedGeneratePlanetButton");
  ui.advancedCancelButton = $("#advancedCancelButton");

  ui.detailLevelRange.on("input", function () {
    setSubdivisions(parseInt(ui.detailLevelRange.val()));
  });
  ui.distortionLevelRange.on("input", function () {
    setDistortionLevel(parseInt(ui.distortionLevelRange.val()) / 100);
  });
  ui.tectonicPlateCountRange.on("input", function () {
    setPlateCount(
      Math.floor(
        Math.pow(
          2,
          (parseInt(ui.tectonicPlateCountRange.val()) / 300) *
            (Math.log(1000) / Math.log(2) - 1) +
            1
        )
      )
    );
  });
  ui.oceanicRateRange.on("input", function () {
    setOceanicRate(parseInt(ui.oceanicRateRange.val()) / 100);
  });
  ui.heatLevelRange.on("input", function () {
    setHeatLevel(parseInt(ui.heatLevelRange.val()) / 100 + 1);
  });
  ui.moistureLevelRange.on("input", function () {
    setMoistureLevel(parseInt(ui.moistureLevelRange.val()) / 100 + 1);
  });
  ui.seedTextBox.on("input", function () {
    setSeed(ui.seedTextBox.val());
  });
  ui.advancedGeneratePlanetButton.click(function () {
    hideAdvancedSettings();
    generatePlanetAsynchronous();
  });
  ui.advancedCancelButton.click(hideAdvancedSettings);

  ui.updatePanel = $("#updatePanel");

  $("button").on("click", function (b) {
    $(this).blur();
  });
  $("button").on("focus", function () {
    disableKeys = true;
  });
  $("input").on("focus", function () {
    disableKeys = true;
  });
  $("button").on("blur", function () {
    disableKeys = false;
  });
  $("input").on("blur", function () {
    disableKeys = false;
  });

  hideAdvancedSettings();
  setPlateCount(50);

  setSurfaceRenderMode(surfaceRenderMode, true);
  showHideSunlight(renderSunlight);
  showHidePlateBoundaries(renderPlateBoundaries);
  showHidePlateMovements(renderPlateMovements);
  showHideAirCurrents(renderAirCurrents);

  ui.lowDetailButton.click();

  //saveToFileSystem(serializePlanetMesh(planet.mesh, "function getPregeneratedPlanetMesh() { return ", "; }\n"));

  window.addEventListener("resize", resizeHandler);
  resizeHandler();

  ui.generatePlanetButton.click();
});

function setSubdivisions(subdivisions) {
  if (typeof subdivisions === "number" && subdivisions >= 4) {
    generationSettings.subdivisions = subdivisions;
    $("#detailDisplaylist>button.toggled").removeClass("toggled");
    if (subdivisions === 20) ui.lowDetailButton.addClass("toggled");
    else if (subdivisions === 40) ui.mediumDetailButton.addClass("toggled");
    else if (subdivisions === 60) ui.highDetailButton.addClass("toggled");

    subdivisions = subdivisions.toFixed(0);
    if (ui.detailLevelRange.val() !== subdivisions)
      ui.detailLevelRange.val(subdivisions);
    ui.detailLevelLabel.text("Detail Level (" + subdivisions + ")");
  }
}

function setDistortionLevel(distortionLevel) {
  if (
    typeof distortionLevel === "number" &&
    distortionLevel >= 0 &&
    distortionLevel <= 1
  ) {
    generationSettings.distortionLevel = distortionLevel;

    distortionLevel = Math.floor(distortionLevel * 100 + 0.5).toFixed(0);

    if (ui.distortionLevelRange.val() !== distortionLevel)
      ui.distortionLevelRange.val(distortionLevel);
    ui.distortionLevelLabel.text("Distortion Level (" + distortionLevel + "%)");
  }
}

function setPlateCount(plateCount) {
  if (typeof plateCount === "number" && plateCount >= 0) {
    generationSettings.plateCount = plateCount;

    var sliderVal = Math.ceil(
      ((Math.log(plateCount) / Math.log(2) - 1) /
        (Math.log(1000) / Math.log(2) - 1)) *
        300
    ).toFixed(0);
    if (ui.tectonicPlateCountRange.val() !== sliderVal)
      ui.tectonicPlateCountRange.val(sliderVal);
    ui.tectonicPlateCountLabel.text(plateCount.toFixed(0));
  }
}

function setOceanicRate(oceanicRate) {
  if (typeof oceanicRate === "number" && oceanicRate >= 0 && oceanicRate <= 1) {
    generationSettings.oceanicRate = oceanicRate;

    oceanicRate = Math.floor(oceanicRate * 100 + 0.5).toFixed(0);

    if (ui.oceanicRateRange.val() !== oceanicRate)
      ui.oceanicRateRange.val(oceanicRate);
    ui.oceanicRateLabel.text(oceanicRate);
  }
}

function setHeatLevel(heatLevel) {
  if (typeof heatLevel === "number" && heatLevel >= 0) {
    generationSettings.heatLevel = heatLevel;

    heatLevel = Math.floor(heatLevel * 100 - 100).toFixed(0);

    if (ui.heatLevelRange.val() !== heatLevel) ui.heatLevelRange.val(heatLevel);
    if (generationSettings.heatLevel > 1) heatLevel = "+" + heatLevel;
    else if (generationSettings.heatLevel < 1) heatLevel = "-" + heatLevel;
    ui.heatLevelLabel.text(heatLevel);
  }
}

function setMoistureLevel(moistureLevel) {
  if (typeof moistureLevel === "number" && moistureLevel >= 0) {
    generationSettings.moistureLevel = moistureLevel;

    moistureLevel = Math.floor(moistureLevel * 100 - 100).toFixed(0);

    if (ui.moistureLevelRange.val() !== moistureLevel)
      ui.moistureLevelRange.val(moistureLevel);
    if (generationSettings.moistureLevel > 1)
      moistureLevel = "+" + moistureLevel;
    else if (generationSettings.moistureLevel < 1)
      moistureLevel = "-" + moistureLevel;
    ui.moistureLevelLabel.text(moistureLevel);
  }
}

function setSeed(seed) {
  if (!seed) generationSettings.seed = null;
  if (typeof seed === "number") {
    generationSettings.seed = Math.floor(seed);
    ui.seedTextBox.val(generationSettings.seed.toFixed(0));
  } else if (typeof seed === "string") {
    var asInt = parseInt(seed);
    if (isNaN(asInt) || asInt.toFixed(0) !== seed) {
      generationSettings.seed = seed;
    } else {
      generationSettings.seed = asInt;
      ui.seedTextBox.val(generationSettings.seed.toFixed(0));
    }
  } else {
    generationSettings.seed = null;
    ui.seedTextBox.val("");
  }
}

function generatePlanetAsynchronous() {
  var planet;

  var subdivisions = generationSettings.subdivisions;

  var distortionRate;
  if (generationSettings.distortionLevel < 0.25)
    distortionRate = adjustRange(
      generationSettings.distortionLevel,
      0.0,
      0.25,
      0.0,
      0.04
    );
  else if (generationSettings.distortionLevel < 0.5)
    distortionRate = adjustRange(
      generationSettings.distortionLevel,
      0.25,
      0.5,
      0.04,
      0.05
    );
  else if (generationSettings.distortionLevel < 0.75)
    distortionRate = adjustRange(
      generationSettings.distortionLevel,
      0.5,
      0.75,
      0.05,
      0.075
    );
  else
    distortionRate = adjustRange(
      generationSettings.distortionLevel,
      0.75,
      1.0,
      0.075,
      0.15
    );

  var originalSeed = generationSettings.seed;
  var seed;
  if (typeof originalSeed === "number") seed = originalSeed;
  else if (typeof originalSeed === "string") seed = hashString(originalSeed);
  else seed = Date.now();
  var random = new XorShift128(seed);

  var plateCount = generationSettings.plateCount;
  var oceanicRate = generationSettings.oceanicRate;
  var heatLevel = generationSettings.heatLevel;
  var moistureLevel = generationSettings.moistureLevel;

  activeAction = new SteppedAction(updateProgressUI)
    .executeSubaction(function (action) {
      ui.progressPanel.show();
    }, 0)
    .executeSubaction(
      function (action) {
        generatePlanet(
          subdivisions,
          distortionRate,
          plateCount,
          oceanicRate,
          heatLevel,
          moistureLevel,
          random,
          action
        );
      },
      1,
      "Generating Planet"
    )
    .getResult(function (result) {
      planet = result;
      planet.seed = seed;
      planet.originalSeed = originalSeed;
    })
    .executeSubaction(function (action) {
      displayPlanet(planet);
      setSeed(null);
    }, 0)
    .finalize(function (action) {
      activeAction = null;
      ui.progressPanel.hide();
    }, 0)
    .execute();
}

function showAdvancedSettings() {
  ui.generationSettingsPanel.show();
}

function hideAdvancedSettings() {
  ui.generationSettingsPanel.hide();
}

function Planet() {}

function generatePlanet(
  icosahedronSubdivision,
  topologyDistortionRate,
  plateCount,
  oceanicRate,
  heatLevel,
  moistureLevel,
  random,
  action
) {
  var planet = new Planet();
  var mesh;
  action
    .executeSubaction(
      function (action) {
        generatePlanetMesh(
          icosahedronSubdivision,
          topologyDistortionRate,
          random,
          action
        );
      },
      6,
      "Generating Mesh"
    )
    .getResult(function (result) {
      mesh = result;
    })
    .executeSubaction(
      function (action) {
        generatePlanetTopology(mesh, action);
      },
      1,
      "Generating Topology"
    )
    .getResult(function (result) {
      planet.topology = result;
    })
    .executeSubaction(
      function (action) {
        generatePlanetPartition(planet.topology.tiles, action);
      },
      1,
      "Generating Spatial Partitions"
    )
    .getResult(function (result) {
      planet.partition = result;
    })
    .executeSubaction(
      function (action) {
        generatePlanetTerrain(
          planet,
          plateCount,
          oceanicRate,
          heatLevel,
          moistureLevel,
          random,
          action
        );
      },
      8,
      "Generating Terrain"
    )
    .executeSubaction(
      function (action) {
        generatePlanetRenderData(planet.topology, random, action);
      },
      1,
      "Building Visuals"
    )
    .getResult(function (result) {
      planet.renderData = result;
    })
    .executeSubaction(
      function (action) {
        generatePlanetStatistics(planet.topology, planet.plates, action);
      },
      1,
      "Compiling Statistics"
    )
    .getResult(function (result) {
      planet.statistics = result;
    })
    .provideResult(planet);
}

function generatePlanetMesh(
  icosahedronSubdivision,
  topologyDistortionRate,
  random,
  action
) {
  var mesh;
  action.executeSubaction(
    function (action) {
      mesh = generateSubdividedIcosahedron(icosahedronSubdivision);
    },
    1,
    "Generating Subdivided Icosahedron"
  );

  action.executeSubaction(
    function (action) {
      var totalDistortion = Math.ceil(
        mesh.edges.length * topologyDistortionRate
      );
      var remainingIterations = 6;
      action.executeSubaction(function (action) {
        var iterationDistortion = Math.floor(
          totalDistortion / remainingIterations
        );
        totalDistortion -= iterationDistortion;
        action.executeSubaction(function (action) {
          distortMesh(mesh, iterationDistortion, random, action);
        });
        action.executeSubaction(function (action) {
          relaxMesh(mesh, 0.5, action);
        });
        --remainingIterations;
        if (remainingIterations > 0) action.loop(1 - remainingIterations / 6);
      });
    },
    15,
    "Distorting Triangle Mesh"
  );

  action.executeSubaction(
    function (action) {
      var initialIntervalIteration = action.intervalIteration;

      var averageNodeRadius = Math.sqrt((4 * Math.PI) / mesh.nodes.length);
      var minShiftDelta = (averageNodeRadius / 50000) * mesh.nodes.length;
      var maxShiftDelta = (averageNodeRadius / 50) * mesh.nodes.length;

      var priorShift;
      var currentShift = relaxMesh(mesh, 0.5, action);
      action.executeSubaction(function (action) {
        priorShift = currentShift;
        currentShift = relaxMesh(mesh, 0.5, action);
        var shiftDelta = Math.abs(currentShift - priorShift);
        if (
          shiftDelta >= minShiftDelta &&
          action.intervalIteration - initialIntervalIteration < 300
        ) {
          action.loop(
            Math.pow(
              Math.max(
                0,
                (maxShiftDelta - shiftDelta) / (maxShiftDelta - minShiftDelta)
              ),
              4
            )
          );
        }
      });
    },
    25,
    "Relaxing Triangle Mesh"
  );

  action.executeSubaction(
    function (action) {
      for (var i = 0; i < mesh.faces.length; ++i) {
        var face = mesh.faces[i];
        var p0 = mesh.nodes[face.n[0]].p;
        var p1 = mesh.nodes[face.n[1]].p;
        var p2 = mesh.nodes[face.n[2]].p;
        face.centroid = calculateFaceCentroid(p0, p1, p2).normalize();
      }
    },
    1,
    "Calculating Triangle Centroids"
  );

  action.executeSubaction(
    function (action) {
      for (var i = 0; i < mesh.nodes.length; ++i) {
        var node = mesh.nodes[i];
        var faceIndex = node.f[0];
        for (var j = 1; j < node.f.length - 1; ++j) {
          faceIndex = findNextFaceIndex(mesh, i, faceIndex);
          var k = node.f.indexOf(faceIndex);
          node.f[k] = node.f[j];
          node.f[j] = faceIndex;
        }
      }
    },
    1,
    "Reordering Triangle Nodes"
  );

  action.provideResult(function () {
    return mesh;
  });
}

function generateIcosahedron() {
  var phi = (1.0 + Math.sqrt(5.0)) / 2.0;
  var du = 1.0 / Math.sqrt(phi * phi + 1.0);
  var dv = phi * du;

  nodes = [
    { p: new Vector3(0, +dv, +du), e: [], f: [] },
    { p: new Vector3(0, +dv, -du), e: [], f: [] },
    { p: new Vector3(0, -dv, +du), e: [], f: [] },
    { p: new Vector3(0, -dv, -du), e: [], f: [] },
    { p: new Vector3(+du, 0, +dv), e: [], f: [] },
    { p: new Vector3(-du, 0, +dv), e: [], f: [] },
    { p: new Vector3(+du, 0, -dv), e: [], f: [] },
    { p: new Vector3(-du, 0, -dv), e: [], f: [] },
    { p: new Vector3(+dv, +du, 0), e: [], f: [] },
    { p: new Vector3(+dv, -du, 0), e: [], f: [] },
    { p: new Vector3(-dv, +du, 0), e: [], f: [] },
    { p: new Vector3(-dv, -du, 0), e: [], f: [] },
  ];

  edges = [
    { n: [0, 1], f: [] },
    { n: [0, 4], f: [] },
    { n: [0, 5], f: [] },
    { n: [0, 8], f: [] },
    { n: [0, 10], f: [] },
    { n: [1, 6], f: [] },
    { n: [1, 7], f: [] },
    { n: [1, 8], f: [] },
    { n: [1, 10], f: [] },
    { n: [2, 3], f: [] },
    { n: [2, 4], f: [] },
    { n: [2, 5], f: [] },
    { n: [2, 9], f: [] },
    { n: [2, 11], f: [] },
    { n: [3, 6], f: [] },
    { n: [3, 7], f: [] },
    { n: [3, 9], f: [] },
    { n: [3, 11], f: [] },
    { n: [4, 5], f: [] },
    { n: [4, 8], f: [] },
    { n: [4, 9], f: [] },
    { n: [5, 10], f: [] },
    { n: [5, 11], f: [] },
    { n: [6, 7], f: [] },
    { n: [6, 8], f: [] },
    { n: [6, 9], f: [] },
    { n: [7, 10], f: [] },
    { n: [7, 11], f: [] },
    { n: [8, 9], f: [] },
    { n: [10, 11], f: [] },
  ];

  faces = [
    { n: [0, 1, 8], e: [0, 7, 3] },
    { n: [0, 4, 5], e: [1, 18, 2] },
    { n: [0, 5, 10], e: [2, 21, 4] },
    { n: [0, 8, 4], e: [3, 19, 1] },
    { n: [0, 10, 1], e: [4, 8, 0] },
    { n: [1, 6, 8], e: [5, 24, 7] },
    { n: [1, 7, 6], e: [6, 23, 5] },
    { n: [1, 10, 7], e: [8, 26, 6] },
    { n: [2, 3, 11], e: [9, 17, 13] },
    { n: [2, 4, 9], e: [10, 20, 12] },
    { n: [2, 5, 4], e: [11, 18, 10] },
    { n: [2, 9, 3], e: [12, 16, 9] },
    { n: [2, 11, 5], e: [13, 22, 11] },
    { n: [3, 6, 7], e: [14, 23, 15] },
    { n: [3, 7, 11], e: [15, 27, 17] },
    { n: [3, 9, 6], e: [16, 25, 14] },
    { n: [4, 8, 9], e: [19, 28, 20] },
    { n: [5, 11, 10], e: [22, 29, 21] },
    { n: [6, 9, 8], e: [25, 28, 24] },
    { n: [7, 10, 11], e: [26, 29, 27] },
  ];

  for (var i = 0; i < edges.length; ++i)
    for (var j = 0; j < edges[i].n.length; ++j) nodes[j].e.push(i);

  for (var i = 0; i < faces.length; ++i)
    for (var j = 0; j < faces[i].n.length; ++j) nodes[j].f.push(i);

  for (var i = 0; i < faces.length; ++i)
    for (var j = 0; j < faces[i].e.length; ++j) edges[j].f.push(i);

  return { nodes: nodes, edges: edges, faces: faces };
}

function generateSubdividedIcosahedron(degree) {
  var icosahedron = generateIcosahedron();

  var nodes = [];
  for (var i = 0; i < icosahedron.nodes.length; ++i) {
    nodes.push({ p: icosahedron.nodes[i].p, e: [], f: [] });
  }

  var edges = [];
  for (var i = 0; i < icosahedron.edges.length; ++i) {
    var edge = icosahedron.edges[i];
    edge.subdivided_n = [];
    edge.subdivided_e = [];
    var n0 = icosahedron.nodes[edge.n[0]];
    var n1 = icosahedron.nodes[edge.n[1]];
    var p0 = n0.p;
    var p1 = n1.p;
    var delta = p1.clone().sub(p0);
    nodes[edge.n[0]].e.push(edges.length);
    var priorNodeIndex = edge.n[0];
    for (var s = 1; s < degree; ++s) {
      var edgeIndex = edges.length;
      var nodeIndex = nodes.length;
      edge.subdivided_e.push(edgeIndex);
      edge.subdivided_n.push(nodeIndex);
      edges.push({ n: [priorNodeIndex, nodeIndex], f: [] });
      priorNodeIndex = nodeIndex;
      nodes.push({
        p: slerp(p0, p1, s / degree),
        e: [edgeIndex, edgeIndex + 1],
        f: [],
      });
    }
    edge.subdivided_e.push(edges.length);
    nodes[edge.n[1]].e.push(edges.length);
    edges.push({ n: [priorNodeIndex, edge.n[1]], f: [] });
  }

  var faces = [];
  for (var i = 0; i < icosahedron.faces.length; ++i) {
    var face = icosahedron.faces[i];
    var edge0 = icosahedron.edges[face.e[0]];
    var edge1 = icosahedron.edges[face.e[1]];
    var edge2 = icosahedron.edges[face.e[2]];
    var point0 = icosahedron.nodes[face.n[0]].p;
    var point1 = icosahedron.nodes[face.n[1]].p;
    var point2 = icosahedron.nodes[face.n[2]].p;
    var delta = point1.clone().sub(point0);

    var getEdgeNode0 =
      face.n[0] === edge0.n[0]
        ? function (k) {
            return edge0.subdivided_n[k];
          }
        : function (k) {
            return edge0.subdivided_n[degree - 2 - k];
          };
    var getEdgeNode1 =
      face.n[1] === edge1.n[0]
        ? function (k) {
            return edge1.subdivided_n[k];
          }
        : function (k) {
            return edge1.subdivided_n[degree - 2 - k];
          };
    var getEdgeNode2 =
      face.n[0] === edge2.n[0]
        ? function (k) {
            return edge2.subdivided_n[k];
          }
        : function (k) {
            return edge2.subdivided_n[degree - 2 - k];
          };

    var faceNodes = [];
    faceNodes.push(face.n[0]);
    for (var j = 0; j < edge0.subdivided_n.length; ++j)
      faceNodes.push(getEdgeNode0(j));
    faceNodes.push(face.n[1]);
    for (var s = 1; s < degree; ++s) {
      faceNodes.push(getEdgeNode2(s - 1));
      var p0 = nodes[getEdgeNode2(s - 1)].p;
      var p1 = nodes[getEdgeNode1(s - 1)].p;
      for (var t = 1; t < degree - s; ++t) {
        faceNodes.push(nodes.length);
        nodes.push({ p: slerp(p0, p1, t / (degree - s)), e: [], f: [] });
      }
      faceNodes.push(getEdgeNode1(s - 1));
    }
    faceNodes.push(face.n[2]);

    var getEdgeEdge0 =
      face.n[0] === edge0.n[0]
        ? function (k) {
            return edge0.subdivided_e[k];
          }
        : function (k) {
            return edge0.subdivided_e[degree - 1 - k];
          };
    var getEdgeEdge1 =
      face.n[1] === edge1.n[0]
        ? function (k) {
            return edge1.subdivided_e[k];
          }
        : function (k) {
            return edge1.subdivided_e[degree - 1 - k];
          };
    var getEdgeEdge2 =
      face.n[0] === edge2.n[0]
        ? function (k) {
            return edge2.subdivided_e[k];
          }
        : function (k) {
            return edge2.subdivided_e[degree - 1 - k];
          };

    var faceEdges0 = [];
    for (var j = 0; j < degree; ++j) faceEdges0.push(getEdgeEdge0(j));
    var nodeIndex = degree + 1;
    for (var s = 1; s < degree; ++s) {
      for (var t = 0; t < degree - s; ++t) {
        faceEdges0.push(edges.length);
        var edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + 1]],
          f: [],
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      ++nodeIndex;
    }

    var faceEdges1 = [];
    nodeIndex = 1;
    for (var s = 0; s < degree; ++s) {
      for (var t = 1; t < degree - s; ++t) {
        faceEdges1.push(edges.length);
        var edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s]],
          f: [],
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      faceEdges1.push(getEdgeEdge1(s));
      nodeIndex += 2;
    }

    var faceEdges2 = [];
    nodeIndex = 1;
    for (var s = 0; s < degree; ++s) {
      faceEdges2.push(getEdgeEdge2(s));
      for (var t = 1; t < degree - s; ++t) {
        faceEdges2.push(edges.length);
        var edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s + 1]],
          f: [],
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      nodeIndex += 2;
    }

    nodeIndex = 0;
    edgeIndex = 0;
    for (var s = 0; s < degree; ++s) {
      for (t = 1; t < degree - s + 1; ++t) {
        var subFace = {
          n: [
            faceNodes[nodeIndex],
            faceNodes[nodeIndex + 1],
            faceNodes[nodeIndex + degree - s + 1],
          ],
          e: [
            faceEdges0[edgeIndex],
            faceEdges1[edgeIndex],
            faceEdges2[edgeIndex],
          ],
        };
        nodes[subFace.n[0]].f.push(faces.length);
        nodes[subFace.n[1]].f.push(faces.length);
        nodes[subFace.n[2]].f.push(faces.length);
        edges[subFace.e[0]].f.push(faces.length);
        edges[subFace.e[1]].f.push(faces.length);
        edges[subFace.e[2]].f.push(faces.length);
        faces.push(subFace);
        ++nodeIndex;
        ++edgeIndex;
      }
      ++nodeIndex;
    }

    nodeIndex = 1;
    edgeIndex = 0;
    for (var s = 1; s < degree; ++s) {
      for (t = 1; t < degree - s + 1; ++t) {
        var subFace = {
          n: [
            faceNodes[nodeIndex],
            faceNodes[nodeIndex + degree - s + 2],
            faceNodes[nodeIndex + degree - s + 1],
          ],
          e: [
            faceEdges2[edgeIndex + 1],
            faceEdges0[edgeIndex + degree - s + 1],
            faceEdges1[edgeIndex],
          ],
        };
        nodes[subFace.n[0]].f.push(faces.length);
        nodes[subFace.n[1]].f.push(faces.length);
        nodes[subFace.n[2]].f.push(faces.length);
        edges[subFace.e[0]].f.push(faces.length);
        edges[subFace.e[1]].f.push(faces.length);
        edges[subFace.e[2]].f.push(faces.length);
        faces.push(subFace);
        ++nodeIndex;
        ++edgeIndex;
      }
      nodeIndex += 2;
      edgeIndex += 1;
    }
  }

  return { nodes: nodes, edges: edges, faces: faces };
}

function getEdgeOppositeFaceIndex(edge, faceIndex) {
  if (edge.f[0] === faceIndex) return edge.f[1];
  if (edge.f[1] === faceIndex) return edge.f[0];
  throw "Given face is not part of given edge.";
}

function getFaceOppositeNodeIndex(face, edge) {
  if (face.n[0] !== edge.n[0] && face.n[0] !== edge.n[1]) return 0;
  if (face.n[1] !== edge.n[0] && face.n[1] !== edge.n[1]) return 1;
  if (face.n[2] !== edge.n[0] && face.n[2] !== edge.n[1]) return 2;
  throw "Cannot find node of given face that is not also a node of given edge.";
}

function findNextFaceIndex(mesh, nodeIndex, faceIndex) {
  var node = mesh.nodes[nodeIndex];
  var face = mesh.faces[faceIndex];
  var nodeFaceIndex = face.n.indexOf(nodeIndex);
  var edge = mesh.edges[face.e[(nodeFaceIndex + 2) % 3]];
  return getEdgeOppositeFaceIndex(edge, faceIndex);
}

function conditionalRotateEdge(mesh, edgeIndex, predicate) {
  var edge = mesh.edges[edgeIndex];
  var face0 = mesh.faces[edge.f[0]];
  var face1 = mesh.faces[edge.f[1]];
  var farNodeFaceIndex0 = getFaceOppositeNodeIndex(face0, edge);
  var farNodeFaceIndex1 = getFaceOppositeNodeIndex(face1, edge);
  var newNodeIndex0 = face0.n[farNodeFaceIndex0];
  var oldNodeIndex0 = face0.n[(farNodeFaceIndex0 + 1) % 3];
  var newNodeIndex1 = face1.n[farNodeFaceIndex1];
  var oldNodeIndex1 = face1.n[(farNodeFaceIndex1 + 1) % 3];
  var oldNode0 = mesh.nodes[oldNodeIndex0];
  var oldNode1 = mesh.nodes[oldNodeIndex1];
  var newNode0 = mesh.nodes[newNodeIndex0];
  var newNode1 = mesh.nodes[newNodeIndex1];
  var newEdgeIndex0 = face1.e[(farNodeFaceIndex1 + 2) % 3];
  var newEdgeIndex1 = face0.e[(farNodeFaceIndex0 + 2) % 3];
  var newEdge0 = mesh.edges[newEdgeIndex0];
  var newEdge1 = mesh.edges[newEdgeIndex1];

  if (!predicate(oldNode0, oldNode1, newNode0, newNode1)) return false;

  oldNode0.e.splice(oldNode0.e.indexOf(edgeIndex), 1);
  oldNode1.e.splice(oldNode1.e.indexOf(edgeIndex), 1);
  newNode0.e.push(edgeIndex);
  newNode1.e.push(edgeIndex);

  edge.n[0] = newNodeIndex0;
  edge.n[1] = newNodeIndex1;

  newEdge0.f.splice(newEdge0.f.indexOf(edge.f[1]), 1);
  newEdge1.f.splice(newEdge1.f.indexOf(edge.f[0]), 1);
  newEdge0.f.push(edge.f[0]);
  newEdge1.f.push(edge.f[1]);

  oldNode0.f.splice(oldNode0.f.indexOf(edge.f[1]), 1);
  oldNode1.f.splice(oldNode1.f.indexOf(edge.f[0]), 1);
  newNode0.f.push(edge.f[1]);
  newNode1.f.push(edge.f[0]);

  face0.n[(farNodeFaceIndex0 + 2) % 3] = newNodeIndex1;
  face1.n[(farNodeFaceIndex1 + 2) % 3] = newNodeIndex0;

  face0.e[(farNodeFaceIndex0 + 1) % 3] = newEdgeIndex0;
  face1.e[(farNodeFaceIndex1 + 1) % 3] = newEdgeIndex1;
  face0.e[(farNodeFaceIndex0 + 2) % 3] = edgeIndex;
  face1.e[(farNodeFaceIndex1 + 2) % 3] = edgeIndex;

  return true;
}

function calculateFaceCentroid(pa, pb, pc) {
  var vabHalf = pb.clone().sub(pa).divideScalar(2);
  var pabHalf = pa.clone().add(vabHalf);
  var centroid = pc
    .clone()
    .sub(pabHalf)
    .multiplyScalar(1 / 3)
    .add(pabHalf);
  return centroid;
}

function distortMesh(mesh, degree, random, action) {
  var totalSurfaceArea = 4 * Math.PI;
  var idealFaceArea = totalSurfaceArea / mesh.faces.length;
  var idealEdgeLength = Math.sqrt((idealFaceArea * 4) / Math.sqrt(3));
  var idealFaceHeight = (idealEdgeLength * Math.sqrt(3)) / 2;

  var rotationPredicate = function (oldNode0, oldNode1, newNode0, newNode1) {
    if (
      newNode0.f.length >= 7 ||
      newNode1.f.length >= 7 ||
      oldNode0.f.length <= 5 ||
      oldNode1.f.length <= 5
    )
      return false;
    var oldEdgeLength = oldNode0.p.distanceTo(oldNode1.p);
    var newEdgeLength = newNode0.p.distanceTo(newNode1.p);
    var ratio = oldEdgeLength / newEdgeLength;
    if (ratio >= 2 || ratio <= 0.5) return false;
    var v0 = oldNode1.p.clone().sub(oldNode0.p).divideScalar(oldEdgeLength);
    var v1 = newNode0.p.clone().sub(oldNode0.p).normalize();
    var v2 = newNode1.p.clone().sub(oldNode0.p).normalize();
    if (v0.dot(v1) < 0.2 || v0.dot(v2) < 0.2) return false;
    v0.negate();
    var v3 = newNode0.p.clone().sub(oldNode1.p).normalize();
    var v4 = newNode1.p.clone().sub(oldNode1.p).normalize();
    if (v0.dot(v3) < 0.2 || v0.dot(v4) < 0.2) return false;
    return true;
  };

  var i = 0;
  action.executeSubaction(function (action) {
    if (i >= degree) return;

    var consecutiveFailedAttempts = 0;
    var edgeIndex = random.integerExclusive(0, mesh.edges.length);
    while (!conditionalRotateEdge(mesh, edgeIndex, rotationPredicate)) {
      if (++consecutiveFailedAttempts >= mesh.edges.length) return false;
      edgeIndex = (edgeIndex + 1) % mesh.edges.length;
    }

    ++i;
    action.loop(i / degree);
  });

  return true;
}

function relaxMesh(mesh, multiplier, action) {
  var totalSurfaceArea = 4 * Math.PI;
  var idealFaceArea = totalSurfaceArea / mesh.faces.length;
  var idealEdgeLength = Math.sqrt((idealFaceArea * 4) / Math.sqrt(3));
  var idealDistanceToCentroid = ((idealEdgeLength * Math.sqrt(3)) / 3) * 0.9;

  var pointShifts = new Array(mesh.nodes.length);
  action.executeSubaction(function (action) {
    for (var i = 0; i < mesh.nodes.length; ++i)
      pointShifts[i] = new Vector3(0, 0, 0);
  }, 1);

  var i = 0;
  action.executeSubaction(function (action) {
    if (i >= mesh.faces.length) return;

    var face = mesh.faces[i];
    var n0 = mesh.nodes[face.n[0]];
    var n1 = mesh.nodes[face.n[1]];
    var n2 = mesh.nodes[face.n[2]];
    var p0 = n0.p;
    var p1 = n1.p;
    var p2 = n2.p;
    var e0 = p1.distanceTo(p0) / idealEdgeLength;
    var e1 = p2.distanceTo(p1) / idealEdgeLength;
    var e2 = p0.distanceTo(p2) / idealEdgeLength;
    var centroid = calculateFaceCentroid(p0, p1, p2).normalize();
    var v0 = centroid.clone().sub(p0);
    var v1 = centroid.clone().sub(p1);
    var v2 = centroid.clone().sub(p2);
    var length0 = v0.length();
    var length1 = v1.length();
    var length2 = v2.length();
    v0.multiplyScalar(
      (multiplier * (length0 - idealDistanceToCentroid)) / length0
    );
    v1.multiplyScalar(
      (multiplier * (length1 - idealDistanceToCentroid)) / length1
    );
    v2.multiplyScalar(
      (multiplier * (length2 - idealDistanceToCentroid)) / length2
    );
    pointShifts[face.n[0]].add(v0);
    pointShifts[face.n[1]].add(v1);
    pointShifts[face.n[2]].add(v2);

    ++i;
    action.loop(i / mesh.faces.length);
  }, mesh.faces.length);

  var origin = new Vector3(0, 0, 0);
  var plane = new THREE.Plane();
  action.executeSubaction(function (action) {
    for (var i = 0; i < mesh.nodes.length; ++i) {
      plane.setFromNormalAndCoplanarPoint(mesh.nodes[i].p, origin);
      pointShifts[i] = mesh.nodes[i].p
        .clone()
        .add(plane.projectPoint(pointShifts[i]))
        .normalize();
    }
  }, mesh.nodes.length / 10);

  var rotationSupressions = new Array(mesh.nodes.length);
  for (var i = 0; i < mesh.nodes.length; ++i) rotationSupressions[i] = 0;

  var i = 0;
  action.executeSubaction(function (action) {
    if (i >= mesh.edges.length) return;

    var edge = mesh.edges[i];
    var oldPoint0 = mesh.nodes[edge.n[0]].p;
    var oldPoint1 = mesh.nodes[edge.n[1]].p;
    var newPoint0 = pointShifts[edge.n[0]];
    var newPoint1 = pointShifts[edge.n[1]];
    var oldVector = oldPoint1.clone().sub(oldPoint0).normalize();
    var newVector = newPoint1.clone().sub(newPoint0).normalize();
    var suppression = (1 - oldVector.dot(newVector)) * 0.5;
    rotationSupressions[edge.n[0]] = Math.max(
      rotationSupressions[edge.n[0]],
      suppression
    );
    rotationSupressions[edge.n[1]] = Math.max(
      rotationSupressions[edge.n[1]],
      suppression
    );

    ++i;
    action.loop(i / mesh.edges.length);
  });

  var totalShift = 0;
  action.executeSubaction(function (action) {
    for (var i = 0; i < mesh.nodes.length; ++i) {
      var node = mesh.nodes[i];
      var point = node.p;
      var delta = point.clone();
      point
        .lerp(pointShifts[i], 1 - Math.sqrt(rotationSupressions[i]))
        .normalize();
      delta.sub(point);
      totalShift += delta.length();
    }
  }, mesh.nodes.length / 20);

  return totalShift;
}

function generatePlanetTopology(mesh, action) {
  var corners = new Array(mesh.faces.length);
  var borders = new Array(mesh.edges.length);
  var tiles = new Array(mesh.nodes.length);

  action.executeSubaction(function (action) {
    for (var i = 0; i < mesh.faces.length; ++i) {
      var face = mesh.faces[i];
      corners[i] = new Corner(
        i,
        face.centroid.clone().multiplyScalar(1000),
        face.e.length,
        face.e.length,
        face.n.length
      );
    }
  });

  action.executeSubaction(function (action) {
    for (var i = 0; i < mesh.edges.length; ++i) {
      var edge = mesh.edges[i];
      borders[i] = new Border(i, 2, 4, 2); //edge.f.length, mesh.faces[edge.f[0]].e.length + mesh.faces[edge.f[1]].e.length - 2, edge.n.length
    }
  });

  action.executeSubaction(function (action) {
    for (var i = 0; i < mesh.nodes.length; ++i) {
      var node = mesh.nodes[i];
      tiles[i] = new Tile(
        i,
        node.p.clone().multiplyScalar(1000),
        node.f.length,
        node.e.length,
        node.e.length
      );
    }
  });

  action.executeSubaction(function (action) {
    for (var i = 0; i < corners.length; ++i) {
      var corner = corners[i];
      var face = mesh.faces[i];
      for (var j = 0; j < face.e.length; ++j) {
        corner.borders[j] = borders[face.e[j]];
      }
      for (var j = 0; j < face.n.length; ++j) {
        corner.tiles[j] = tiles[face.n[j]];
      }
    }
  });

  action.executeSubaction(function (action) {
    for (var i = 0; i < borders.length; ++i) {
      var border = borders[i];
      var edge = mesh.edges[i];
      var averageCorner = new Vector3(0, 0, 0);
      var n = 0;
      for (var j = 0; j < edge.f.length; ++j) {
        var corner = corners[edge.f[j]];
        averageCorner.add(corner.position);
        border.corners[j] = corner;
        for (var k = 0; k < corner.borders.length; ++k) {
          if (corner.borders[k] !== border)
            border.borders[n++] = corner.borders[k];
        }
      }
      border.midpoint = averageCorner.multiplyScalar(1 / border.corners.length);
      for (var j = 0; j < edge.n.length; ++j) {
        border.tiles[j] = tiles[edge.n[j]];
      }
    }
  });

  action.executeSubaction(function (action) {
    for (var i = 0; i < corners.length; ++i) {
      var corner = corners[i];
      for (var j = 0; j < corner.borders.length; ++j) {
        corner.corners[j] = corner.borders[j].oppositeCorner(corner);
      }
    }
  });

  action.executeSubaction(function (action) {
    for (var i = 0; i < tiles.length; ++i) {
      var tile = tiles[i];
      var node = mesh.nodes[i];
      for (var j = 0; j < node.f.length; ++j) {
        tile.corners[j] = corners[node.f[j]];
      }
      for (var j = 0; j < node.e.length; ++j) {
        var border = borders[node.e[j]];
        if (border.tiles[0] === tile) {
          for (var k = 0; k < tile.corners.length; ++k) {
            var corner0 = tile.corners[k];
            var corner1 = tile.corners[(k + 1) % tile.corners.length];
            if (
              border.corners[1] === corner0 &&
              border.corners[0] === corner1
            ) {
              border.corners[0] = corner0;
              border.corners[1] = corner1;
            } else if (
              border.corners[0] !== corner0 ||
              border.corners[1] !== corner1
            ) {
              continue;
            }
            tile.borders[k] = border;
            tile.tiles[k] = border.oppositeTile(tile);
            break;
          }
        } else {
          for (var k = 0; k < tile.corners.length; ++k) {
            var corner0 = tile.corners[k];
            var corner1 = tile.corners[(k + 1) % tile.corners.length];
            if (
              border.corners[0] === corner0 &&
              border.corners[1] === corner1
            ) {
              border.corners[1] = corner0;
              border.corners[0] = corner1;
            } else if (
              border.corners[1] !== corner0 ||
              border.corners[0] !== corner1
            ) {
              continue;
            }
            tile.borders[k] = border;
            tile.tiles[k] = border.oppositeTile(tile);
            break;
          }
        }
      }

      tile.averagePosition = new Vector3(0, 0, 0);
      for (var j = 0; j < tile.corners.length; ++j) {
        tile.averagePosition.add(tile.corners[j].position);
      }
      tile.averagePosition.multiplyScalar(1 / tile.corners.length);

      var maxDistanceToCorner = 0;
      for (var j = 0; j < tile.corners.length; ++j) {
        maxDistanceToCorner = Math.max(
          maxDistanceToCorner,
          tile.corners[j].position.distanceTo(tile.averagePosition)
        );
      }

      var area = 0;
      for (var j = 0; j < tile.borders.length; ++j) {
        area += calculateTriangleArea(
          tile.position,
          tile.borders[j].corners[0].position,
          tile.borders[j].corners[1].position
        );
      }
      tile.area = area;

      tile.normal = tile.position.clone().normalize();

      tile.boundingSphere = new THREE.Sphere(
        tile.averagePosition,
        maxDistanceToCorner
      );
    }
  });

  action.executeSubaction(function (action) {
    for (var i = 0; i < corners.length; ++i) {
      var corner = corners[i];
      corner.area = 0;
      for (var j = 0; j < corner.tiles.length; ++j) {
        corner.area += corner.tiles[j].area / corner.tiles[j].corners.length;
      }
    }
  });

  action.provideResult({ corners: corners, borders: borders, tiles: tiles });
}

function generatePlanetPartition(tiles, action) {
  var icosahedron = generateIcosahedron();
  action.executeSubaction(function (action) {
    for (var i = 0; i < icosahedron.faces.length; ++i) {
      var face = icosahedron.faces[i];
      var p0 = icosahedron.nodes[face.n[0]].p.clone().multiplyScalar(1000);
      var p1 = icosahedron.nodes[face.n[1]].p.clone().multiplyScalar(1000);
      var p2 = icosahedron.nodes[face.n[2]].p.clone().multiplyScalar(1000);
      var center = p0.clone().add(p1).add(p2).divideScalar(3);
      var radius = Math.max(
        center.distanceTo(p0),
        center.distanceTo(p2),
        center.distanceTo(p2)
      );
      face.boundingSphere = new THREE.Sphere(center, radius);
      face.children = [];
    }
  });

  var unparentedTiles = [];
  var maxDistanceFromOrigin = 0;
  action.executeSubaction(function (action) {
    for (var i = 0; i < tiles.length; ++i) {
      var tile = tiles[i];
      maxDistanceFromOrigin = Math.max(
        maxDistanceFromOrigin,
        tile.boundingSphere.center.length() + tile.boundingSphere.radius
      );

      var parentFound = false;
      for (var j = 0; j < icosahedron.faces.length; ++j) {
        var face = icosahedron.faces[j];
        var distance =
          tile.boundingSphere.center.distanceTo(face.boundingSphere.center) +
          tile.boundingSphere.radius;
        if (distance < face.boundingSphere.radius) {
          face.children.push(tile);
          parentFound = true;
          break;
        }
      }
      if (!parentFound) {
        unparentedTiles.push(tile);
      }
    }
  });

  var rootPartition;
  action.executeSubaction(function (action) {
    rootPartition = new SpatialPartition(
      new THREE.Sphere(new Vector3(0, 0, 0), maxDistanceFromOrigin),
      [],
      unparentedTiles
    );
    for (var i = 0; i < icosahedron.faces.length; ++i) {
      var face = icosahedron.faces[i];
      rootPartition.partitions.push(
        new SpatialPartition(face.boundingSphere, [], face.children)
      );
      delete face.boundingSphere;
      delete face.children;
    }
  });

  action.provideResult(function () {
    return rootPartition;
  });
}

function generatePlanetTerrain(
  planet,
  plateCount,
  oceanicRate,
  heatLevel,
  moistureLevel,
  random,
  action
) {
  action
    .executeSubaction(
      function (action) {
        generatePlanetTectonicPlates(
          planet.topology,
          plateCount,
          oceanicRate,
          random,
          action
        );
      },
      3,
      "Generating Tectonic Plates"
    )
    .getResult(function (result) {
      planet.plates = result;
    })
    .executeSubaction(
      function (action) {
        generatePlanetElevation(planet.topology, planet.plates, action);
      },
      4,
      "Generating Elevation"
    )
    .executeSubaction(
      function (action) {
        generatePlanetWeather(
          planet.topology,
          planet.partition,
          heatLevel,
          moistureLevel,
          random,
          action
        );
      },
      16,
      "Generating Weather"
    )
    .executeSubaction(
      function (action) {
        generatePlanetBiomes(planet.topology.tiles, 1000, action);
      },
      1,
      "Generating Biomes"
    );
}

function generatePlanetTectonicPlates(
  topology,
  plateCount,
  oceanicRate,
  random,
  action
) {
  var plates = [];
  var platelessTiles = [];
  var platelessTilePlates = [];
  action.executeSubaction(function (action) {
    var failedCount = 0;
    while (plates.length < plateCount && failedCount < 10000) {
      var corner =
        topology.corners[random.integerExclusive(0, topology.corners.length)];
      var adjacentToExistingPlate = false;
      for (var i = 0; i < corner.tiles.length; ++i) {
        if (corner.tiles[i].plate) {
          adjacentToExistingPlate = true;
          failedCount += 1;
          break;
        }
      }
      if (adjacentToExistingPlate) continue;

      failedCount = 0;

      var oceanic = random.unit() < oceanicRate;
      var plate = new Plate(
        new THREE.Color(random.integer(0, 0xffffff)),
        randomUnitVector(random),
        random.realInclusive(-Math.PI / 30, Math.PI / 30),
        random.realInclusive(-Math.PI / 30, Math.PI / 30),
        oceanic
          ? random.realInclusive(-0.8, -0.3)
          : random.realInclusive(0.1, 0.5),
        oceanic,
        corner
      );

      plates.push(plate);

      for (var i = 0; i < corner.tiles.length; ++i) {
        corner.tiles[i].plate = plate;
        plate.tiles.push(corner.tiles[i]);
      }

      for (var i = 0; i < corner.tiles.length; ++i) {
        var tile = corner.tiles[i];
        for (var j = 0; j < tile.tiles.length; ++j) {
          var adjacentTile = tile.tiles[j];
          if (!adjacentTile.plate) {
            platelessTiles.push(adjacentTile);
            platelessTilePlates.push(plate);
          }
        }
      }
    }
  });

  action.executeSubaction(function (action) {
    while (platelessTiles.length > 0) {
      var tileIndex = Math.floor(
        Math.pow(random.unit(), 2) * platelessTiles.length
      );
      var tile = platelessTiles[tileIndex];
      var plate = platelessTilePlates[tileIndex];
      platelessTiles.splice(tileIndex, 1);
      platelessTilePlates.splice(tileIndex, 1);
      if (!tile.plate) {
        tile.plate = plate;
        plate.tiles.push(tile);
        for (var j = 0; j < tile.tiles.length; ++j) {
          if (!tile.tiles[j].plate) {
            platelessTiles.push(tile.tiles[j]);
            platelessTilePlates.push(plate);
          }
        }
      }
    }
  });

  action.executeSubaction(
    calculateCornerDistancesToPlateRoot.bind(null, plates)
  );

  action.provideResult(plates);
}

function calculateCornerDistancesToPlateRoot(plates, action) {
  var distanceCornerQueue = [];
  for (var i = 0; i < plates.length; ++i) {
    var corner = plates[i].root;
    corner.distanceToPlateRoot = 0;
    for (var j = 0; j < corner.corners.length; ++j) {
      distanceCornerQueue.push({
        corner: corner.corners[j],
        distanceToPlateRoot: corner.borders[j].length(),
      });
    }
  }

  var distanceCornerQueueSorter = function (left, right) {
    return left.distanceToPlateRoot - right.distanceToPlateRoot;
  };

  action.executeSubaction(function (action) {
    if (distanceCornerQueue.length === 0) return;

    var iEnd = (iEnd = distanceCornerQueue.length);
    for (var i = 0; i < iEnd; ++i) {
      var front = distanceCornerQueue[i];
      var corner = front.corner;
      var distanceToPlateRoot = front.distanceToPlateRoot;
      if (
        !corner.distanceToPlateRoot ||
        corner.distanceToPlateRoot > distanceToPlateRoot
      ) {
        corner.distanceToPlateRoot = distanceToPlateRoot;
        for (var j = 0; j < corner.corners.length; ++j) {
          distanceCornerQueue.push({
            corner: corner.corners[j],
            distanceToPlateRoot:
              distanceToPlateRoot + corner.borders[j].length(),
          });
        }
      }
    }
    distanceCornerQueue.splice(0, iEnd);
    distanceCornerQueue.sort(distanceCornerQueueSorter);

    action.loop();
  });
}

function generatePlanetElevation(topology, plates, action) {
  var boundaryCorners;
  var boundaryCornerInnerBorderIndexes;
  var elevationBorderQueue;
  var elevationBorderQueueSorter = function (left, right) {
    return left.distanceToPlateBoundary - right.distanceToPlateBoundary;
  };

  action
    .executeSubaction(function (action) {
      identifyBoundaryBorders(topology.borders, action);
    }, 1)
    .executeSubaction(function (action) {
      collectBoundaryCorners(topology.corners, action);
    }, 1)
    .getResult(function (result) {
      boundaryCorners = result;
    })
    .executeSubaction(function (action) {
      calculatePlateBoundaryStress(boundaryCorners, action);
    }, 2)
    .getResult(function (result) {
      boundaryCornerInnerBorderIndexes = result;
    })
    .executeSubaction(function (action) {
      blurPlateBoundaryStress(boundaryCorners, 3, 0.4, action);
    }, 2)
    .executeSubaction(function (action) {
      populateElevationBorderQueue(
        boundaryCorners,
        boundaryCornerInnerBorderIndexes,
        action
      );
    }, 2)
    .getResult(function (result) {
      elevationBorderQueue = result;
    })
    .executeSubaction(function (action) {
      processElevationBorderQueue(
        elevationBorderQueue,
        elevationBorderQueueSorter,
        action
      );
    }, 10)
    .executeSubaction(function (action) {
      calculateTileAverageElevations(topology.tiles, action);
    }, 2);
}

function identifyBoundaryBorders(borders, action) {
  for (var i = 0; i < borders.length; ++i) {
    var border = borders[i];
    if (border.tiles[0].plate !== border.tiles[1].plate) {
      border.betweenPlates = true;
      border.corners[0].betweenPlates = true;
      border.corners[1].betweenPlates = true;
      border.tiles[0].plate.boundaryBorders.push(border);
      border.tiles[1].plate.boundaryBorders.push(border);
    }
  }
}

function collectBoundaryCorners(corners, action) {
  var boundaryCorners = [];
  for (var j = 0; j < corners.length; ++j) {
    var corner = corners[j];
    if (corner.betweenPlates) {
      boundaryCorners.push(corner);
      corner.tiles[0].plate.boundaryCorners.push(corner);
      if (corner.tiles[1].plate !== corner.tiles[0].plate)
        corner.tiles[1].plate.boundaryCorners.push(corner);
      if (
        corner.tiles[2].plate !== corner.tiles[0].plate &&
        corner.tiles[2].plate !== corner.tiles[1].plate
      )
        corner.tiles[2].plate.boundaryCorners.push(corner);
    }
  }

  action.provideResult(boundaryCorners);
}

function calculatePlateBoundaryStress(boundaryCorners, action) {
  var boundaryCornerInnerBorderIndexes = new Array(boundaryCorners.length);
  for (var i = 0; i < boundaryCorners.length; ++i) {
    var corner = boundaryCorners[i];
    corner.distanceToPlateBoundary = 0;

    var innerBorder;
    var innerBorderIndex;
    for (var j = 0; j < corner.borders.length; ++j) {
      var border = corner.borders[j];
      if (!border.betweenPlates) {
        innerBorder = border;
        innerBorderIndex = j;
        break;
      }
    }

    if (innerBorder) {
      boundaryCornerInnerBorderIndexes[i] = innerBorderIndex;
      var outerBorder0 =
        corner.borders[(innerBorderIndex + 1) % corner.borders.length];
      var outerBorder1 =
        corner.borders[(innerBorderIndex + 2) % corner.borders.length];
      var farCorner0 = outerBorder0.oppositeCorner(corner);
      var farCorner1 = outerBorder1.oppositeCorner(corner);
      var plate0 = innerBorder.tiles[0].plate;
      var plate1 =
        outerBorder0.tiles[0].plate !== plate0
          ? outerBorder0.tiles[0].plate
          : outerBorder0.tiles[1].plate;
      var boundaryVector = farCorner0.vectorTo(farCorner1);
      var boundaryNormal = boundaryVector.clone().cross(corner.position);
      var stress = calculateStress(
        plate0.calculateMovement(corner.position),
        plate1.calculateMovement(corner.position),
        boundaryVector,
        boundaryNormal
      );
      corner.pressure = stress.pressure;
      corner.shear = stress.shear;
    } else {
      boundaryCornerInnerBorderIndexes[i] = null;
      var plate0 = corner.tiles[0].plate;
      var plate1 = corner.tiles[1].plate;
      var plate2 = corner.tiles[2].plate;
      var boundaryVector0 = corner.corners[0].vectorTo(corner);
      var boundaryVector1 = corner.corners[1].vectorTo(corner);
      var boundaryVector2 = corner.corners[2].vectorTo(corner);
      var boundaryNormal0 = boundaryVector0.clone().cross(corner.position);
      var boundaryNormal1 = boundaryVector1.clone().cross(corner.position);
      var boundaryNormal2 = boundaryVector2.clone().cross(corner.position);
      var stress0 = calculateStress(
        plate0.calculateMovement(corner.position),
        plate1.calculateMovement(corner.position),
        boundaryVector0,
        boundaryNormal0
      );
      var stress1 = calculateStress(
        plate1.calculateMovement(corner.position),
        plate2.calculateMovement(corner.position),
        boundaryVector1,
        boundaryNormal1
      );
      var stress2 = calculateStress(
        plate2.calculateMovement(corner.position),
        plate0.calculateMovement(corner.position),
        boundaryVector2,
        boundaryNormal2
      );

      corner.pressure =
        (stress0.pressure + stress1.pressure + stress2.pressure) / 3;
      corner.shear = (stress0.shear + stress1.shear + stress2.shear) / 3;
    }
  }

  action.provideResult(boundaryCornerInnerBorderIndexes);
}

function calculateStress(movement0, movement1, boundaryVector, boundaryNormal) {
  var relativeMovement = movement0.clone().sub(movement1);
  var pressureVector = relativeMovement.clone().projectOnVector(boundaryNormal);
  var pressure = pressureVector.length();
  if (pressureVector.dot(boundaryNormal) > 0) pressure = -pressure;
  var shear = relativeMovement.clone().projectOnVector(boundaryVector).length();
  return {
    pressure: 2 / (1 + Math.exp(-pressure / 30)) - 1,
    shear: 2 / (1 + Math.exp(-shear / 30)) - 1,
  };
}

function blurPlateBoundaryStress(
  boundaryCorners,
  stressBlurIterations,
  stressBlurCenterWeighting,
  action
) {
  var newCornerPressure = new Array(boundaryCorners.length);
  var newCornerShear = new Array(boundaryCorners.length);
  for (var i = 0; i < stressBlurIterations; ++i) {
    for (var j = 0; j < boundaryCorners.length; ++j) {
      var corner = boundaryCorners[j];
      var averagePressure = 0;
      var averageShear = 0;
      var neighborCount = 0;
      for (var k = 0; k < corner.corners.length; ++k) {
        var neighbor = corner.corners[k];
        if (neighbor.betweenPlates) {
          averagePressure += neighbor.pressure;
          averageShear += neighbor.shear;
          ++neighborCount;
        }
      }
      newCornerPressure[j] =
        corner.pressure * stressBlurCenterWeighting +
        (averagePressure / neighborCount) * (1 - stressBlurCenterWeighting);
      newCornerShear[j] =
        corner.shear * stressBlurCenterWeighting +
        (averageShear / neighborCount) * (1 - stressBlurCenterWeighting);
    }

    for (var j = 0; j < boundaryCorners.length; ++j) {
      var corner = boundaryCorners[j];
      if (corner.betweenPlates) {
        corner.pressure = newCornerPressure[j];
        corner.shear = newCornerShear[j];
      }
    }
  }
}

function populateElevationBorderQueue(
  boundaryCorners,
  boundaryCornerInnerBorderIndexes,
  action
) {
  var elevationBorderQueue = [];
  for (var i = 0; i < boundaryCorners.length; ++i) {
    var corner = boundaryCorners[i];

    var innerBorderIndex = boundaryCornerInnerBorderIndexes[i];
    if (innerBorderIndex !== null) {
      var innerBorder = corner.borders[innerBorderIndex];
      var outerBorder0 =
        corner.borders[(innerBorderIndex + 1) % corner.borders.length];
      var plate0 = innerBorder.tiles[0].plate;
      var plate1 =
        outerBorder0.tiles[0].plate !== plate0
          ? outerBorder0.tiles[0].plate
          : outerBorder0.tiles[1].plate;

      var calculateElevation;

      if (corner.pressure > 0.3) {
        corner.elevation =
          Math.max(plate0.elevation, plate1.elevation) + corner.pressure;
        if (plate0.oceanic === plate1.oceanic)
          calculateElevation = calculateCollidingElevation;
        else if (plate0.oceanic)
          calculateElevation = calculateSubductingElevation;
        else calculateElevation = calculateSuperductingElevation;
      } else if (corner.pressure < -0.3) {
        corner.elevation =
          Math.max(plate0.elevation, plate1.elevation) - corner.pressure / 4;
        calculateElevation = calculateDivergingElevation;
      } else if (corner.shear > 0.3) {
        corner.elevation =
          Math.max(plate0.elevation, plate1.elevation) + corner.shear / 8;
        calculateElevation = calculateShearingElevation;
      } else {
        corner.elevation = (plate0.elevation + plate1.elevation) / 2;
        calculateElevation = calculateDormantElevation;
      }

      var nextCorner = innerBorder.oppositeCorner(corner);
      if (!nextCorner.betweenPlates) {
        elevationBorderQueue.push({
          origin: {
            corner: corner,
            pressure: corner.pressure,
            shear: corner.shear,
            plate: plate0,
            calculateElevation: calculateElevation,
          },
          border: innerBorder,
          corner: corner,
          nextCorner: nextCorner,
          distanceToPlateBoundary: innerBorder.length(),
        });
      }
    } else {
      var plate0 = corner.tiles[0].plate;
      var plate1 = corner.tiles[1].plate;
      var plate2 = corner.tiles[2].plate;

      elevation = 0;

      if (corner.pressure > 0.3) {
        corner.elevation =
          Math.max(plate0.elevation, plate1.elevation, plate2.elevation) +
          corner.pressure;
      } else if (corner.pressure < -0.3) {
        corner.elevation =
          Math.max(plate0.elevation, plate1.elevation, plate2.elevation) +
          corner.pressure / 4;
      } else if (corner.shear > 0.3) {
        corner.elevation =
          Math.max(plate0.elevation, plate1.elevation, plate2.elevation) +
          corner.shear / 8;
      } else {
        corner.elevation =
          (plate0.elevation + plate1.elevation + plate2.elevation) / 3;
      }
    }
  }

  action.provideResult(elevationBorderQueue);
}

function calculateCollidingElevation(
  distanceToPlateBoundary,
  distanceToPlateRoot,
  boundaryElevation,
  plateElevation,
  pressure,
  shear
) {
  var t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot);
  if (t < 0.5) {
    t = t / 0.5;
    return (
      plateElevation + Math.pow(t - 1, 2) * (boundaryElevation - plateElevation)
    );
  } else {
    return plateElevation;
  }
}

function calculateSuperductingElevation(
  distanceToPlateBoundary,
  distanceToPlateRoot,
  boundaryElevation,
  plateElevation,
  pressure,
  shear
) {
  var t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot);
  if (t < 0.2) {
    t = t / 0.2;
    return (
      boundaryElevation +
      t * (plateElevation - boundaryElevation + pressure / 2)
    );
  } else if (t < 0.5) {
    t = (t - 0.2) / 0.3;
    return plateElevation + (Math.pow(t - 1, 2) * pressure) / 2;
  } else {
    return plateElevation;
  }
}

function calculateSubductingElevation(
  distanceToPlateBoundary,
  distanceToPlateRoot,
  boundaryElevation,
  plateElevation,
  pressure,
  shear
) {
  var t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot);
  return (
    plateElevation + Math.pow(t - 1, 2) * (boundaryElevation - plateElevation)
  );
}

function calculateDivergingElevation(
  distanceToPlateBoundary,
  distanceToPlateRoot,
  boundaryElevation,
  plateElevation,
  pressure,
  shear
) {
  var t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot);
  if (t < 0.3) {
    t = t / 0.3;
    return (
      plateElevation + Math.pow(t - 1, 2) * (boundaryElevation - plateElevation)
    );
  } else {
    return plateElevation;
  }
}

function calculateShearingElevation(
  distanceToPlateBoundary,
  distanceToPlateRoot,
  boundaryElevation,
  plateElevation,
  pressure,
  shear
) {
  var t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot);
  if (t < 0.2) {
    t = t / 0.2;
    return (
      plateElevation + Math.pow(t - 1, 2) * (boundaryElevation - plateElevation)
    );
  } else {
    return plateElevation;
  }
}

function calculateDormantElevation(
  distanceToPlateBoundary,
  distanceToPlateRoot,
  boundaryElevation,
  plateElevation,
  pressure,
  shear
) {
  var t =
    distanceToPlateBoundary / (distanceToPlateBoundary + distanceToPlateRoot);
  var elevationDifference = boundaryElevation - plateElevation;
  var a = 2 * elevationDifference;
  var b = -3 * elevationDifference;
  return t * t * elevationDifference * (2 * t - 3) + boundaryElevation;
}

function processElevationBorderQueue(
  elevationBorderQueue,
  elevationBorderQueueSorter,
  action
) {
  if (elevationBorderQueue.length === 0) return;

  var iEnd = (iEnd = elevationBorderQueue.length);
  for (var i = 0; i < iEnd; ++i) {
    var front = elevationBorderQueue[i];
    var corner = front.nextCorner;
    if (!corner.elevation) {
      corner.distanceToPlateBoundary = front.distanceToPlateBoundary;
      corner.elevation = front.origin.calculateElevation(
        corner.distanceToPlateBoundary,
        corner.distanceToPlateRoot,
        front.origin.corner.elevation,
        front.origin.plate.elevation,
        front.origin.pressure,
        front.origin.shear
      );

      for (var j = 0; j < corner.borders.length; ++j) {
        var border = corner.borders[j];
        if (!border.betweenPlates) {
          var nextCorner = corner.corners[j];
          var distanceToPlateBoundary =
            corner.distanceToPlateBoundary + border.length();
          if (
            !nextCorner.distanceToPlateBoundary ||
            nextCorner.distanceToPlateBoundary > distanceToPlateBoundary
          ) {
            elevationBorderQueue.push({
              origin: front.origin,
              border: border,
              corner: corner,
              nextCorner: nextCorner,
              distanceToPlateBoundary: distanceToPlateBoundary,
            });
          }
        }
      }
    }
  }
  elevationBorderQueue.splice(0, iEnd);
  elevationBorderQueue.sort(elevationBorderQueueSorter);

  action.loop();
}

function calculateTileAverageElevations(tiles, action) {
  for (var i = 0; i < tiles.length; ++i) {
    var tile = tiles[i];
    var elevation = 0;
    for (var j = 0; j < tile.corners.length; ++j) {
      elevation += tile.corners[j].elevation;
    }
    tile.elevation = elevation / tile.corners.length;
  }
}

function generatePlanetWeather(
  topology,
  partitions,
  heatLevel,
  moistureLevel,
  random,
  action
) {
  var planetRadius = 1000;
  var whorls;
  var activeCorners;
  var totalHeat;
  var remainingHeat;
  var totalMoisture;
  var remainingMoisture;

  action
    .executeSubaction(
      function (action) {
        generateAirCurrentWhorls(planetRadius, random, action);
      },
      1,
      "Generating Air Currents"
    )
    .getResult(function (result) {
      whorls = result;
    })
    .executeSubaction(
      function (action) {
        calculateAirCurrents(topology.corners, whorls, planetRadius, action);
      },
      1,
      "Generating Air Currents"
    )
    .executeSubaction(
      function (action) {
        initializeAirHeat(topology.corners, heatLevel, action);
      },
      2,
      "Calculating Temperature"
    )
    .getResult(function (result) {
      activeCorners = result.corners;
      totalHeat = result.airHeat;
      remainingHeat = result.airHeat;
    })
    .executeSubaction(
      function (action) {
        var consumedHeat = processAirHeat(activeCorners, action);
        remainingHeat -= consumedHeat;
        if (remainingHeat > 0 && consumedHeat >= 0.0001)
          action.loop(1 - remainingHeat / totalHeat);
      },
      8,
      "Calculating Temperature"
    )
    .executeSubaction(
      function (action) {
        calculateTemperature(
          topology.corners,
          topology.tiles,
          planetRadius,
          action
        );
      },
      1,
      "Calculating Temperature"
    )
    .executeSubaction(
      function (action) {
        initializeAirMoisture(topology.corners, moistureLevel, action);
      },
      2,
      "Calculating Moisture"
    )
    .getResult(function (result) {
      activeCorners = result.corners;
      totalMoisture = result.airMoisture;
      remainingMoisture = result.airMoisture;
    })
    .executeSubaction(
      function (action) {
        var consumedMoisture = processAirMoisture(activeCorners, action);
        remainingMoisture -= consumedMoisture;
        if (remainingMoisture > 0 && consumedMoisture >= 0.0001)
          action.loop(1 - remainingMoisture / totalMoisture);
      },
      32,
      "Calculating Moisture"
    )
    .executeSubaction(
      function (action) {
        calculateMoisture(topology.corners, topology.tiles, action);
      },
      1,
      "Calculating Moisture"
    );
}

function generateAirCurrentWhorls(planetRadius, random, action) {
  var whorls = [];
  var direction = random.integer(0, 1) ? 1 : -1;
  var layerCount = random.integer(4, 7);
  var circumference = Math.PI * 2 * planetRadius;
  var fullRevolution = Math.PI * 2;
  var baseWhorlRadius = circumference / (2 * (layerCount - 1));

  whorls.push({
    center: new Vector3(0, planetRadius, 0)
      .applyAxisAngle(
        new Vector3(1, 0, 0),
        random.realInclusive(0, fullRevolution / (2 * (layerCount + 4)))
      )
      .applyAxisAngle(new Vector3(0, 1, 0), random.real(0, fullRevolution)),
    strength:
      random.realInclusive(fullRevolution / 36, fullRevolution / 24) *
      direction,
    radius: random.realInclusive(baseWhorlRadius * 0.8, baseWhorlRadius * 1.2),
  });

  for (var i = 1; i < layerCount - 1; ++i) {
    direction = -direction;
    var baseTilt = ((i / (layerCount - 1)) * fullRevolution) / 2;
    var layerWhorlCount = Math.ceil(
      (Math.sin(baseTilt) * planetRadius * fullRevolution) / baseWhorlRadius
    );
    for (var j = 0; j < layerWhorlCount; ++j) {
      whorls.push({
        center: new Vector3(0, planetRadius, 0)
          .applyAxisAngle(
            new Vector3(1, 0, 0),
            random.realInclusive(0, fullRevolution / (2 * (layerCount + 4)))
          )
          .applyAxisAngle(new Vector3(0, 1, 0), random.real(0, fullRevolution))
          .applyAxisAngle(new Vector3(1, 0, 0), baseTilt)
          .applyAxisAngle(
            new Vector3(0, 1, 0),
            (fullRevolution * (j + (i % 2) / 2)) / layerWhorlCount
          ),
        strength:
          random.realInclusive(fullRevolution / 48, fullRevolution / 32) *
          direction,
        radius: random.realInclusive(
          baseWhorlRadius * 0.8,
          baseWhorlRadius * 1.2
        ),
      });
    }
  }

  direction = -direction;
  whorls.push({
    center: new Vector3(0, planetRadius, 0)
      .applyAxisAngle(
        new Vector3(1, 0, 0),
        random.realInclusive(0, fullRevolution / (2 * (layerCount + 4)))
      )
      .applyAxisAngle(new Vector3(0, 1, 0), random.real(0, fullRevolution))
      .applyAxisAngle(new Vector3(1, 0, 0), fullRevolution / 2),
    strength:
      random.realInclusive(fullRevolution / 36, fullRevolution / 24) *
      direction,
    radius: random.realInclusive(baseWhorlRadius * 0.8, baseWhorlRadius * 1.2),
  });

  action.provideResult(whorls);
}

function calculateAirCurrents(corners, whorls, planetRadius, action) {
  var i = 0;
  action.executeSubaction(function (action) {
    if (i >= corners.length) return;

    var corner = corners[i];
    var airCurrent = new Vector3(0, 0, 0);
    var weight = 0;
    for (var j = 0; j < whorls.length; ++j) {
      var whorl = whorls[j];
      var angle = whorl.center.angleTo(corner.position);
      var distance = angle * planetRadius;
      if (distance < whorl.radius) {
        var normalizedDistance = distance / whorl.radius;
        var whorlWeight = 1 - normalizedDistance;
        var whorlStrength =
          planetRadius * whorl.strength * whorlWeight * normalizedDistance;
        var whorlCurrent = whorl.center
          .clone()
          .cross(corner.position)
          .setLength(whorlStrength);
        airCurrent.add(whorlCurrent);
        weight += whorlWeight;
      }
    }
    airCurrent.divideScalar(weight);
    corner.airCurrent = airCurrent;
    corner.airCurrentSpeed = airCurrent.length(); //kilometers per hour

    corner.airCurrentOutflows = new Array(corner.borders.length);
    var airCurrentDirection = airCurrent.clone().normalize();
    var outflowSum = 0;
    for (var j = 0; j < corner.corners.length; ++j) {
      var vector = corner.vectorTo(corner.corners[j]).normalize();
      var dot = vector.dot(airCurrentDirection);
      if (dot > 0) {
        corner.airCurrentOutflows[j] = dot;
        outflowSum += dot;
      } else {
        corner.airCurrentOutflows[j] = 0;
      }
    }

    if (outflowSum > 0) {
      for (var j = 0; j < corner.borders.length; ++j) {
        corner.airCurrentOutflows[j] /= outflowSum;
      }
    }

    ++i;
    action.loop(i / corners.length);
  });
}

function initializeAirHeat(corners, heatLevel, action) {
  var activeCorners = [];
  var airHeat = 0;
  for (var i = 0; i < corners.length; ++i) {
    var corner = corners[i];
    corner.airHeat = corner.area * heatLevel;
    corner.newAirHeat = 0;
    corner.heat = 0;

    corner.heatAbsorption =
      (0.1 * corner.area) / Math.max(0.1, Math.min(corner.airCurrentSpeed, 1));
    if (corner.elevation <= 0) {
      corner.maxHeat = corner.area;
    } else {
      corner.maxHeat = corner.area;
      corner.heatAbsorption *= 2;
    }

    activeCorners.push(corner);
    airHeat += corner.airHeat;
  }

  action.provideResult({ corners: activeCorners, airHeat: airHeat });
}

function processAirHeat(activeCorners, action) {
  var consumedHeat = 0;
  var activeCornerCount = activeCorners.length;
  for (var i = 0; i < activeCornerCount; ++i) {
    var corner = activeCorners[i];
    if (corner.airHeat === 0) continue;

    var heatChange = Math.max(
      0,
      Math.min(
        corner.airHeat,
        corner.heatAbsorption * (1 - corner.heat / corner.maxHeat)
      )
    );
    corner.heat += heatChange;
    consumedHeat += heatChange;
    var heatLoss = corner.area * (corner.heat / corner.maxHeat) * 0.02;
    heatChange = Math.min(corner.airHeat, heatChange + heatLoss);

    var remainingCornerAirHeat = corner.airHeat - heatChange;
    corner.airHeat = 0;

    for (var j = 0; j < corner.corners.length; ++j) {
      var outflow = corner.airCurrentOutflows[j];
      if (outflow > 0) {
        corner.corners[j].newAirHeat += remainingCornerAirHeat * outflow;
        activeCorners.push(corner.corners[j]);
      }
    }
  }

  activeCorners.splice(0, activeCornerCount);

  for (var i = 0; i < activeCorners.length; ++i) {
    var corner = activeCorners[i];
    corner.airHeat = corner.newAirHeat;
  }
  for (var i = 0; i < activeCorners.length; ++i) {
    activeCorners[i].newAirHeat = 0;
  }

  return consumedHeat;
}

function calculateTemperature(corners, tiles, planetRadius, action) {
  for (var i = 0; i < corners.length; ++i) {
    var corner = corners[i];
    var latitudeEffect = Math.sqrt(
      1 - Math.abs(corner.position.y) / planetRadius
    );
    var elevationEffect =
      1 - Math.pow(Math.max(0, Math.min(corner.elevation * 0.8, 1)), 2);
    var normalizedHeat = corner.heat / corner.area;
    corner.temperature =
      ((latitudeEffect * elevationEffect * 0.7 + normalizedHeat * 0.3) * 5) /
        3 -
      2 / 3;
    delete corner.airHeat;
    delete corner.newAirHeat;
    delete corner.heat;
    delete corner.maxHeat;
    delete corner.heatAbsorption;
  }

  for (var i = 0; i < tiles.length; ++i) {
    var tile = tiles[i];
    tile.temperature = 0;
    for (var j = 0; j < tile.corners.length; ++j) {
      tile.temperature += tile.corners[j].temperature;
    }
    tile.temperature /= tile.corners.length;
  }
}

function initializeAirMoisture(corners, moistureLevel, action) {
  activeCorners = [];
  airMoisture = 0;
  for (var i = 0; i < corners.length; ++i) {
    var corner = corners[i];
    corner.airMoisture =
      corner.elevation > 0
        ? 0
        : corner.area *
          moistureLevel *
          Math.max(0, Math.min(0.5 + corner.temperature * 0.5, 1));
    corner.newAirMoisture = 0;
    corner.precipitation = 0;

    corner.precipitationRate =
      (0.0075 * corner.area) /
      Math.max(0.1, Math.min(corner.airCurrentSpeed, 1));
    corner.precipitationRate *=
      1 + (1 - Math.max(0, Math.max(corner.temperature, 1))) * 0.1;
    if (corner.elevation > 0) {
      corner.precipitationRate *= 1 + corner.elevation * 0.5;
      corner.maxPrecipitation =
        corner.area *
        (0.25 + Math.max(0, Math.min(corner.elevation, 1)) * 0.25);
    } else {
      corner.maxPrecipitation = corner.area * 0.25;
    }

    activeCorners.push(corner);
    airMoisture += corner.airMoisture;
  }

  action.provideResult({ corners: activeCorners, airMoisture: airMoisture });
}

function processAirMoisture(activeCorners, action) {
  var consumedMoisture = 0;
  var activeCornerCount = activeCorners.length;
  for (var i = 0; i < activeCornerCount; ++i) {
    var corner = activeCorners[i];
    if (corner.airMoisture === 0) continue;

    var moistureChange = Math.max(
      0,
      Math.min(
        corner.airMoisture,
        corner.precipitationRate *
          (1 - corner.precipitation / corner.maxPrecipitation)
      )
    );
    corner.precipitation += moistureChange;
    consumedMoisture += moistureChange;
    var moistureLoss =
      corner.area * (corner.precipitation / corner.maxPrecipitation) * 0.02;
    moistureChange = Math.min(
      corner.airMoisture,
      moistureChange + moistureLoss
    );

    var remainingCornerAirMoisture = corner.airMoisture - moistureChange;
    corner.airMoisture = 0;

    for (var j = 0; j < corner.corners.length; ++j) {
      var outflow = corner.airCurrentOutflows[j];
      if (outflow > 0) {
        corner.corners[j].newAirMoisture +=
          remainingCornerAirMoisture * outflow;
        activeCorners.push(corner.corners[j]);
      }
    }
  }

  activeCorners.splice(0, activeCornerCount);

  for (var i = 0; i < activeCorners.length; ++i) {
    var corner = activeCorners[i];
    corner.airMoisture = corner.newAirMoisture;
  }
  for (var i = 0; i < activeCorners.length; ++i) {
    activeCorners[i].newAirMoisture = 0;
  }

  return consumedMoisture;
}

function calculateMoisture(corners, tiles, action) {
  for (var i = 0; i < corners.length; ++i) {
    var corner = corners[i];
    corner.moisture = corner.precipitation / corner.area / 0.5;
    delete corner.airMoisture;
    delete corner.newAirMoisture;
    delete corner.precipitation;
    delete corner.maxPrecipitation;
    delete corner.precipitationRate;
  }

  for (var i = 0; i < tiles.length; ++i) {
    var tile = tiles[i];
    tile.moisture = 0;
    for (var j = 0; j < tile.corners.length; ++j) {
      tile.moisture += tile.corners[j].moisture;
    }
    tile.moisture /= tile.corners.length;
  }
}

function generatePlanetBiomes(tiles, planetRadius, action) {
  for (var i = 0; i < tiles.length; ++i) {
    var tile = tiles[i];
    var elevation = Math.max(0, tile.elevation);
    var latitude = Math.abs(tile.position.y / planetRadius);
    var temperature = tile.temperature;
    var moisture = tile.moisture;

    if (elevation <= 0) {
      if (temperature > 0) {
        tile.biome = "ocean";
      } else {
        tile.biome = "oceanGlacier";
      }
    } else if (elevation < 0.6) {
      if (temperature > 0.75) {
        if (moisture < 0.25) {
          tile.biome = "desert";
        } else {
          tile.biome = "rainForest";
        }
      } else if (temperature > 0.5) {
        if (moisture < 0.25) {
          tile.biome = "rocky";
        } else if (moisture < 0.5) {
          tile.biome = "plains";
        } else {
          tile.biome = "swamp";
        }
      } else if (temperature > 0) {
        if (moisture < 0.25) {
          tile.biome = "plains";
        } else if (moisture < 0.5) {
          tile.biome = "grassland";
        } else {
          tile.biome = "deciduousForest";
        }
      } else {
        if (moisture < 0.25) {
          tile.biome = "tundra";
        } else {
          tile.biome = "landGlacier";
        }
      }
    } else if (elevation < 0.8) {
      if (temperature > 0) {
        if (moisture < 0.25) {
          tile.biome = "tundra";
        } else {
          tile.biome = "coniferForest";
        }
      } else {
        tile.biome = "tundra";
      }
    } else {
      if (temperature > 0 || moisture < 0.25) {
        tile.biome = "mountain";
      } else {
        tile.biome = "snowyMountain";
      }
    }
  }
}

function generatePlanetRenderData(topology, random, action) {
  var renderData = {};

  action
    .executeSubaction(
      function (action) {
        buildSurfaceRenderObject(topology.tiles, random, action);
      },
      8,
      "Building Surface Visuals"
    )
    .getResult(function (result) {
      renderData.surface = result;
    })
    .executeSubaction(
      function (action) {
        buildPlateBoundariesRenderObject(topology.borders, action);
      },
      1,
      "Building Plate Boundary Visuals"
    )
    .getResult(function (result) {
      renderData.plateBoundaries = result;
    })
    .executeSubaction(
      function (action) {
        buildPlateMovementsRenderObject(topology.tiles, action);
      },
      2,
      "Building Plate Movement Visuals"
    )
    .getResult(function (result) {
      renderData.plateMovements = result;
    })
    .executeSubaction(
      function (action) {
        buildAirCurrentsRenderObject(topology.corners, action);
      },
      2,
      "Building Air Current Visuals"
    )
    .getResult(function (result) {
      renderData.airCurrents = result;
    });

  action.provideResult(renderData);
}

function buildSurfaceRenderObject(tiles, random, action) {
  var planetGeometry = new THREE.Geometry();
  var terrainColors = [];
  var plateColors = [];
  var elevationColors = [];
  var temperatureColors = [];
  var moistureColors = [];

  var i = 0;
  action.executeSubaction(function (action) {
    if (i >= tiles.length) return;

    var tile = tiles[i];

    var colorDeviance = new THREE.Color(
      random.unit(),
      random.unit(),
      random.unit()
    );
    var terrainColor;
    if (tile.elevation <= 0) {
      var normalizedElevation = Math.min(-tile.elevation, 1);
      if (tile.biome === "ocean")
        terrainColor = new THREE.Color(0x0066ff)
          .lerp(new THREE.Color(0x0044bb), Math.min(-tile.elevation, 1))
          .lerp(colorDeviance, 0.1);
      else if (tile.biome === "oceanGlacier")
        terrainColor = new THREE.Color(0xddeeff).lerp(colorDeviance, 0.1);
      else terrainColor = new THREE.Color(0xff00ff);
    } else if (tile.elevation < 0.6) {
      var normalizedElevation = tile.elevation / 0.6;
      if (tile.biome === "desert")
        terrainColor = new THREE.Color(0xdddd77)
          .lerp(new THREE.Color(0xbbbb55), normalizedElevation)
          .lerp(colorDeviance, 0.1);
      else if (tile.biome === "rainForest")
        terrainColor = new THREE.Color(0x44dd00)
          .lerp(new THREE.Color(0x229900), normalizedElevation)
          .lerp(colorDeviance, 0.2);
      else if (tile.biome === "rocky")
        terrainColor = new THREE.Color(0xaa9977)
          .lerp(new THREE.Color(0x887755), normalizedElevation)
          .lerp(colorDeviance, 0.15);
      else if (tile.biome === "plains")
        terrainColor = new THREE.Color(0x99bb44)
          .lerp(new THREE.Color(0x667722), normalizedElevation)
          .lerp(colorDeviance, 0.1);
      else if (tile.biome === "grassland")
        terrainColor = new THREE.Color(0x77cc44)
          .lerp(new THREE.Color(0x448822), normalizedElevation)
          .lerp(colorDeviance, 0.15);
      else if (tile.biome === "swamp")
        terrainColor = new THREE.Color(0x77aa44)
          .lerp(new THREE.Color(0x446622), normalizedElevation)
          .lerp(colorDeviance, 0.25);
      else if (tile.biome === "deciduousForest")
        terrainColor = new THREE.Color(0x33aa22)
          .lerp(new THREE.Color(0x116600), normalizedElevation)
          .lerp(colorDeviance, 0.1);
      else if (tile.biome === "tundra")
        terrainColor = new THREE.Color(0x9999aa)
          .lerp(new THREE.Color(0x777788), normalizedElevation)
          .lerp(colorDeviance, 0.15);
      else if (tile.biome === "landGlacier")
        terrainColor = new THREE.Color(0xddeeff).lerp(colorDeviance, 0.1);
      else terrainColor = new THREE.Color(0xff00ff);
    } else if (tile.elevation < 0.8) {
      var normalizedElevation = (tile.elevation - 0.6) / 0.2;
      if (tile.biome === "tundra")
        terrainColor = new THREE.Color(0x777788)
          .lerp(new THREE.Color(0x666677), normalizedElevation)
          .lerp(colorDeviance, 0.1);
      else if (tile.biome === "coniferForest")
        terrainColor = new THREE.Color(0x338822)
          .lerp(new THREE.Color(0x116600), normalizedElevation)
          .lerp(colorDeviance, 0.1);
      else if (tile.biome === "snow")
        terrainColor = new THREE.Color(0xeeeeee)
          .lerp(new THREE.Color(0xdddddd), normalizedElevation)
          .lerp(colorDeviance, 0.1);
      else if (tile.biome === "mountain")
        terrainColor = new THREE.Color(0x555544)
          .lerp(new THREE.Color(0x444433), normalizedElevation)
          .lerp(colorDeviance, 0.05);
      else terrainColor = new THREE.Color(0xff00ff);
    } else {
      var normalizedElevation = Math.min((tile.elevation - 0.8) / 0.5, 1);
      if (tile.biome === "mountain")
        terrainColor = new THREE.Color(0x444433)
          .lerp(new THREE.Color(0x333322), normalizedElevation)
          .lerp(colorDeviance, 0.05);
      else if (tile.biome === "snowyMountain")
        terrainColor = new THREE.Color(0xdddddd)
          .lerp(new THREE.Color(0xffffff), normalizedElevation)
          .lerp(colorDeviance, 0.1);
      else terrainColor = new THREE.Color(0xff00ff);
    }

    var plateColor = tile.plate.color.clone();

    var elevationColor;
    if (tile.elevation <= 0)
      elevationColor = new THREE.Color(0x224488).lerp(
        new THREE.Color(0xaaddff),
        Math.max(0, Math.min((tile.elevation + 3 / 4) / (3 / 4), 1))
      );
    else if (tile.elevation < 0.75)
      elevationColor = new THREE.Color(0x997755).lerp(
        new THREE.Color(0x553311),
        Math.max(0, Math.min(tile.elevation / (3 / 4), 1))
      );
    else
      elevationColor = new THREE.Color(0x553311).lerp(
        new THREE.Color(0x222222),
        Math.max(0, Math.min((tile.elevation - 3 / 4) / (1 / 2), 1))
      );

    var temperatureColor;
    if (tile.temperature <= 0)
      temperatureColor = new THREE.Color(0x0000ff).lerp(
        new THREE.Color(0xbbddff),
        Math.max(0, Math.min((tile.temperature + 2 / 3) / (2 / 3), 1))
      );
    else
      temperatureColor = new THREE.Color(0xffff00).lerp(
        new THREE.Color(0xff0000),
        Math.max(0, Math.min(tile.temperature / (3 / 3), 1))
      );

    var moistureColor = new THREE.Color(0xffcc00).lerp(
      new THREE.Color(0x0066ff),
      Math.max(0, Math.min(tile.moisture, 1))
    );

    var baseIndex = planetGeometry.vertices.length;
    planetGeometry.vertices.push(tile.averagePosition);
    for (var j = 0; j < tile.corners.length; ++j) {
      var cornerPosition = tile.corners[j].position;
      planetGeometry.vertices.push(cornerPosition);
      planetGeometry.vertices.push(
        tile.averagePosition
          .clone()
          .sub(cornerPosition)
          .multiplyScalar(0.1)
          .add(cornerPosition)
      );

      var i0 = j * 2;
      var i1 = ((j + 1) % tile.corners.length) * 2;
      buildTileWedge(planetGeometry.faces, baseIndex, i0, i1, tile.normal);
      buildTileWedgeColors(
        terrainColors,
        terrainColor,
        terrainColor.clone().multiplyScalar(0.5)
      );
      buildTileWedgeColors(
        plateColors,
        plateColor,
        plateColor.clone().multiplyScalar(0.5)
      );
      buildTileWedgeColors(
        elevationColors,
        elevationColor,
        elevationColor.clone().multiplyScalar(0.5)
      );
      buildTileWedgeColors(
        temperatureColors,
        temperatureColor,
        temperatureColor.clone().multiplyScalar(0.5)
      );
      buildTileWedgeColors(
        moistureColors,
        moistureColor,
        moistureColor.clone().multiplyScalar(0.5)
      );
      for (
        var k = planetGeometry.faces.length - 3;
        k < planetGeometry.faces.length;
        ++k
      )
        planetGeometry.faces[k].vertexColors = terrainColors[k];
    }

    ++i;

    action.loop(i / tiles.length);
  });

  planetGeometry.dynamic = true;
  planetGeometry.boundingSphere = new THREE.Sphere(new Vector3(0, 0, 0), 1000);
  var planetMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0x000000),
    ambient: new THREE.Color(0xffffff),
    vertexColors: THREE.VertexColors,
  });
  var planetRenderObject = new THREE.Mesh(planetGeometry, planetMaterial);

  action.provideResult({
    geometry: planetGeometry,
    terrainColors: terrainColors,
    plateColors: plateColors,
    elevationColors: elevationColors,
    temperatureColors: temperatureColors,
    moistureColors: moistureColors,
    material: planetMaterial,
    renderObject: planetRenderObject,
  });
}

function buildPlateBoundariesRenderObject(borders, action) {
  var geometry = new THREE.Geometry();

  var i = 0;
  action.executeSubaction(function (action) {
    if (i >= borders.length) return;

    var border = borders[i];
    if (border.betweenPlates) {
      var normal = border.midpoint.clone().normalize();
      var offset = normal.clone().multiplyScalar(1);

      var borderPoint0 = border.corners[0].position;
      var borderPoint1 = border.corners[1].position;
      var tilePoint0 = border.tiles[0].averagePosition;
      var tilePoint1 = border.tiles[1].averagePosition;

      var baseIndex = geometry.vertices.length;
      geometry.vertices.push(borderPoint0.clone().add(offset));
      geometry.vertices.push(borderPoint1.clone().add(offset));
      geometry.vertices.push(
        tilePoint0
          .clone()
          .sub(borderPoint0)
          .multiplyScalar(0.2)
          .add(borderPoint0)
          .add(offset)
      );
      geometry.vertices.push(
        tilePoint0
          .clone()
          .sub(borderPoint1)
          .multiplyScalar(0.2)
          .add(borderPoint1)
          .add(offset)
      );
      geometry.vertices.push(
        tilePoint1
          .clone()
          .sub(borderPoint0)
          .multiplyScalar(0.2)
          .add(borderPoint0)
          .add(offset)
      );
      geometry.vertices.push(
        tilePoint1
          .clone()
          .sub(borderPoint1)
          .multiplyScalar(0.2)
          .add(borderPoint1)
          .add(offset)
      );

      var pressure = Math.max(
        -1,
        Math.min(
          (border.corners[0].pressure + border.corners[1].pressure) / 2,
          1
        )
      );
      var shear = Math.max(
        0,
        Math.min((border.corners[0].shear + border.corners[1].shear) / 2, 1)
      );
      var innerColor =
        pressure <= 0
          ? new THREE.Color(1 + pressure, 1, 0)
          : new THREE.Color(1, 1 - pressure, 0);
      var outerColor = new THREE.Color(0, shear / 2, shear);

      geometry.faces.push(
        new THREE.Face3(baseIndex + 0, baseIndex + 1, baseIndex + 2, normal, [
          innerColor,
          innerColor,
          outerColor,
        ])
      );
      geometry.faces.push(
        new THREE.Face3(baseIndex + 1, baseIndex + 3, baseIndex + 2, normal, [
          innerColor,
          outerColor,
          outerColor,
        ])
      );
      geometry.faces.push(
        new THREE.Face3(baseIndex + 1, baseIndex + 0, baseIndex + 5, normal, [
          innerColor,
          innerColor,
          outerColor,
        ])
      );
      geometry.faces.push(
        new THREE.Face3(baseIndex + 0, baseIndex + 4, baseIndex + 5, normal, [
          innerColor,
          outerColor,
          outerColor,
        ])
      );
    }

    ++i;

    action.loop(i / borders.length);
  });

  geometry.boundingSphere = new THREE.Sphere(new Vector3(0, 0, 0), 1010);
  var material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
  });
  var renderObject = new THREE.Mesh(geometry, material);

  action.provideResult({
    geometry: geometry,
    material: material,
    renderObject: renderObject,
  });
}

function buildPlateMovementsRenderObject(tiles, action) {
  var geometry = new THREE.Geometry();

  var i = 0;
  action.executeSubaction(function (action) {
    if (i >= tiles.length) return;

    var tile = tiles[i];
    var plate = tile.plate;
    var movement = plate.calculateMovement(tile.position);
    var plateMovementColor = new THREE.Color(
      1 - plate.color.r,
      1 - plate.color.g,
      1 - plate.color.b
    );

    buildArrow(
      geometry,
      tile.position.clone().multiplyScalar(1.002),
      movement.clone().multiplyScalar(0.5),
      tile.position.clone().normalize(),
      Math.min(movement.length(), 4),
      plateMovementColor
    );

    tile.plateMovement = movement;

    ++i;

    action.loop(i / tiles.length);
  });

  geometry.boundingSphere = new THREE.Sphere(new Vector3(0, 0, 0), 1010);
  var material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
  });
  var renderObject = new THREE.Mesh(geometry, material);

  action.provideResult({
    geometry: geometry,
    material: material,
    renderObject: renderObject,
  });
}

function buildAirCurrentsRenderObject(corners, action) {
  var geometry = new THREE.Geometry();

  var i = 0;
  action.executeSubaction(function (action) {
    if (i >= corners.length) return;

    var corner = corners[i];
    buildArrow(
      geometry,
      corner.position.clone().multiplyScalar(1.002),
      corner.airCurrent.clone().multiplyScalar(0.5),
      corner.position.clone().normalize(),
      Math.min(corner.airCurrent.length(), 4)
    );

    ++i;

    action.loop(i / corners.length);
  });

  geometry.boundingSphere = new THREE.Sphere(new Vector3(0, 0, 0), 1010);
  var material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffffff),
  });
  var renderObject = new THREE.Mesh(geometry, material);

  action.provideResult({
    geometry: geometry,
    material: material,
    renderObject: renderObject,
  });
}

function buildArrow(geometry, position, direction, normal, baseWidth, color) {
  if (direction.lengthSq() === 0) return;
  var sideOffset = direction
    .clone()
    .cross(normal)
    .setLength(baseWidth / 2);
  var baseIndex = geometry.vertices.length;
  geometry.vertices.push(
    position.clone().add(sideOffset),
    position.clone().add(direction),
    position.clone().sub(sideOffset)
  );
  geometry.faces.push(
    new THREE.Face3(baseIndex, baseIndex + 2, baseIndex + 1, normal, [
      color,
      color,
      color,
    ])
  );
}

function buildTileWedge(f, b, s, t, n) {
  f.push(new THREE.Face3(b + s + 2, b + t + 2, b, n));
  f.push(new THREE.Face3(b + s + 1, b + t + 1, b + t + 2, n));
  f.push(new THREE.Face3(b + s + 1, b + t + 2, b + s + 2, n));
}

function buildTileWedgeColors(f, c, bc) {
  f.push([c, c, c]);
  f.push([bc, bc, c]);
  f.push([bc, c, c]);
}

function generatePlanetStatistics(topology, plates, action) {
  var statistics = {};

  var updateMinMaxAvg = function (stats, value) {
    stats.min = Math.min(stats.min, value);
    stats.max = Math.max(stats.max, value);
    stats.avg += value;
  };

  statistics.corners = {
    count: topology.corners.length,
    airCurrent: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    elevation: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    temperature: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    moisture: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    distanceToPlateBoundary: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    distanceToPlateRoot: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    pressure: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    shear: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    doublePlateBoundaryCount: 0,
    triplePlateBoundaryCount: 0,
    innerLandBoundaryCount: 0,
    outerLandBoundaryCount: 0,
  };

  for (var i = 0; i < topology.corners.length; ++i) {
    corner = topology.corners[i];
    updateMinMaxAvg(statistics.corners.airCurrent, corner.airCurrent.length());
    updateMinMaxAvg(statistics.corners.elevation, corner.elevation);
    updateMinMaxAvg(statistics.corners.temperature, corner.temperature);
    updateMinMaxAvg(statistics.corners.moisture, corner.moisture);
    updateMinMaxAvg(
      statistics.corners.distanceToPlateBoundary,
      corner.distanceToPlateBoundary
    );
    updateMinMaxAvg(
      statistics.corners.distanceToPlateRoot,
      corner.distanceToPlateRoot
    );
    if (corner.betweenPlates) {
      updateMinMaxAvg(statistics.corners.pressure, corner.pressure);
      updateMinMaxAvg(statistics.corners.shear, corner.shear);
      if (
        !corner.borders[0].betweenPlates ||
        !corner.borders[1].betweenPlates ||
        !corner.borders[2].betweenPlates
      ) {
        statistics.corners.doublePlateBoundaryCount += 1;
      } else {
        statistics.corners.triplePlateBoundaryCount += 1;
      }
    }
    var landCount =
      (corner.tiles[0].elevation > 0 ? 1 : 0) +
      (corner.tiles[1].elevation > 0 ? 1 : 0) +
      (corner.tiles[2].elevation > 0 ? 1 : 0);
    if (landCount === 2) {
      statistics.corners.innerLandBoundaryCount += 1;
    } else if (landCount === 1) {
      statistics.corners.outerLandBoundaryCount += 1;
    }
    if (corner.corners.length !== 3)
      throw "Corner has as invalid number of neighboring corners.";
    if (corner.borders.length !== 3)
      throw "Corner has as invalid number of borders.";
    if (corner.tiles.length !== 3)
      throw "Corner has as invalid number of tiles.";
  }

  statistics.corners.airCurrent.avg /= statistics.corners.count;
  statistics.corners.elevation.avg /= statistics.corners.count;
  statistics.corners.temperature.avg /= statistics.corners.count;
  statistics.corners.moisture.avg /= statistics.corners.count;
  statistics.corners.distanceToPlateBoundary.avg /= statistics.corners.count;
  statistics.corners.distanceToPlateRoot.avg /= statistics.corners.count;
  statistics.corners.pressure.avg /=
    statistics.corners.doublePlateBoundaryCount +
    statistics.corners.triplePlateBoundaryCount;
  statistics.corners.shear.avg /=
    statistics.corners.doublePlateBoundaryCount +
    statistics.corners.triplePlateBoundaryCount;

  statistics.borders = {
    count: topology.borders.length,
    length: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    plateBoundaryCount: 0,
    plateBoundaryPercentage: 0,
    landBoundaryCount: 0,
    landBoundaryPercentage: 0,
  };

  for (var i = 0; i < topology.borders.length; ++i) {
    border = topology.borders[i];
    var length = border.length();
    updateMinMaxAvg(statistics.borders.length, length);
    if (border.betweenPlates) {
      statistics.borders.plateBoundaryCount += 1;
      statistics.borders.plateBoundaryPercentage += length;
    }
    if (border.isLandBoundary()) {
      statistics.borders.landBoundaryCount += 1;
      statistics.borders.landBoundaryPercentage += length;
    }
    if (border.corners.length !== 2)
      throw "Border has as invalid number of corners.";
    if (border.borders.length !== 4)
      throw "Border has as invalid number of neighboring borders.";
    if (border.tiles.length !== 2)
      throw "Border has as invalid number of tiles.";
  }

  statistics.borders.plateBoundaryPercentage /= statistics.borders.length.avg;
  statistics.borders.landBoundaryPercentage /= statistics.borders.length.avg;
  statistics.borders.length.avg /= statistics.borders.count;

  statistics.tiles = {
    count: topology.tiles.length,
    totalArea: 0,
    area: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    elevation: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    temperature: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    moisture: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    plateMovement: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    biomeCounts: {},
    biomeAreas: {},
    pentagonCount: 0,
    hexagonCount: 0,
    heptagonCount: 0,
  };

  for (var i = 0; i < topology.tiles.length; ++i) {
    var tile = topology.tiles[i];
    updateMinMaxAvg(statistics.tiles.area, tile.area);
    updateMinMaxAvg(statistics.tiles.elevation, tile.elevation);
    updateMinMaxAvg(statistics.tiles.temperature, tile.temperature);
    updateMinMaxAvg(statistics.tiles.moisture, tile.moisture);
    updateMinMaxAvg(
      statistics.tiles.plateMovement,
      tile.plateMovement.length()
    );
    if (!statistics.tiles.biomeCounts[tile.biome])
      statistics.tiles.biomeCounts[tile.biome] = 0;
    statistics.tiles.biomeCounts[tile.biome] += 1;
    if (!statistics.tiles.biomeAreas[tile.biome])
      statistics.tiles.biomeAreas[tile.biome] = 0;
    statistics.tiles.biomeAreas[tile.biome] += tile.area;
    if (tile.tiles.length === 5) statistics.tiles.pentagonCount += 1;
    else if (tile.tiles.length === 6) statistics.tiles.hexagonCount += 1;
    else if (tile.tiles.length === 7) statistics.tiles.heptagonCount += 1;
    else throw "Tile has an invalid number of neighboring tiles.";
    if (tile.tiles.length !== tile.borders.length)
      throw "Tile has a neighbor and border count that do not match.";
    if (tile.tiles.length !== tile.corners.length)
      throw "Tile has a neighbor and corner count that do not match.";
  }

  statistics.tiles.totalArea = statistics.tiles.area.avg;
  statistics.tiles.area.avg /= statistics.tiles.count;
  statistics.tiles.elevation.avg /= statistics.tiles.count;
  statistics.tiles.temperature.avg /= statistics.tiles.count;
  statistics.tiles.moisture.avg /= statistics.tiles.count;
  statistics.tiles.plateMovement.avg /= statistics.tiles.count;

  statistics.plates = {
    count: plates.length,
    tileCount: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    area: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    boundaryElevation: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    boundaryBorders: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
    circumference: {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
    },
  };

  for (var i = 0; i < plates.length; ++i) {
    var plate = plates[i];
    updateMinMaxAvg(statistics.plates.tileCount, plate.tiles.length);
    plate.area = 0;
    for (var j = 0; j < plate.tiles.length; ++j) {
      var tile = plate.tiles[j];
      plate.area += tile.area;
    }
    updateMinMaxAvg(statistics.plates.area, plate.area);
    var elevation = 0;
    for (var j = 0; j < plate.boundaryCorners.length; ++j) {
      var corner = plate.boundaryCorners[j];
      elevation += corner.elevation;
    }
    updateMinMaxAvg(
      statistics.plates.boundaryElevation,
      elevation / plate.boundaryCorners.length
    );
    updateMinMaxAvg(
      statistics.plates.boundaryBorders,
      plate.boundaryBorders.length
    );
    plate.circumference = 0;
    for (var j = 0; j < plate.boundaryBorders.length; ++j) {
      var border = plate.boundaryBorders[j];
      plate.circumference += border.length();
    }
    updateMinMaxAvg(statistics.plates.circumference, plate.circumference);
  }

  statistics.plates.tileCount.avg /= statistics.plates.count;
  statistics.plates.area.avg /= statistics.plates.count;
  statistics.plates.boundaryElevation.avg /= statistics.plates.count;
  statistics.plates.boundaryBorders.avg /= statistics.plates.count;
  statistics.plates.circumference.avg /= statistics.plates.count;

  action.provideResult(statistics);
}

function SteppedAction(progressUpdater, unbrokenInterval, sleepInterval) {
  this.callStack = null;
  this.subactions = [];
  this.finalizers = [];
  this.unbrokenInterval =
    typeof unbrokenInterval === "number" && unbrokenInterval >= 0
      ? unbrokenInterval
      : 16;
  this.sleepInterval =
    typeof sleepInterval === "number" && sleepInterval >= 0 ? sleepInterval : 0;
  this.loopAction = false;
  this.started = false;
  this.canceled = false;
  this.completed = false;
  this.intervalIteration = 0; //number of times an unbroken interval has been completed
  this.stepIteration = 0; //number of times any of the stepper functions have been called
  this.intervalStepIteration = null; //number of times any of the stepper functions have been called during the current interval
  this.intervalStartTime = null; //begin time of the current interval
  this.intervalEndTime = null; //end time of the current interval
  this.progressUpdater =
    typeof progressUpdater === "function" ? progressUpdater : null;
}

SteppedAction.prototype.execute = function SteppedAction_execute() {
  if (
    !this.canceled &&
    !this.completed &&
    this.callStack === null &&
    this.started === false
  ) {
    this.started = true;
    if (this.subactions.length > 0) {
      this.beginSubactions(0, 1);
      if (this.progressUpdater !== null) this.progressUpdater(this);
      window.setTimeout(this.step.bind(this), this.sleepInterval);
    } else {
      this.completed = true;
    }
  }
  return this;
};

SteppedAction.prototype.step = function SteppedAction_step() {
  this.intervalStartTime = Date.now();
  this.intervalEndTime = this.intervalStartTime + this.unbrokenInterval;
  this.intervalStepIteration = 0;
  while (
    Date.now() < this.intervalEndTime &&
    !this.canceled &&
    !this.completed
  ) {
    var action = this.callStack.actions[this.callStack.index];

    this.callStack.loop = false;
    action.action(this);
    this.intervalStepIteration += 1;
    this.stepIteration += 1;

    if (this.subactions.length > 0) {
      this.beginSubactions(
        this.getProgress(),
        this.callStack.loop
          ? 0
          : (((1 - this.callStack.loopProgress) * action.proportion) /
              this.callStack.proportionSum) *
              this.callStack.parentProgressRange
      );
    } else {
      while (
        this.callStack !== null &&
        this.callStack.loop === false &&
        this.callStack.index === this.callStack.actions.length - 1
      ) {
        for (var i = 0; i < this.callStack.finalizers.length; ++i) {
          this.callStack.finalizers[i](this);
        }
        this.callStack = this.callStack.parent;
      }
      if (this.callStack !== null) {
        if (this.callStack.loop === false) {
          this.callStack.loopProgress = 0;
          this.callStack.index += 1;
        }
      } else {
        this.completed = true;
      }
    }
  }
  this.intervalStartTime = null;
  this.intervalEndTime = null;
  this.intervalStepIteration = null;

  if (this.progressUpdater !== null) this.progressUpdater(this);

  this.intervalIteration += 1;
  if (this.canceled) {
    while (this.callStack !== null) {
      for (var i = 0; i < this.callStack.finalizers.length; ++i) {
        this.callStack.finalizers[i](this);
      }
      this.callStack = this.callStack.parent;
    }
  } else if (!this.completed) {
    window.setTimeout(this.step.bind(this), this.sleepInterval);
  }
};

SteppedAction.prototype.beginSubactions = function (
  parentProgress,
  parentProgressRange
) {
  this.callStack = {
    actions: this.subactions,
    finalizers: this.finalizers,
    proportionSum: accumulateArray(
      this.subactions,
      0,
      function (sum, subaction) {
        return sum + subaction.proportion;
      }
    ),
    index: 0,
    loop: false,
    loopProgress: 0,
    parent: this.callStack,
    parentProgress: parentProgress,
    parentProgressRange: parentProgressRange,
  };
  this.subactions = [];
  this.finalizers = [];
};

SteppedAction.prototype.cancel = function SteppedAction_cancel() {
  this.canceled = true;
};

SteppedAction.prototype.provideResult = function SteppedAction_provideResult(
  resultProvider
) {
  this.callStack.resultProvider = resultProvider;
};

SteppedAction.prototype.loop = function SteppedAction_loop(progress) {
  this.callStack.loop = true;
  if (typeof progress === "number" && progress >= 0 && progress < 1) {
    this.callStack.loopProgress = progress;
  }
};

SteppedAction.prototype.executeSubaction =
  function SteppedAction_executeSubaction(subaction, proportion, name) {
    proportion =
      typeof proportion === "number" && proportion >= 0 ? proportion : 1;
    this.subactions.push({
      action: subaction,
      proportion: proportion,
      name: name,
    });
    return this;
  };

SteppedAction.prototype.getResult = function SteppedAction_getResult(
  recipient
) {
  this.subactions.push({
    action: function (action) {
      var resultProvider = action.callStack.resultProvider;
      var resultProviderType = typeof resultProvider;
      if (resultProviderType === "function") recipient(resultProvider());
      else if (resultProviderType !== "undefined") recipient(resultProvider);
      else recipient();
    },
    proportion: 0,
  });
  return this;
};

SteppedAction.prototype.finalize = function SteppedAction_finalize(finalizer) {
  this.finalizers.push(finalizer);
  return this;
};

SteppedAction.prototype.getTimeRemainingInInterval =
  function SteppedAction_getTimeRemainingInInterval() {
    if (this.intervalEndTime !== null) {
      return Math.max(0, this.intervalEndTime - Date.now());
    } else {
      return 0;
    }
  };

SteppedAction.prototype.getProgress = function SteppedAction_getProgress() {
  if (this.callStack !== null) {
    if (this.callStack.proportionSum === 0)
      return this.callStack.parentProgress;

    var currentProportionSum = 0;
    for (var i = 0; i < this.callStack.index; ++i) {
      currentProportionSum += this.callStack.actions[i].proportion;
    }
    currentProportionSum +=
      this.callStack.loopProgress *
      this.callStack.actions[this.callStack.index].proportion;
    return (
      this.callStack.parentProgress +
      (currentProportionSum / this.callStack.proportionSum) *
        this.callStack.parentProgressRange
    );
  } else {
    return this.completed ? 1 : 0;
  }
};

SteppedAction.prototype.getCurrentActionName =
  function SteppedAction_getCurrentActionName() {
    var callStack = this.callStack;
    while (callStack !== null) {
      var action = callStack.actions[callStack.index];
      if (typeof action.name === "string") return action.name;
      callStack = callStack.parent;
    }

    return "";
  };

var lastRenderFrameTime = null;

function getZoomDelta() {
  var zoomIn = pressedKeys[KEY_NUMPAD_PLUS] || pressedKeys[KEY_PAGEUP];
  var zoomOut = pressedKeys[KEY_NUMPAD_MINUS] || pressedKeys[KEY_PAGEDOWN];
  if (zoomIn && !zoomOut) return -1;
  if (zoomOut && !zoomIn) return +1;
  return 0;
}

function getLatitudeDelta() {
  var up = pressedKeys[KEY.W] || pressedKeys[KEY.Z] || pressedKeys[KEY_UPARROW];
  var down = pressedKeys[KEY.S] || pressedKeys[KEY_DOWNARROW];
  if (up && !down) return +1;
  if (down && !up) return -1;
  return 0;
}

function getLongitudeDelta() {
  var left =
    pressedKeys[KEY.A] || pressedKeys[KEY.Q] || pressedKeys[KEY_LEFTARROW];
  var right = pressedKeys[KEY.D] || pressedKeys[KEY_RIGHTARROW];
  if (right && !left) return +1;
  if (left && !right) return -1;
  return 0;
}

function render() {
  var currentRenderFrameTime = Date.now();
  var frameDuration =
    lastRenderFrameTime !== null
      ? (currentRenderFrameTime - lastRenderFrameTime) * 0.001
      : 0;

  var cameraNeedsUpdated = false;
  if (zoomAnimationStartTime !== null) {
    if (
      zoomAnimationStartTime + zoomAnimationDuration <=
      currentRenderFrameTime
    ) {
      zoom = zoomAnimationEndValue;
      zoomAnimationStartTime = null;
      zoomAnimationDuration = null;
      zoomAnimationStartValue = null;
      zoomAnimationEndValue = null;
    } else {
      zoomAnimationProgress =
        (currentRenderFrameTime - zoomAnimationStartTime) /
        zoomAnimationDuration;
      zoom =
        (zoomAnimationEndValue - zoomAnimationStartValue) *
          zoomAnimationProgress +
        zoomAnimationStartValue;
    }
    cameraNeedsUpdated = true;
  }

  var cameraZoomDelta = getZoomDelta();
  if (frameDuration > 0 && cameraZoomDelta !== 0) {
    zoom = Math.max(
      0,
      Math.min(zoom + frameDuration * cameraZoomDelta * 0.5, 1)
    );
    cameraNeedsUpdated = true;
  }

  var cameraLatitudeDelta = getLatitudeDelta();
  if (frameDuration > 0 && cameraLatitudeDelta !== 0) {
    cameraLatitude +=
      frameDuration *
      -cameraLatitudeDelta *
      Math.PI *
      (zoom * 0.5 + ((1 - zoom) * 1) / 20);
    cameraLatitude = Math.max(
      -Math.PI * 0.49,
      Math.min(cameraLatitude, Math.PI * 0.49)
    );
    cameraNeedsUpdated = true;
  }

  var cameraLongitudeDelta = getLongitudeDelta();
  if (frameDuration > 0 && cameraLongitudeDelta !== 0) {
    cameraLongitude +=
      frameDuration *
      cameraLongitudeDelta *
      Math.PI *
      ((zoom * Math.PI) / 8 +
        (1 - zoom) / (20 * Math.max(Math.cos(cameraLatitude), 0.1)));
    cameraLongitude =
      cameraLongitude -
      Math.floor(cameraLongitude / (Math.PI * 2)) * Math.PI * 2;
    cameraNeedsUpdated = true;
  }

  if (cameraNeedsUpdated) updateCamera();

  var sunTime = (Math.PI * 2 * currentRenderFrameTime) / 60000 + sunTimeOffset;
  directionalLight.position
    .set(Math.cos(sunTime), 0, Math.sin(sunTime))
    .normalize();

  requestAnimationFrame(render);
  renderer.render(scene, camera);

  lastRenderFrameTime = currentRenderFrameTime;
}

function resizeHandler() {
  updateCamera();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function resetCamera() {
  zoom = 1.0;
  zoomAnimationStartTime = null;
  zoomAnimationDuration = null;
  zoomAnimationStartValue = null;
  zoomAnimationEndValue = null;
  cameraLatitude = 0;
  cameraLongitude = 0;
}

function updateCamera() {
  camera.aspect = window.innerWidth / window.innerHeight;

  var transformation = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(cameraLatitude, cameraLongitude, 0, "YXZ")
  );
  camera.position.set(0, -50, 1050);
  camera.position.lerp(new Vector3(0, 0, 2000), Math.pow(zoom, 2.0));
  camera.position.applyMatrix4(transformation);
  camera.up.set(0, 1, 0);
  camera.up.applyMatrix4(transformation);
  camera.lookAt(new Vector3(0, 0, 1000).applyMatrix4(transformation));
  camera.updateProjectionMatrix();
}

function zoomHandler(event) {
  if (zoomAnimationStartTime === null) {
    zoomAnimationStartTime = Date.now();
    zoomAnimationStartValue = zoom;
    zoomAnimationEndValue = Math.max(
      0,
      Math.min(zoomAnimationStartValue - event.deltaY * 0.04, 1)
    );
    zoomAnimationDuration =
      Math.abs(zoomAnimationStartValue - zoomAnimationEndValue) * 1000;
  } else {
    zoomAnimationStartTime = Date.now();
    zoomAnimationStartValue = zoom;
    zoomAnimationEndValue = Math.max(
      0,
      Math.min(zoomAnimationEndValue - event.deltaY * 0.04, 1)
    );
    zoomAnimationDuration =
      Math.abs(zoomAnimationStartValue - zoomAnimationEndValue) * 1000;
  }
}

function selectTile(tile) {
  if (tileSelection !== null) {
    if (tileSelection.tile === tile) return;
    deselectTile();
  }

  console.log(tile);

  var outerColor = new THREE.Color(0x000000);
  var innerColor = new THREE.Color(0xffffff);

  var geometry = new THREE.Geometry();

  geometry.vertices.push(tile.averagePosition);
  for (var i = 0; i < tile.corners.length; ++i) {
    geometry.vertices.push(tile.corners[i].position);
    geometry.faces.push(
      new THREE.Face3(
        i + 1,
        ((i + 1) % tile.corners.length) + 1,
        0,
        tile.normal,
        [outerColor, outerColor, innerColor]
      )
    );
  }

  geometry.boundingSphere = tile.boundingSphere.clone();

  var material = new THREE.MeshLambertMaterial({
    vertexColors: THREE.VertexColors,
  });
  material.transparent = true;
  material.opacity = 0.5;
  material.polygonOffset = true;
  material.polygonOffsetFactor = -2;
  material.polygonOffsetUnits = -2;
  tileSelection = {
    tile: tile,
    renderObject: new THREE.Mesh(geometry, material),
  };
  planet.renderData.surface.renderObject.add(tileSelection.renderObject);
}

function deselectTile() {
  if (tileSelection !== null) {
    planet.renderData.surface.renderObject.remove(tileSelection.renderObject);
    tileSelection = null;
  }
}

function clickHandler(event) {
  if (planet) {
    var x = (event.pageX / renderer.domElement.width) * 2 - 1;
    var y = 1 - (event.pageY / renderer.domElement.height) * 2;
    var rayCaster = projector.pickingRay(new Vector3(x, y, 0), camera);
    var intersection = planet.partition.intersectRay(rayCaster.ray);
    if (intersection !== false) selectTile(intersection);
    else deselectTile();
  }
}

function keyDownHandler(event) {
  if (disableKeys === true) return;

  switch (event.which) {
    case KEY.W:
    case KEY.A:
    case KEY.S:
    case KEY.D:
    case KEY.Z:
    case KEY.Q:
    case KEY_LEFTARROW:
    case KEY_RIGHTARROW:
    case KEY_UPARROW:
    case KEY_DOWNARROW:
    case KEY_PAGEUP:
    case KEY_PAGEDOWN:
    case KEY_NUMPAD_PLUS:
    case KEY_NUMPAD_MINUS:
      pressedKeys[event.which] = true;
      event.preventDefault();
      break;
  }
}

function keyUpHandler(event) {
  if (disableKeys === true) return;

  switch (event.which) {
    case KEY.W:
    case KEY.A:
    case KEY.S:
    case KEY.D:
    case KEY.Z:
    case KEY.Q:
    case KEY_LEFTARROW:
    case KEY_RIGHTARROW:
    case KEY_UPARROW:
    case KEY_DOWNARROW:
    case KEY_PAGEUP:
    case KEY_PAGEDOWN:
    case KEY_NUMPAD_PLUS:
    case KEY_NUMPAD_MINUS:
      pressedKeys[event.which] = false;
      event.preventDefault();
      break;
    case KEY_ESCAPE:
      if (activeAction !== null) {
        ui.progressCancelButton.click();
        event.preventDefault();
      }
      break;
    case KEY_FORWARD_SLASH:
    case KEY["0"]:
      showHideInterface();
      event.preventDefault();
      break;
    case KEY_SPACE:
      generatePlanetAsynchronous();
      event.preventDefault();
      break;
    case KEY["1"]:
      setSubdivisions(20);
      generatePlanetAsynchronous();
      event.preventDefault();
      break;
    case KEY["2"]:
      setSubdivisions(40);
      generatePlanetAsynchronous();
      event.preventDefault();
      break;
    case KEY["3"]:
      setSubdivisions(60);
      generatePlanetAsynchronous();
      event.preventDefault();
      break;
    case KEY["5"]:
      setSurfaceRenderMode("terrain");
      event.preventDefault();
      break;
    case KEY["6"]:
      setSurfaceRenderMode("plates");
      event.preventDefault();
      break;
    case KEY["7"]:
      setSurfaceRenderMode("elevation");
      event.preventDefault();
      break;
    case KEY["8"]:
      setSurfaceRenderMode("temperature");
      event.preventDefault();
      break;
    case KEY["9"]:
      setSurfaceRenderMode("moisture");
      event.preventDefault();
      break;
    case KEY.U:
      showHideSunlight();
      event.preventDefault();
      break;
    case KEY.I:
      showHidePlateBoundaries();
      event.preventDefault();
      break;
    case KEY.O:
      showHidePlateMovements();
      event.preventDefault();
      break;
    case KEY.P:
      showHideAirCurrents();
      event.preventDefault();
      break;
  }
}

function cancelButtonHandler() {
  if (activeAction !== null) {
    activeAction.cancel();
  }
}

function displayPlanet(newPlanet) {
  if (planet) {
    tileSelection = null;
    scene.remove(planet.renderData.surface.renderObject);
  } else {
    sunTimeOffset = Math.PI * 2 * (1 / 12 - Date.now() / 60000);
  }

  planet = newPlanet;
  scene.add(planet.renderData.surface.renderObject);

  setSurfaceRenderMode(surfaceRenderMode, true);
  showHideSunlight(renderSunlight);
  showHidePlateBoundaries(renderPlateBoundaries);
  showHidePlateMovements(renderPlateMovements);
  showHideAirCurrents(renderAirCurrents);

  updateCamera();
  updateUI();

  console.log("Original Seed", planet.originalSeed);
  console.log("Raw Seed", planet.seed);
  console.log("Statistics", planet.statistics);
}

function showHideInterface() {
  ui.helpPanel.toggle();
  ui.controlPanel.toggle();
  ui.dataPanel.toggle();
  ui.updatePanel.toggle();
}

function updateUI() {
  ui.tileCountLabel.text(planet.statistics.tiles.count.toFixed(0));
  ui.pentagonCountLabel.text(planet.statistics.tiles.pentagonCount.toFixed(0));
  ui.hexagonCountLabel.text(planet.statistics.tiles.hexagonCount.toFixed(0));
  ui.heptagonCountLabel.text(planet.statistics.tiles.heptagonCount.toFixed(0));
  ui.plateCountLabel.text(planet.statistics.plates.count.toFixed(0));
  ui.waterPercentageLabel.text(
    (
      ((planet.statistics.tiles.biomeAreas["ocean"] +
        planet.statistics.tiles.biomeAreas["oceanGlacier"]) /
        planet.statistics.tiles.totalArea) *
      100
    ).toFixed(0) + "%"
  );

  ui.rawSeedLabel.val(planet.seed);
  ui.originalSeedLabel.val(
    planet.originalSeed !== null ? planet.originalSeed : ""
  );

  ui.minAirCurrentSpeedLabel.text(
    planet.statistics.corners.airCurrent.min.toFixed(0)
  );
  ui.avgAirCurrentSpeedLabel.text(
    planet.statistics.corners.airCurrent.avg.toFixed(0)
  );
  ui.maxAirCurrentSpeedLabel.text(
    planet.statistics.corners.airCurrent.max.toFixed(0)
  );

  ui.minElevationLabel.text(
    (planet.statistics.tiles.elevation.min * 100).toFixed(0)
  );
  ui.avgElevationLabel.text(
    (planet.statistics.tiles.elevation.avg * 100).toFixed(0)
  );
  ui.maxElevationLabel.text(
    (planet.statistics.tiles.elevation.max * 100).toFixed(0)
  );

  ui.minTemperatureLabel.text(
    (planet.statistics.tiles.temperature.min * 100).toFixed(0)
  );
  ui.avgTemperatureLabel.text(
    (planet.statistics.tiles.temperature.avg * 100).toFixed(0)
  );
  ui.maxTemperatureLabel.text(
    (planet.statistics.tiles.temperature.max * 100).toFixed(0)
  );

  ui.minMoistureLabel.text(
    (planet.statistics.tiles.moisture.min * 100).toFixed(0)
  );
  ui.avgMoistureLabel.text(
    (planet.statistics.tiles.moisture.avg * 100).toFixed(0)
  );
  ui.maxMoistureLabel.text(
    (planet.statistics.tiles.moisture.max * 100).toFixed(0)
  );

  ui.minPlateMovementSpeedLabel.text(
    planet.statistics.tiles.plateMovement.min.toFixed(0)
  );
  ui.avgPlateMovementSpeedLabel.text(
    planet.statistics.tiles.plateMovement.avg.toFixed(0)
  );
  ui.maxPlateMovementSpeedLabel.text(
    planet.statistics.tiles.plateMovement.max.toFixed(0)
  );

  ui.minTileAreaLabel.text(planet.statistics.tiles.area.min.toFixed(0));
  ui.avgTileAreaLabel.text(planet.statistics.tiles.area.avg.toFixed(0));
  ui.maxTileAreaLabel.text(planet.statistics.tiles.area.max.toFixed(0));

  ui.minPlateAreaLabel.text(
    (planet.statistics.plates.area.min / 1000).toFixed(0) + "K"
  );
  ui.avgPlateAreaLabel.text(
    (planet.statistics.plates.area.avg / 1000).toFixed(0) + "K"
  );
  ui.maxPlateAreaLabel.text(
    (planet.statistics.plates.area.max / 1000).toFixed(0) + "K"
  );

  ui.minPlateCircumferenceLabel.text(
    planet.statistics.plates.circumference.min.toFixed(0)
  );
  ui.avgPlateCircumferenceLabel.text(
    planet.statistics.plates.circumference.avg.toFixed(0)
  );
  ui.maxPlateCircumferenceLabel.text(
    planet.statistics.plates.circumference.max.toFixed(0)
  );
}

function updateProgressUI(action) {
  var progress = action.getProgress();
  ui.progressBar.css("width", (progress * 100).toFixed(0) + "%");
  ui.progressBarLabel.text((progress * 100).toFixed(0) + "%");
  ui.progressActionLabel.text(action.getCurrentActionName());
}

function setSurfaceRenderMode(mode, force) {
  if (mode !== surfaceRenderMode || force === true) {
    $("#surfaceDisplayList>button").removeClass("toggled");
    ui.surfaceDisplayButtons[mode].addClass("toggled");

    surfaceRenderMode = mode;

    if (!planet) return;

    var colors;
    if (mode === "terrain") colors = planet.renderData.surface.terrainColors;
    else if (mode === "plates") colors = planet.renderData.surface.plateColors;
    else if (mode === "elevation")
      colors = planet.renderData.surface.elevationColors;
    else if (mode === "temperature")
      colors = planet.renderData.surface.temperatureColors;
    else if (mode === "moisture")
      colors = planet.renderData.surface.moistureColors;
    else return;

    var faces = planet.renderData.surface.geometry.faces;
    for (var i = 0; i < faces.length; ++i) faces[i].vertexColors = colors[i];

    planet.renderData.surface.geometry.colorsNeedUpdate = true;
  }
}

function showHideSunlight(show) {
  if (typeof show === "boolean") renderSunlight = show;
  else renderSunlight = !renderSunlight;
  if (renderSunlight) ui.showSunlightButton.addClass("toggled");
  if (!renderSunlight) ui.showSunlightButton.removeClass("toggled");

  if (!planet) return;

  var material = planet.renderData.surface.material;
  if (renderSunlight) {
    material.color = new THREE.Color(0xffffff);
    material.ambient = new THREE.Color(0x444444);
  } else {
    material.color = new THREE.Color(0x000000);
    material.ambient = new THREE.Color(0xffffff);
  }
  material.needsUpdate = true;
}

function showHidePlateBoundaries(show) {
  if (typeof show === "boolean") renderPlateBoundaries = show;
  else renderPlateBoundaries = !renderPlateBoundaries;
  if (renderPlateBoundaries) ui.showPlateBoundariesButton.addClass("toggled");
  if (!renderPlateBoundaries)
    ui.showPlateBoundariesButton.removeClass("toggled");

  if (!planet) return;

  if (renderPlateBoundaries)
    planet.renderData.surface.renderObject.add(
      planet.renderData.plateBoundaries.renderObject
    );
  else
    planet.renderData.surface.renderObject.remove(
      planet.renderData.plateBoundaries.renderObject
    );
}

function showHidePlateMovements(show) {
  if (typeof show === "boolean") renderPlateMovements = show;
  else renderPlateMovements = !renderPlateMovements;
  if (renderPlateMovements) ui.showPlateMovementsButton.addClass("toggled");
  if (!renderPlateMovements) ui.showPlateMovementsButton.removeClass("toggled");

  if (!planet) return;

  if (renderPlateMovements)
    planet.renderData.surface.renderObject.add(
      planet.renderData.plateMovements.renderObject
    );
  else
    planet.renderData.surface.renderObject.remove(
      planet.renderData.plateMovements.renderObject
    );
}

function showHideAirCurrents(show) {
  if (typeof show === "boolean") renderAirCurrents = show;
  else renderAirCurrents = !renderAirCurrents;
  if (renderAirCurrents) ui.showAirCurrentsButton.addClass("toggled");
  if (!renderAirCurrents) ui.showAirCurrentsButton.removeClass("toggled");

  if (!planet) return;

  if (renderAirCurrents)
    planet.renderData.surface.renderObject.add(
      planet.renderData.airCurrents.renderObject
    );
  else
    planet.renderData.surface.renderObject.remove(
      planet.renderData.airCurrents.renderObject
    );
}

function serializePlanetMesh(mesh, prefix, suffix) {
  var stringPieces = [];

  stringPieces.push(prefix, "{nodes:[");
  for (var i = 0; i < mesh.nodes.length; ++i) {
    var node = mesh.nodes[i];
    stringPieces.push(
      i !== 0 ? ",\n{p:new THREE.Vector3(" : "\n{p:new THREE.Vector3(",
      node.p.x.toString(),
      ",",
      node.p.y.toString(),
      ",",
      node.p.z.toString(),
      "),e:[",
      node.e[0].toFixed(0)
    );
    for (var j = 1; j < node.e.length; ++j)
      stringPieces.push(",", node.e[j].toFixed(0));
    stringPieces.push("],f:[", node.f[0].toFixed(0));
    for (var j = 1; j < node.f.length; ++j)
      stringPieces.push(",", node.f[j].toFixed(0));
    stringPieces.push("]}");
  }
  stringPieces.push("\n],edges:[");
  for (var i = 0; i < mesh.edges.length; ++i) {
    var edge = mesh.edges[i];
    stringPieces.push(
      i !== 0 ? ",\n{n:[" : "\n{n:[",
      edge.n[0].toFixed(0),
      ",",
      edge.n[1].toFixed(0),
      "],f:[",
      edge.f[0].toFixed(0),
      ",",
      edge.f[1].toFixed(0),
      "]}"
    );
  }
  stringPieces.push("\n],faces:[");
  for (var i = 0; i < mesh.faces.length; ++i) {
    var face = mesh.faces[i];
    stringPieces.push(
      i !== 0 ? ",\n{n:[" : "\n{n:[",
      face.n[0].toFixed(0),
      ",",
      face.n[1].toFixed(0),
      ",",
      face.n[2].toFixed(0),
      "],e:[",
      face.e[0].toFixed(0),
      ",",
      face.e[1].toFixed(0),
      ",",
      face.e[2].toFixed(0),
      "]}"
    );
  }
  stringPieces.push("\n]}", suffix);

  return stringPieces.join("");
}

function Corner(id, position, cornerCount, borderCount, tileCount) {
  this.id = id;
  this.position = position;
  this.corners = new Array(cornerCount);
  this.borders = new Array(borderCount);
  this.tiles = new Array(tileCount);
}

Corner.prototype.vectorTo = function Corner_vectorTo(corner) {
  return corner.position.clone().sub(this.position);
};

Corner.prototype.toString = function Corner_toString() {
  return (
    "Corner " +
    this.id.toFixed(0) +
    " < " +
    this.position.x.toFixed(0) +
    ", " +
    this.position.y.toFixed(0) +
    ", " +
    this.position.z.toFixed(0) +
    " >"
  );
};

function Border(id, cornerCount, borderCount, tileCount) {
  this.id = id;
  this.corners = new Array(cornerCount);
  this.borders = new Array(borderCount);
  this.tiles = new Array(tileCount);
}

Border.prototype.oppositeCorner = function Border_oppositeCorner(corner) {
  return this.corners[0] === corner ? this.corners[1] : this.corners[0];
};

Border.prototype.oppositeTile = function Border_oppositeTile(tile) {
  return this.tiles[0] === tile ? this.tiles[1] : this.tiles[0];
};

Border.prototype.length = function Border_length() {
  return this.corners[0].position.distanceTo(this.corners[1].position);
};

Border.prototype.isLandBoundary = function Border_isLandBoundary() {
  return this.tiles[0].elevation > 0 !== this.tiles[1].elevation > 0;
};

Border.prototype.toString = function Border_toString() {
  return "Border " + this.id.toFixed(0);
};

function Tile(id, position, cornerCount, borderCount, tileCount) {
  this.id = id;
  this.position = position;
  this.corners = new Array(cornerCount);
  this.borders = new Array(borderCount);
  this.tiles = new Array(tileCount);
}

Tile.prototype.intersectRay = function Tile_intersectRay(ray) {
  if (!intersectRayWithSphere(ray, this.boundingSphere)) return false;

  var surface = new THREE.Plane().setFromNormalAndCoplanarPoint(
    this.normal,
    this.averagePosition
  );
  if (surface.distanceToPoint(ray.origin) <= 0) return false;

  var denominator = surface.normal.dot(ray.direction);
  if (denominator === 0) return false;

  var t = -(ray.origin.dot(surface.normal) + surface.constant) / denominator;
  var point = ray.direction.clone().multiplyScalar(t).add(ray.origin);

  var origin = new Vector3(0, 0, 0);
  for (var i = 0; i < this.corners.length; ++i) {
    var j = (i + 1) % this.corners.length;
    var side = new THREE.Plane().setFromCoplanarPoints(
      this.corners[j].position,
      this.corners[i].position,
      origin
    );

    if (side.distanceToPoint(point) < 0) return false;
  }

  return true;
};

Tile.prototype.toString = function Tile_toString() {
  return (
    "Tile " +
    this.id.toFixed(0) +
    " (" +
    this.tiles.length.toFixed(0) +
    " Neighbors) < " +
    this.position.x.toFixed(0) +
    ", " +
    this.position.y.toFixed(0) +
    ", " +
    this.position.z.toFixed(0) +
    " >"
  );
};

function Plate(
  color,
  driftAxis,
  driftRate,
  spinRate,
  elevation,
  oceanic,
  root
) {
  this.color = color;
  this.driftAxis = driftAxis;
  this.driftRate = driftRate;
  this.spinRate = spinRate;
  this.elevation = elevation;
  this.oceanic = oceanic;
  this.root = root;
  this.tiles = [];
  this.boundaryCorners = [];
  this.boundaryBorders = [];
}

Plate.prototype.calculateMovement = function Plate_calculateMovement(position) {
  var movement = this.driftAxis
    .clone()
    .cross(position)
    .setLength(
      this.driftRate *
        position.clone().projectOnVector(this.driftAxis).distanceTo(position)
    );
  movement.add(
    this.root.position
      .clone()
      .cross(position)
      .setLength(
        this.spinRate *
          position
            .clone()
            .projectOnVector(this.root.position)
            .distanceTo(position)
      )
  );
  return movement;
};

function SpatialPartition(boundingSphere, partitions, tiles) {
  this.boundingSphere = boundingSphere;
  this.partitions = partitions;
  this.tiles = tiles;
}

SpatialPartition.prototype.intersectRay =
  function SpatialPartition_intersectRay(ray) {
    if (intersectRayWithSphere(ray, this.boundingSphere)) {
      for (var i = 0; i < this.partitions.length; ++i) {
        var intersection = this.partitions[i].intersectRay(ray);
        if (intersection !== false) {
          return intersection;
        }
      }

      for (var i = 0; i < this.tiles.length; ++i) {
        if (this.tiles[i].intersectRay(ray)) {
          return this.tiles[i];
        }
      }
    }

    return false;
  };

////////////////////////////////////////////////////////////////////////////////
// UTILITIES                                                                  //
////////////////////////////////////////////////////////////////////////////////

function Signal() {
  this.nextToken = 1;
  this.listeners = {};
}

Signal.prototype.addListener = function Signal_addListener(callback, token) {
  if (typeof token !== "string") {
    token = this.nextToken.toFixed(0);
    this.nextToken += 1;
  }
  this.listeners[token] = callback;
};

Signal.prototype.removeListener = function Signal_removeListener(token) {
  delete this.listeners[token];
};

Signal.prototype.fire = function Signal_fire() {
  for (var key in this.listeners) {
    if (this.listeners.hasOwnProperty(key)) {
      this.listeners[key].apply(null, arguments);
    }
  }
};

function XorShift128(x, y, z, w) {
  this.x = x ? x >>> 0 : 123456789;
  this.y = y ? y >>> 0 : 362436069;
  this.z = z ? z >>> 0 : 521288629;
  this.w = w ? w >>> 0 : 88675123;
}

XorShift128.prototype.next = function XorShift128_next() {
  var t = this.x ^ ((this.x << 11) & 0x7fffffff);
  this.x = this.y;
  this.y = this.z;
  this.z = this.w;
  this.w = this.w ^ (this.w >> 19) ^ (t ^ (t >> 8));
  return this.w;
};

XorShift128.prototype.unit = function XorShift128_unit() {
  return this.next() / 0x80000000;
};

XorShift128.prototype.unitInclusive = function XorShift128_unitInclusive() {
  return this.next() / 0x7fffffff;
};

XorShift128.prototype.integer = function XorShift128_integer(min, max) {
  return this.integerExclusive(min, max + 1);
};

XorShift128.prototype.integerExclusive = function XorShift128_integerExclusive(
  min,
  max
) {
  min = Math.floor(min);
  max = Math.floor(max);
  return Math.floor(this.unit() * (max - min)) + min;
};

XorShift128.prototype.real = function XorShift128_real(min, max) {
  return this.unit() * (max - min) + min;
};

XorShift128.prototype.realInclusive = function XorShift128_realInclusive(
  min,
  max
) {
  return this.unitInclusive() * (max - min) + min;
};

XorShift128.prototype.reseed = function XorShift128_reseed(x, y, z, w) {
  this.x = x ? x >>> 0 : 123456789;
  this.y = y ? y >>> 0 : 362436069;
  this.z = z ? z >>> 0 : 521288629;
  this.w = w ? w >>> 0 : 88675123;
};

function saveToFileSystem(content) {
  var requestFileSystem =
    window.requestFileSystem || window.webkitRequestFileSystem;

  requestFileSystem(
    window.TEMPORARY,
    content.length,
    function (fs) {
      fs.root.getFile(
        "planetMesh.js",
        { create: true },
        function (fileEntry) {
          fileEntry.createWriter(
            function (fileWriter) {
              fileWriter.addEventListener(
                "writeend",
                function () {
                  $("body").append(
                    '<a href="' +
                      fileEntry.toURL() +
                      '" download="planetMesh.js" target="_blank">Mesh Data</a>'
                  );
                  $("body>a").focus();
                },
                false
              );

              fileWriter.write(new Blob([content]));
            },
            function (error) {}
          );
        },
        function (error) {}
      );
    },
    function (error) {}
  );
}

function slerp(p0, p1, t) {
  var omega = Math.acos(p0.dot(p1));
  return p0
    .clone()
    .multiplyScalar(Math.sin((1 - t) * omega))
    .add(p1.clone().multiplyScalar(Math.sin(t * omega)))
    .divideScalar(Math.sin(omega));
}

function randomUnitVector(random) {
  var theta = random.real(0, Math.PI * 2);
  var phi = Math.acos(random.realInclusive(-1, 1));
  var sinPhi = Math.sin(phi);
  return new Vector3(
    Math.cos(theta) * sinPhi,
    Math.sin(theta) * sinPhi,
    Math.cos(phi)
  );
}

function randomQuaternion(random) {
  var theta = random.real(0, Math.PI * 2);
  var phi = Math.acos(random.realInclusive(-1, 1));
  var sinPhi = Math.sin(phi);
  var gamma = random.real(0, Math.PI * 2);
  var sinGamma = Math.sin(gamma);
  return new Quaternion(
    Math.cos(theta) * sinPhi * sinGamma,
    Math.sin(theta) * sinPhi * sinGamma,
    Math.cos(phi) * sinGamma,
    Math.cos(gamma)
  );
}

function intersectRayWithSphere(ray, sphere) {
  var v1 = sphere.center.clone().sub(ray.origin);
  var v2 = v1.clone().projectOnVector(ray.direction);
  var d = v1.distanceTo(v2);
  return d <= sphere.radius;
}

function calculateTriangleArea(pa, pb, pc) {
  var vab = new THREE.Vector3().subVectors(pb, pa);
  var vac = new THREE.Vector3().subVectors(pc, pa);
  var faceNormal = new THREE.Vector3().crossVectors(vab, vac);
  var vabNormal = new THREE.Vector3().crossVectors(faceNormal, vab).normalize();
  var plane = new THREE.Plane().setFromNormalAndCoplanarPoint(vabNormal, pa);
  var height = plane.distanceToPoint(pc);
  var width = vab.length();
  var area = width * height * 0.5;
  return area;
}

function accumulateArray(array, state, accumulator) {
  for (var i = 0; i < array.length; ++i) {
    state = accumulator(state, array[i]);
  }
  return state;
}

function adjustRange(value, oldMin, oldMax, newMin, newMax) {
  return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
}

//Adapted from http://stackoverflow.com/a/7616484/3874364
function hashString(s) {
  var hash = 0;
  var length = s.length;
  if (length === 0) return hash;
  for (var i = 0; i < length; ++i) {
    var character = s.charCodeAt(1);
    hash = (hash << 5) - hash + character;
    hash |= 0;
  }
  return hash;
}
