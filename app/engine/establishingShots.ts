// app/engine/establishingShots.ts

import type { DecisionContext } from "./types";

export function establishingShots(context: DecisionContext): DecisionContext {
  return {
    ...context,
    establishingShots: [
      {
        pathId: "A",
        title: "The TV becomes part of the room",
        shot:
          "You are sitting in the living room while a film plays on the new television. The picture is sharp, the sound fills the room, and the screen feels settled into the space rather than newly argued for. The money has already left the account. What remains is the object in use.",
      },
      {
        pathId: "B",
        title: "The money remains available",
        shot:
          "You are sitting in the living room with the old setup still in place. The room has not changed, and the £2,000 remains in your account. The purchase is no longer pressing on the evening. The option is still there, but so is everything else that money could become.",
      },
    ],
  };
}