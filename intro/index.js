const { ApolloServer, gql } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core/dist/plugin/landingPage/graphqlPlayground");

const { books, authors } = require("./data");

const typeDefs = gql`
  type Author {
    id: ID!
    name: String!
    surname: String!
    age: Int
    books(filter: String): [Book!]
  }

  type Book {
    id: ID!
    title: String!
    author: Author!
    author_id: String!
    pages: Float
    isPublished: Boolean
  }

  type Query {
    books: [Book!]
    book(id: ID!): Book!

    authors: [Author!]
    author(id: ID!): Author!
  }
`;

const resolvers = {
  Query: {
    books: () => books,
    book: (parent, args) => {
      return books.find((b) => b.id === args.id);
    },
    authors: () => authors,
    author: (parent, args) => {
      return authors.find((a) => a.id === args.id);
    },
  },
  Book: {
    author: (parent, args) => {
      console.log(parent);
      return authors.find((author) => author.id === parent.author_id);
    },
  },
  Author: {
    books: (parent, args) => {
      let filtered = books.filter((b) => b.author_id === parent.id);

      if (args.filter) {
        filtered = filtered.filter(b => b.title.toLocaleLowerCase().startsWith(args.filter));
      }

      return filtered;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
});

server.listen().then(({ url }) => console.log(url));
