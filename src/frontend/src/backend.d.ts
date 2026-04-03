import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    sender: UserName;
    timestamp: Time;
}
export type RoomCode = bigint;
export type UserName = string;
export type Time = bigint;
export interface backendInterface {
    checkMatchmakingStatus(): Promise<bigint | null>;
    createRoom(name: UserName, roomCode: RoomCode): Promise<void>;
    getRoomMessages(roomCode: bigint): Promise<Array<Message>>;
    joinRoom(name: UserName, roomCode: bigint): Promise<void>;
    requestMatchmaking(roomCode: RoomCode): Promise<UserName>;
    sendMessage(roomCode: RoomCode, content: string): Promise<void>;
}
