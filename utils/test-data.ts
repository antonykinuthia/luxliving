import { ChatRoom, Message, User } from "./types";

export const ChatRooms: ChatRoom[] = [
    {
        $id: "1",
        title: "Room 1",
        description: "Room 1 description",
        createdAt: new Date(),
        upDatedAt: new Date(),
        imageUrl: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
    },
    {
        $id: "2",
        title: "Room 2",
        description: "Room 2 description",
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
    },
];