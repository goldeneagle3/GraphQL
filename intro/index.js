const { ApolloServer, gql } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core/dist/plugin/landingPage/graphqlPlayground");
const { nanoid } = require("nanoid");
const {remove} = require('lodash');

const { books, authors } = require("./data");

const typeDefs = gql`
  # Author
  type Author {
    id: ID!
    name: String!
    surname: String!
    age: Int
    books(filter: String): [Book!]
  }

  input createAuthorInput {
    name: String!
    surname: String!
    age: Int
  }

  input updateAuthorInput {
    name: String!
    surname: String!
    age: Int
  }

  # Book
  type Book {
    id: ID!
    title: String!
    author: Author!
    author_id: String!
    pages: Float
    isPublished: Boolean
  }

  input createBookInput {
    title: String!
    author_id: String!
    pages: Float
    isPublished: Boolean
  }

  input updateBookInput {
    title: String!
    author_id: String!
    pages: Float
    isPublished: Boolean
  }

  

  # Queries
  type Query {
    books: [Book!]
    book(id: ID!): Book!

    authors: [Author!]
    author(id: ID!): Author!
  }

  type Mutation {
    # Author
    createAuthor(data: createAuthorInput!): Author!
    updateAuthor(id:ID!,data:updateAuthorInput!): Author!
    deleteAuthor(id:ID!):[Author!]

    # Book
    createBook(data: createBookInput!): Book!
    updateBook(id:ID!,data:updateBookInput!): Book!
    deleteBook(id:ID!): [Book!]
    deleteAllBook: Int!
  }
`;

const resolvers = {
  Mutation: {
    // Author
    createAuthor: (_, { data }) => {
      const author = {
        id: nanoid(),
        ...data
      };

      authors.push(author);

      return author;
    },
    updateAuthor:(_,{id,data}) => {
      const author = authors.find(a => a.id === id)
      author.name = data.name
      author.surname = data.surname
      author.age = data.age

      return author
    },
    deleteAuthor:(_,{id}) => {
      remove(authors,(a) => a.id === id)
      return authors;
    },


    // Book
    createBook: (_, { data }) => {
      const book = {
        id: nanoid(),
        ...data
      };

      books.push(book);

      return book;
    },
    updateBook: (_,{id,data}) => {
      const book = books.find(b => b.id === id)
      book.title = data.title
      book.author_id = data.author_id
      book.pages = data.pages
      book.isPublished = data.isPublished

      return book
    },
    deleteBook: (_,{id}) => {
      remove(books,(b) => b.id === id);

      return books
    },
    deleteAllBook: () => {
      const arrLength = books.length;
      books.splice(0,arrLength)
      return books.length
    }
  },
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
      return authors.find((author) => author.id === parent.author_id);
    },
  },
  Author: {
    books: (parent, args) => {
      let filtered = books.filter((b) => b.author_id === parent.id);

      if (args.filter) {
        filtered = filtered.filter((b) =>
          b.title.toLocaleLowerCase().startsWith(args.filter)
        );
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
