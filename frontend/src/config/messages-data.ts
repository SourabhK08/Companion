export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  time: string;
  type?: "text" | "image" | "file";
  imageUrl?: string;
  fileName?: string;
  fileSize?: string;
}

export interface ConversationSummary {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  avatar?: string | null;
}

export const conversations: ConversationSummary[] = [
  { id: "c-1", name: "Ananya Sharma", lastMessage: "See you tomorrow! 😊", time: "10:24 AM", unread: 1, avatar: null },
  { id: "c-2", name: "Isha Verma", lastMessage: "Sure! That sounds great.", time: "Yesterday", unread: 2, avatar: null },
  { id: "c-3", name: "Rohan Das", lastMessage: "Looking forward to it!", time: "Yesterday", avatar: null },
  { id: "c-4", name: "Tiya Ghosh", lastMessage: "Thank you so much! 😊", time: "Jun 26", avatar: null },
  { id: "c-5", name: "Support Team", lastMessage: "Your verification completed.", time: "Jun 25", unread: 1, avatar: null },
];

export const messagesByConversation: Record<string, Message[]> = {
  "c-1": [
    { id: "m-1", senderId: "u-1", senderName: "Ananya Sharma", text: "See you tomorrow! 😊", time: "10:24 AM", type: "text" },
    { id: "m-2", senderId: "me", senderName: "Rahul Sharma", text: "Great! See you tomorrow! 😊", time: "09:24 AM", type: "text" },
    { id: "m-3", senderId: "u-1", senderName: "Ananya Sharma", text: "See you tomorrow! 😊", time: "10:24 AM", type: "text" },
    { id: "m-4", senderId: "u-1", senderName: "Ananya Sharma", text: undefined, time: "10:25 AM", type: "image", imageUrl: "/assets/cafe.jpg" },
  ],
};
