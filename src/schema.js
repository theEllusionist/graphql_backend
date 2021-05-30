const {gql} = require('apollo-server');

const typeDefs = gql`
  type Query {
    users(name:String!):[User!]!
    usersPosts: [Post!]!
    usersComments:[Comment!]!
    user:User!
    postById(id:ID!):Post!
    posts:[Post!]!
  }

  type Mutation {
    signUp(data:signUpInput!) : AuthPayload! 
    logIn(data:logInInput!): AuthPayload!
    updateUser(data:updateUserInput)  :User!
    deleteUser:User!

    createPost(data:createPostInput!) :Post!
    updatePost(data:updatePostInput!) :Post!
    deletePost(id:ID!):Post!

    createComment(data:createCommentInput!) :Comment!
    updateComment(data:updateCommentInput!) :Comment!
    deleteComment(data:deleteCommentInput!):Comment!
    
  }
  type Subscription {
    comment(post_id: ID!): CommentSubscriptionPayload!
    post: PostSubscriptionPayload!
    myPost: PostSubscriptionPayload!
  }



  type User {
    id:ID!
    name:String!
    username:String!
    email:String
    password:String
    posts:[Post!]!
    comments:[Comment!]!
  }

  type Post {
    id:ID!
    title:String!
    body:String!
    user_id:ID!
    author:User!
    published:Boolean!
    comments:[Comment!]!
  }

  type Comment {
    id:ID!
    text:String!
    user_id:ID!
    post_id:ID!
    post:[Post!]!
    author:User!
  }

  type AuthPayload {
    user:User!
    token:String!
  }

  input signUpInput {
    name:String!
    username:String!
    email:String!
    password:String!
  }

  input logInInput {
    email:String!
    password:String!
  }

  input updateUserInput {
    name:String
    email:String
    username:String
    password:String
  }

  input createPostInput {
    title:String!
    body:String!
    published:Boolean
  }

  input updatePostInput {
    id:ID!
    title:String
    body:String
    published:Boolean
  }

  input createCommentInput {
    text:String!
    post_id:ID!
  }

  input updateCommentInput {
    id:ID!
    post_id:ID!
    text:String
  }

  input deleteCommentInput {
    id:ID!
    post_id:ID!
  }
  enum MutationType {
    CREATED
    UPDATED
    DELETED
}

  type PostSubscriptionPayload {
    mutation: MutationType!
    post: Post
  }

  type CommentSubscriptionPayload {
    mutation: MutationType!
    comment: Comment
  }
  

`

module.exports = typeDefs;