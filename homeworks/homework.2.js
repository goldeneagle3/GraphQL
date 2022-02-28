const { ApolloServer, gql } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core/dist/plugin/landingPage/graphqlPlayground");

const { remove } = require("lodash");
const { nanoid } = require("nanoid");
const { users, events, locations, participants } = require("../data.json");

const typeDefs = gql`
  # User
  type User {
    id: ID!
    username: String!
    email: String!
    events: [Event!]
  }

  input userInput {
    username: String!
    email: String!
  }

  # Event
  type Event {
    id: ID!
    title: String!
    desc: String!
    date: String!
    from: String
    to: String
    location_id: ID
    user: User
    user_id: ID!
    location: Location
    participants: [Participant!]
  }

  input eventInput {
    title: String!
    desc: String!
    date: String!
    from: String
    to: String
    location_id: ID
    user_id: ID!
  }

  # Location
  type Location {
    id: ID!
    name: String!
    desc: String
    lat: Float
    lng: Float
  }

  input locationInput {
    name: String!
    desc: String!
    lat: Float
    lng: Float
  }

  # Participant
  type Participant {
    id: ID!
    user_id: ID!
    user: User
    event_id: ID!
  }

  input participantInput {
    user_id: ID!
    event_id: ID!
  }

  # Queries
  type Query {
    # Users
    users: [User!]!
    user(id: ID!): User!

    # Events
    events: [Event!]
    event(id: ID!): Event!

    # Location
    locations: [Location!]
    location(id: ID!): Location!

    # Participant
    participants: [Participant!]
    participant(id: ID!): Participant!
  }

  type Mutation {
    # User
    addUser(data: userInput!): User!
    updateUser(id: ID!, data: userInput!): User!
    deleteUser(id: ID!): [User!]
    deleteAllUsers(id: ID!): Int!

    # Event
    addEvent(data: eventInput!): Event!
    updateEvent(id: ID!, data: eventInput!): Event!
    deleteEvent(id: ID!): [Event!]
    deleteAllEvents: Int!

    # Location
    addLocation(data: locationInput!): Location!
    updateLocation(id: ID!, data: locationInput!): Location!
    deleteLocation(id: ID!): [Location!]
    deleteAllLocations: Int!

    # Participant
    addParticipant(data: participantInput!): Participant!
    updateParticipant(id: ID!, data: participantInput!): Participant!
    deleteParticipant(id: ID!): [Participant!]
    deleteAllParticipants: Int!
  }
`;

const resolvers = {
  Mutation: {
    // User
    addUser: (_, { data }) => {
      const event = {
        id: nanoid(),
        ...data,
      };
      users.push(event);
      return event;
    },
    updateUser: (_, { id, data }) => {
      const user = users.find((u) => u.id === id);
      user.username = data.username;
      user.email = data.email;
      return user;
    },
    deleteEvent: (_, { id }) => {
      remove(users, (u) => u.id === id);
      return users;
    },
    deleteAllEvents: () => {
      const arrLength = users.length;
      users.splice(0, arrLength);
      return users.length;
    },

    // Event
    addEvent: (_, { data }) => {
      const event = {
        id: nanoid(),
        ...data,
      };
      events.push(event);
      return event;
    },
    updateEvent: (_, { id, data }) => {
      const event = events.find((e) => e.id === id);
      event.title = data.title;
      event.desc = data.desc;
      event.date = data.date;
      event.from = data.from;
      event.to = data.to;
      event.location_id = data.location_id;
      event.user_id = data.user_id;
      return event;
    },
    deleteEvent: (_, { id }) => {
      remove(events, (e) => e.id === id);
      return events;
    },
    deleteAllEvents: () => {
      const arrLength = events.length;
      events.splice(0, arrLength);
      return events.length;
    },

    // Location
    addLocation: (_, { data }) => {
      const location = {
        id: nanoid(),
        ...data,
      };
      locations.push(location);
      return location;
    },
    updateLocation: (_, { id, data }) => {
      const location = locations.find((l) => l.id === id);
      location.name = data.name;
      location.desc = data.desc;
      location.lat = data.lat;
      location.lng = data.lng;
      return location;
    },
    deleteLocation: (_, { id }) => {
      remove(locations, (e) => e.id === id);
      return locations;
    },
    deleteAllLocations: () => {
      const arrLength = locations.length;
      locations.splice(0, arrLength);
      return locations.length;
    },

    // Participant
    addParticipant: (_, { data }) => {
      const participant = {
        id: nanoid(),
        ...data,
      };
      participants.push(participant);
      return participant;
    },
    updateParticipant: (_, { id, data }) => {
      const participant = participants.find((l) => l.id === id);
      participant.event_id = data.event_id;
      participant.user_id = data.user_id;
      return participant;
    },
    deleteParticipant: (_, { id }) => {
      remove(participants, (e) => e.id === id);
      return participants;
    },
    deleteAllParticipants: () => {
      const arrLength = participants.length;
      participants.splice(0, arrLength);
      return participants.length;
    },
  },
  Query: {
    // User
    users: () => users,
    user: (parent, args) => {
      return users.find((u) => u.id == args.id);
    },

    // User
    events: () => events,
    event: (parent, args) => {
      return events.find((e) => e.id == args.id);
    },

    // User
    locations: () => locations,
    location: (parent, args) => {
      return locations.find((l) => l.id == args.id);
    },

    // User
    participants: () => participants,
    participant: (parent, args) => {
      return participants.find((p) => p.id == args.id);
    },
  },
  Event: {
    user: (parent, args) => {
      return users.find((u) => u.id === parent.user_id);
    },
    location: (parent, args) => {
      return locations.find((l) => l.id === parent.location_id);
    },
    participants: (parent, args) => {
      return participants.filter((p) => p.event_id === parent.id);
    },
  },
  Participant: {
    user: (parent, args) => {
      return users.find((u) => u.id === parent.user_id);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
});

server.listen().then(({ url }) => console.log(url));
