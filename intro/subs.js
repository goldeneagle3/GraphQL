const { GraphQLServer, PubSub ,withFilter} = require("graphql-yoga");
const { nanoid } = require("nanoid");
const { remove } = require("lodash");

const { books, authors } = require("./data");

const typeDefs = `
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
    updateAuthor(id: ID!, data: updateAuthorInput!): Author!
    deleteAuthor(id: ID!): [Author!]

    # Book
    createBook(data: createBookInput!): Book!
    updateBook(id: ID!, data: updateBookInput!): Book!
    deleteBook(id: ID!): [Book!]
    deleteAllBook: Int!
  }

  type Subscription {
    authorCreated: Author!
    authorUpdated: Author!
    authorDeleted: [Author!]

    bookCreated(author_id:ID): Book!
  }
`;

const resolvers = {
  Subscription: {
    // Author
    authorCreated: {
      subscribe: (_,__,{pubsub}) => pubsub.asyncIterator('authorCreated')
    }, 
    authorUpdated: {
      subscribe: (_,__,{pubsub}) => pubsub.asyncIterator('authorUpdated')
    }, 
    authorDeleted: {
      subscribe: (_,__,{pubsub}) => pubsub.asyncIterator('authorDeleted')
    }, 


    // Book
    bookCreated: {
      subscribe: withFilter(
        (_,__,{pubsub}) => pubsub.asyncIterator('bookCreated'),
        ({bookCreated},variables) => {
          return bookCreated.author_id === variables.author_id
        }
      )
    }

  },
  Mutation: {
    // Author
    createAuthor: (_, { data },{pubsub}) => {
      const author = {
        id: nanoid(),
        ...data,
      };

      authors.push(author);
      pubsub.publish('authorCreated',{authorCreated:author})
      return author;
    },
    updateAuthor: (_, { id, data },{pubsub}) => {
      const author = authors.find((a) => a.id === id);
      author.name = data.name;
      author.surname = data.surname;
      author.age = data.age;

      pubsub.publish('authorUpdated',{authorUpdated:author})
      return author;
    },
    deleteAuthor: (_, { id },{pubsub}) => {
      remove(authors, (a) => a.id === id);
      pubsub.publish('authorDeleted',{authorDeleted:authors})
      return authors;
    },



    // Book
    createBook: (_, { data },{pubsub}) => {
      const book = {
        id: nanoid(),
        ...data,
      };

      books.push(book);
      pubsub.publish("bookCreated",{bookCreated:book})
      return book;
    },
    updateBook: (_, { id, data }) => {
      const book = books.find((b) => b.id === id);
      book.title = data.title;
      book.author_id = data.author_id;
      book.pages = data.pages;
      book.isPublished = data.isPublished;

      return book;
    },
    deleteBook: (_, { id }) => {
      remove(books, (b) => b.id === id);

      return books;
    },
    deleteAllBook: () => {
      const arrLength = books.length;
      books.splice(0, arrLength);
      return books.length;
    },
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

const pubsub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });

server.start(() => console.log(`Server is running at http://localhost:4000`));
