import * as THREE from "three";
import { createPierPlants } from "./createPierPlants";
import { createTerraceRail } from "./createTerraceRail";
import { createStringLights } from "./createStringLights";
import { createHangingVines } from "./createHangingVines";

// Everything added onto the front terrace, in house model coordinates. The group lives
// outside <Center> (so it never changes how the house gets centered) and copies the
// house's world transform instead.
export function createTerrace(house) {
  const group = new THREE.Group();
  group.name = "Terrace";
  group.matrixAutoUpdate = false;

  const plants = createPierPlants(house); // null if the model ever changes
  const rail = createTerraceRail(house);
  const lights = createStringLights(rail.postTops);
  const vines = createHangingVines();
  const parts = [plants, rail, lights, vines].filter(Boolean);
  parts.forEach((part) => group.add(part.object));

  const lastHouseMatrix = new THREE.Matrix4();
  const toHouse = new THREE.Matrix4();
  const cameraInHouse = new THREE.Vector3();

  return {
    object: group,
    // time: seconds, night: 0 (day) .. 1 (night)
    update(camera, time, night) {
      // the group is a direct child of the scene: copy the house's world matrix
      if (!lastHouseMatrix.equals(house.matrixWorld)) {
        lastHouseMatrix.copy(house.matrixWorld);
        toHouse.copy(house.matrixWorld).invert();
        group.matrix.copy(house.matrixWorld);
        group.matrixWorldNeedsUpdate = true;
      }
      cameraInHouse.setFromMatrixPosition(camera.matrixWorld).applyMatrix4(toHouse);
      plants?.update(cameraInHouse, time);
      lights?.update(time, night);
      vines.update(time);
    },
    dispose() {
      parts.forEach((part) => part.dispose());
    },
  };
}
