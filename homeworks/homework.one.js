const { ApolloServer, gql } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core/dist/plugin/landingPage/graphqlPlayground");

const { users, events, locations, participants } = require("../data.json");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    events: [Event!]
  }

  type Event {
    id: ID!
    title: String!
    desc: String!
    date: String!
    from: String
    to: String
    location_id: ID
    user: User!
    user_id: ID!
    location: Location
    participants: [Participant!]
  }

  type Location {
    id: ID!
    name: String
    desc: String
    lat: Float
    lng: Float
  }

  type Participant {
    id: ID!
    user_id: ID!
    user: User!
    event_id: ID!
  }

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
`;

const resolvers = {
  Query: {
    // User
    users: () => users,
    user: (parent, args) => {
      return users.find((u) => u.id === JSON.parse(args.id));
    },

    // User
    events: () => events,
    event: (parent, args) => {
      return events.find((e) => e.id === JSON.parse(args.id));
    },

    // User
    locations: () => locations,
    location: (parent, args) => {
      return locations.find((l) => l.id === JSON.parse(args.id));
    },

    // User
    participants: () => participants,
    participant: (parent, args) => {
      return participants.find((p) => p.id === JSON.parse(args.id));
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
    user: (parent,args) => {
      return users.find((u) => u.id === parent.user_id);
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
});

server.listen().then(({ url }) => console.log(url));
