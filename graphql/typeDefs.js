const { gql } = require('apollo-server');

module.exports = gql`
  enum AddOrDelete {
    ADD
    DELETE
  }

  type User {
    id: ID!
    username: String!
    createdAt: String
    latestMessage: Message
  }

  type MsgGroupUser {
    id: ID!
    username: String!
  }

  type Message {
    id: ID!
    body: String!
    channelId: ID!
    senderId: ID!
    createdAt: String!
    user: MsgGroupUser
  }

  type Group {
    id: ID!
    name: String!
    admin: ID!
    type: String!
    participants: [ID!]!
    createdAt: String!
    latestMessage: Message
    adminUser: MsgGroupUser
  }

  type GlobalGroup {
    id: ID!
    name: String!
    type: String!
    createdAt: String!
    latestMessage: Message
  }

  type LoggedUser {
    id: ID!
    username: String!
    token: String!
  }

  type SubbedMessage {
    message: Message!
    type: String!
    participants: [ID!]
  }

  type GroupParticipants {
    groupId: ID!
    participants: [ID!]!
  }

  type GroupName {
    groupId: ID!
    name: String!
  }

  type Query {
    getAllUsers: [User]!
    getGroups: [Group]!
    getGlobalGroup: GlobalGroup

    getPrivateMessages(userId: ID!): [Message]!
    getGroupMessages(channelId: ID!): [Message]!
    getGlobalMessages: [Message]!
  }

  type Mutation {
    register(username: String!, password: String!): LoggedUser!
    login(username: String!, password: String!): LoggedUser!

    sendPrivateMessage(receiverId: ID!, body: String!): Message!
    sendGroupMessage(channelId: ID!, body: String!): Message!
    sendGlobalMessage(body: String): Message!

    createGroup(name: String!, participants: [ID!]): Group!
    deleteGroup(channelId: ID!): ID!
    leaveGroup(channelId: ID!): ID!
    editGroupName(channelId: ID!, name: String!): GroupName!
    removeGroupUser(channelId: ID!, userId: ID!): GroupParticipants!
    addGroupUser(channelId: ID!, participants: [ID!]!): GroupParticipants!
  }

  type Subscription {
    newMessage: SubbedMessage!
  }
`;
