const { Message, Channel, User } = require('../../models');
const { Op } = require('sequelize');
const { UserInputError } = require('apollo-server');
const {PubSub,withFilter}=require('graphql-subscriptions');
const authChecker = require('../../utils/authChecker');
const pubsub = new PubSub();

module.exports = {
  Query: {
    getPrivateMessages: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { userId } = args;

      try {
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
          throw new UserInputError(
            `User with id: ${userId} does not exist in DB.`
          );
        }

        const messages = await Message.findAll({
          include: [
            {
              model: Channel,
              as: 'channel',
              where: {
                [Op.and]: [
                  { type: 'private' },
                  {
                    participants: { [Op.contains]: [loggedUser.id, userId] },
                  },
                ],
              },
              attributes: [],
            },
            {
              model: User,
              as: 'user',
              attributes: ['username', 'id'],
            },
          ],
          order: [['createdAt', 'ASC']],
        });

        return messages;
      } catch (err) {
        throw new UserInputError(err);
      }
    },

    getGroupMessages: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { channelId } = args;

      try {
        const groupChannel = await Channel.findOne({
          where: { id: channelId },
        });

        if (!groupChannel || groupChannel.type !== 'group') {
          throw new UserInputError(
            `Invalid Channel ID, or Channel isn't of group type.`
          );
        }

        if (!groupChannel.participants.includes(loggedUser.id)) {
          throw new UserInputError(
            'Access is denied. Only members of the group can view messages.'
          );
        }

        const messages = await Message.findAll({
          include: [
            {
              model: Channel,
              as: 'channel',
              where: {
                id: channelId,
              },
              attributes: [],
            },
            {
              model: User,
              as: 'user',
              attributes: ['username', 'id'],
            },
          ],
          order: [['createdAt', 'ASC']],
        });

        return messages;
      } catch (err) {
        throw new UserInputError(err);
      }
    },

    getGlobalMessages: async () => {
      try {
        const globalChannel = await Channel.findOne({
          where: { type: 'public' },
        });

        if (!globalChannel) {
          throw new UserInputError(`Global Chat group does not exist.`);
        }

        const messages = await Message.findAll({
          include: [
            {
              model: Channel,
              as: 'channel',
              where: {
                type: 'public',
              },
              attributes: [],
            },
            {
              model: User,
              as: 'user',
              attributes: ['username', 'id'],
            },
          ],
          order: [['createdAt', 'ASC']],
        });

        return messages;
      } catch (err) {
        throw new UserInputError(err);
      }
    },
  },
  Mutation: {
    sendPrivateMessage: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { receiverId, body } = args;

      if (body.trim() === '') {
        throw new UserInputError('Body field must not be empty.');
      }

      try {
        const receivingUser = await User.findOne({ where: { id: receiverId } });

        if (!receivingUser) {
          throw new UserInputError(
            `User with id: ${receiverId} does not exist in DB.`
          );
        }

        if (receiverId == loggedUser.id) {
          throw new UserInputError(
            "You can't send private message to yourself."
          );
        }

        let channel = await Channel.findOne({
          where: {
            [Op.and]: [
              { type: 'private' },
              { participants: { [Op.contains]: [loggedUser.id, receiverId] } },
            ],
          },
        });

        if (!channel) {
          const newChannel = new Channel({
            type: 'private',
            participants: [loggedUser.id, receiverId],
          });

          channel = await newChannel.save();
        }

        const newMessage = await Message.create({
          channelId: channel.id,
          senderId: loggedUser.id,
          body,
        });

        pubsub.publish('NEW_MESSAGE', {
          newMessage: {
            message: {
              ...newMessage.toJSON(),
              user: { id: loggedUser.id, username: loggedUser.username },
            },
            type: 'private',
            participants: channel.participants,
          },
        });

        return newMessage;
      } catch (err) {
        throw new UserInputError(err);
      }
    },

    sendGroupMessage: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { channelId, body } = args;

      if (body.trim() === '') {
        throw new UserInputError('Body field must not be empty.');
      }

      try {
        const groupChannel = await Channel.findOne({
          where: { id: channelId },
        });

        if (!groupChannel || groupChannel.type !== 'group') {
          throw new UserInputError(
            `Invalid Group ID, or Channel isn't of type group.`
          );
        }

        if (!groupChannel.participants.includes(loggedUser.id)) {
          throw new UserInputError(
            'Access is denied. Only members of the group can send messages.'
          );
        }

        const newMessage = await Message.create({
          channelId,
          senderId: loggedUser.id,
          body,
        });

        pubsub.publish('NEW_MESSAGE', {
          newMessage: {
            message: {
              ...newMessage.toJSON(),
              user: { id: loggedUser.id, username: loggedUser.username },
            },
            type: 'group',
            participants: groupChannel.participants,
          },
        });

        return newMessage;
      } catch (err) {
        throw new UserInputError(err);
      }
    },

    sendGlobalMessage: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { body } = args;

      if (body.trim() === '') {
        throw new UserInputError('Body field must not be empty.');
      }

      try {
        const globalChannel = await Channel.findOne({
          where: { type: 'public' },
        });

        if (!globalChannel) {
          throw new UserInputError(`Global Chat group does not exist.`);
        }

        const newMessage = await Message.create({
          channelId: globalChannel.id,
          senderId: loggedUser.id,
          body,
        });

        pubsub.publish('NEW_MESSAGE', {
          newMessage: {
            message: {
              ...newMessage.toJSON(),
              user: { id: loggedUser.id, username: loggedUser.username },
            },
            type: 'public',
          },
        });

        return newMessage;
      } catch (err) {
        throw new UserInputError(err);
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, context) => {
          const loggedUser = authChecker(context);
          if (loggedUser) {
            return pubsub.asyncIterator(['NEW_MESSAGE']);
          }
        },
        (parent, _, context) => {
          const { newMessage } = parent;
          const loggedUser = authChecker(context);

          return (
            newMessage.type === 'public' ||
            newMessage.participants.includes(loggedUser.id)
          );
        }
      ),
    },
  },
};
