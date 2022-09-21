import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";


const client = createClient({
  publicApiKey: process.env.LIVEBLOCKS_API_KEY,
});

export const roomContext = createRoomContext<{
  position: { x: number, y: number, z: number }
}>(client);

const { RoomProvider, useOthers, useUpdateMyPresence  } = roomContext;

export { RoomProvider, useOthers, useUpdateMyPresence };
