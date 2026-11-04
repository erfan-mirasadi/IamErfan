import { Quaternion } from "three";

// The camera rotation of the scroll path (Theatre.js) without the cursor look-around
// on top. CameraDragOrbit writes it every frame; the night sky uses it so the moon and
// the stars stay where they are while the cursor turns the view, like a far backdrop.
export const cameraLook = { base: new Quaternion(), ready: false };
