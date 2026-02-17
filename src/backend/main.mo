import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization support
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /// TYPES
  type NoteId = Nat;
  type EventId = Nat;
  type Todo = {
    id : Nat;
    text : Text;
    completed : Bool;
  };

  public type Settings = {
    darkMode : Bool;
  };

  public type Note = {
    id : NoteId;
    title : Text;
    content : Text;
    created : Time.Time;
    lastModified : ?Time.Time;
    isPrivate : Bool;
  };

  module Note {
    public func compareByUpdatedAndCreated(note1 : Note, note2 : Note) : Order.Order {
      let note1Time = switch (note1.lastModified) {
        case (null) { note1.created };
        case (?lastModified) { lastModified };
      };
      let note2Time = switch (note2.lastModified) {
        case (null) { note2.created };
        case (?lastModified) { lastModified };
      };
      Int.compare(note2Time, note1Time);
    };
  };

  public type Event = {
    id : EventId;
    title : Text;
    description : Text;
    date : Time.Time;
    startTime : Nat;
    endTime : Nat;
    location : ?Text;
  };

  module Event {
    public func compareByTime(event1 : Event, event2 : Event) : Order.Order {
      Int.compare(event1.date, event2.date);
    };
  };

  /// STATE
  var nextNoteId = 1;
  var nextEventId = 1;

  let notes = Map.empty<Principal, Map.Map<NoteId, Note>>();
  let events = Map.empty<Principal, Map.Map<EventId, Event>>();
  let settings = Map.empty<Principal, Settings>();

  /// NOTES
  public shared ({ caller }) func createNote(title : Text, content : Text, isPrivate : Bool) : async NoteId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create notes");
    };
    let noteId = nextNoteId;
    nextNoteId += 1;
    let note : Note = {
      id = noteId;
      title;
      content;
      created = Time.now();
      lastModified = null;
      isPrivate;
    };

    let userNotes = switch (notes.get(caller)) {
      case (?existing) { existing };
      case (null) { Map.empty<NoteId, Note>() };
    };
    userNotes.add(noteId, note);
    notes.add(caller, userNotes);
    noteId;
  };

  public shared ({ caller }) func editNote(id : NoteId, title : Text, content : Text) : async Note {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can edit notes");
    };
    let userNotes = switch (notes.get(caller)) {
      case (?existing) { existing };
      case (null) { Runtime.trap("Note does not exist") };
    };
    let note = switch (userNotes.get(id)) {
      case (?note) { note };
      case (null) { Runtime.trap("Note does not exist") };
    };

    let updatedNote = {
      note with
      title;
      content;
      lastModified = ?Time.now();
    };
    userNotes.add(id, updatedNote);
    updatedNote;
  };

  public shared ({ caller }) func deleteNote(id : NoteId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete notes");
    };
    let userNotes = switch (notes.get(caller)) {
      case (?existing) { existing };
      case (null) { Runtime.trap("Note does not exist") };
    };
    userNotes.remove(id);
  };

  public query ({ caller }) func getNote(noteId : NoteId) : async Note {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view notes");
    };
    let userNotes = switch (notes.get(caller)) {
      case (?existing) { existing };
      case (null) { Runtime.trap("Note does not exist") };
    };
    switch (userNotes.get(noteId)) {
      case (null) { Runtime.trap("Note does not exist") };
      case (?note) { note };
    };
  };

  public query ({ caller }) func getAllNotes() : async [Note] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view notes");
    };
    switch (notes.get(caller)) {
      case (?userNotes) {
        userNotes.values().toArray().sort(Note.compareByUpdatedAndCreated);
      };
      case (null) { [] };
    };
  };

  /// EVENTS
  public shared ({ caller }) func createEvent(title : Text, description : Text, date : Time.Time, startTime : Nat, endTime : Nat, location : ?Text) : async Event {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create events");
    };
    let eventId = nextEventId;
    nextEventId += 1;
    let event : Event = {
      id = eventId;
      title;
      description;
      date;
      startTime;
      endTime;
      location;
    };

    let userEvents = switch (events.get(caller)) {
      case (?existing) { existing };
      case (null) { Map.empty<EventId, Event>() };
    };
    userEvents.add(eventId, event);
    events.add(caller, userEvents);
    event;
  };

  public shared ({ caller }) func deleteEvent(eventId : EventId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete events");
    };
    let userEvents = switch (events.get(caller)) {
      case (?existing) { existing };
      case (null) { Runtime.trap("Event does not exist") };
    };
    switch (userEvents.get(eventId)) {
      case (null) { Runtime.trap("Event does not exist") };
      case (?_) {
        userEvents.remove(eventId);
      };
    };
  };

  public query ({ caller }) func getEvent(eventId : EventId) : async Event {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view events");
    };
    let userEvents = switch (events.get(caller)) {
      case (?existing) { existing };
      case (null) { Runtime.trap("Event does not exist") };
    };
    switch (userEvents.get(eventId)) {
      case (null) { Runtime.trap("Event does not exist") };
      case (?event) { event };
    };
  };

  public query ({ caller }) func getEventsForDay(date : Time.Time) : async [Event] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view events");
    };
    let allEvents = switch (events.get(caller)) {
      case (?userEvents) {
        userEvents.values().toArray().sort(Event.compareByTime);
      };
      case (null) { [] };
    };

    allEvents.filter(func(event) { Int.compare(event.date, date) == #equal });
  };

  /// SETTINGS
  public query ({ caller }) func getUserSettings() : async Settings {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view settings");
    };
    switch (settings.get(caller)) {
      case (?userSettings) { userSettings };
      case (null) { Runtime.trap("No settings found") };
    };
  };

  public shared ({ caller }) func saveUserSettings(settings_ : Settings) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save settings");
    };
    settings.add(caller, settings_);
  };
};
