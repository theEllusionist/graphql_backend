const { ApolloServer, PubSub, gql } = require('apollo-server');
const pubsub = new PubSub();
const PORT = process.env.PORT || 4000;
const typeDefs = require('./schema.js')
const Query = require("./resolvers/Query")
const User = require("./resolvers/User")
const Post = require("./resolvers/Post")
const Comment = require("./resolvers/Comment")
const Subscription = require("./resolvers/Subscription");
const Mutation = require("./resolvers/Mutation");
const {PrismaClient} = require('@prisma/client')
const getUserId = require("./utils/utils")
const cors = require('cors')
const prisma = new PrismaClient();
const app = express();
app.use("*", cors());
const resolvers = {
  Query,
  Mutation,
  Subscription,
  Comment,
  User,
  Post,
}
const server = new ApolloServer({
  introspection:true,
  playground:true,
  typeDefs,
  resolvers,
  subscriptions: {
    path: '/subscriptions',
    onConnect: (connectionParams, webSocket, context) => {
      console.log('Client connected');
    },
    onDisconnect: (webSocket, context) => {
      console.log('Client disconnected')
    },
  },
  context:({req})=>{
    return {
      pubsub,
      prisma,
      user_id:
        req && req.headers.authorization
          ? getUserId(req)
          : undefined
    };
   
  },
});
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
});
