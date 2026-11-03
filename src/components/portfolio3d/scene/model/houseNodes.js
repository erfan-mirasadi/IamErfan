// Nodes of the house model that code looks up by name at runtime. They have to stay
// separate meshes, so the loader never merges them (see loading/mergeStaticMeshes.js).
// Add a name here when a new component looks a node up.

// targets of the clickable markers (interactables/*)
export const INTERACTIVE_NODES = [
  "doorLock",
  "Plants",
  "Book",
  "BodyBulding",
  "Bike",
  "setar",
  "Project_1",
  "Project_2",
  "Project_3",
  "Project_4",
];

// the kitchen palm, copied onto the terrace (scene/outdoor/createPierPlants.js)
export const PALM_PLANTER = "PLANTER_TERRA_BASE_PLANTER_BOTTOM_CROSS_Mat_0001";
export const PALM_LEAVES = "LIVISTONA_CHINENSIS_LIVISTONA_CHINENSIS_Mat_0002";

export const KEEP_SEPARATE = [...INTERACTIVE_NODES, PALM_PLANTER, PALM_LEAVES];
