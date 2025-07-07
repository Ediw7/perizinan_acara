require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolver');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 4000;


const getUserFromToken = async (req) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader) {
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        const user = await User.findById(decoded.id);
        return user;
      } catch (err) {
   
        return null;
      }
    }
  }
  return null;
};


async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {

      const user = await getUserFromToken(req);
      return { user };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();