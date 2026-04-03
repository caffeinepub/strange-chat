import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";


// Explicitly specify the migration function before actor

actor {
  public type RoomCode = Nat;
  public type UserName = Text;
  public type Message = {
    sender : UserName;
    content : Text;
    timestamp : Time.Time;
  };

  public type Room = {
    participants : List.List<UserName>;
    messages : List.List<Message>;
  };

  var nextRoomCode = 100_000;

  let rooms = Map.empty<Nat, Room>();

  // User waiting for random match
  let matchmakingQueue = List.empty<Principal>();
  let users = Map.empty<Principal, UserName>();

  func generateRoomCode() : Nat {
    let code = nextRoomCode;
    nextRoomCode += 1;
    code;
  };

  public shared ({ caller }) func requestMatchmaking(roomCode : RoomCode) : async UserName {
    if (not users.containsKey(caller)) {
      Runtime.trap("User does not exist. ");
    };
    let newMatchmakingQueue = List.empty<Principal>();
    for (principal in matchmakingQueue.values()) {
      if (not principal.equal(caller)) {
        newMatchmakingQueue.add(principal);
      };
    };
    matchmakingQueue.clear();
    for (user in newMatchmakingQueue.values()) {
      matchmakingQueue.add(user);
    };
    if (users.containsKey(caller)) {
      Runtime.trap("User does not exist. ");
    };
    users.get(caller).unwrap();
  };

  public shared ({ caller }) func createRoom(name : UserName, roomCode : RoomCode) : async () {
    users.add(caller, name);
    let newRoom : Room = {
      participants = List.singleton(name);
      messages = List.empty<Message>();
    };
    rooms.add(roomCode, newRoom);
  };

  public shared ({ caller }) func joinRoom(name : UserName, roomCode : Nat) : async () {
    switch (rooms.get(roomCode)) {
      case (?room) {
        if (room.participants.size() >= 2) {
          Runtime.trap("Room is full. ");
        };
        let newRoom : Room = {
          participants = List.singleton(name);
          messages = room.messages;
        };
        users.add(caller, name);
        rooms.add(roomCode, newRoom);
      };
      case (null) { Runtime.trap("Room does not exist. ") };
    };
  };

  public shared ({ caller }) func sendMessage(roomCode : RoomCode, content : Text) : async () {
    let sender = users.get(caller).unwrap();
    switch (rooms.get(roomCode)) {
      case (?room) {
        let message : Message = {
          sender;
          content;
          timestamp = Time.now();
        };
        let newRoom : Room = {
          participants = room.participants;
          messages = List.singleton(message);
        };
        rooms.add(roomCode, newRoom);
      };
      case (null) { Runtime.trap("Room does not exist. ") };
    };
  };

  public query ({ caller }) func getRoomMessages(roomCode : Nat) : async [Message] {
    switch (rooms.get(roomCode)) {
      case (?room) { room.messages.toArray() };
      case (null) { Runtime.trap("Room does not exist. ") };
    };
  };

  public query ({ caller }) func checkMatchmakingStatus() : async ?Nat {
    null;
  };
};
