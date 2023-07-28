const { Channel, User, Message } = require('../../model');
const { Op } = require('sequelize');
const { UserInputError } = require('apollo-server');
const authChecker = require('../../utils/authChecker');
const { Sequelize } = require('sequelize');

module.exports = {
  Query: {
    getGroups: async (_, __, context) => {
      const loggedUser = authChecker(context);

      try {
        let groupChannels = await Channel.findAll({
          where: {
            [Op.and]: [
              { type: 'group' },
              Sequelize.literal(`CONCAT(',', participants, ',') LIKE '%,${loggedUser.id},%'`),
            ],
          },
          include: [
            {
              model: User,
              as: 'adminUser',
              attributes: ['id', 'username'],
            },
          ],
        });

        const groupMessages = await Message.findAll({
          include: [
            {
              model: Channel,
              as: 'channel',
              where: {
                [Op.and]: [
                  { type: 'group' },
                  
                    Sequelize.literal(`CONCAT(',', participants, ',') LIKE '%,${loggedUser.id},%'`),
                
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
          order: [['createdAt', 'DESC']],
        });

        groupChannels = groupChannels.map((groupConv) => {
          const latestMessage = groupMessages.find(
            (message) => message.channelId === groupConv.id
          );
          groupConv.latestMessage = latestMessage;
          return groupConv;
        });

        return groupChannels;
      } catch (err) {
        throw new UserInputError(err);
      }
    },
    getGlobalGroup: async () => {
      try {
        const globalChannel = await Channel.findOne({
          where: { type: 'public' },
        });

        if (globalChannel) {
          const latestMessage = await Message.findOne({
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
            order: [['createdAt', 'DESC']],
          });

          return { ...globalChannel.toJSON(), latestMessage };
        }
      } catch (err) {
        throw new UserInputError(err);
      }
    },
  },
  Mutation: {
    createGroup: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { name, participants } = args;

      if (name.trim() === '') {
        throw new UserInputError('Name field must not be empty.');
      }

      if (name.length > 30) {
        throw new UserInputError(
          'Title character length must not be more than 30.'
        );
      }

      try {
        const users = await User.findAll();
        const userIds = users.map((u) => u.id.toString());

        if (!participants.every((p) => userIds.includes(p))) {
          throw new UserInputError(
            'Participants array must contain valid user IDs.'
          );
        }

        if (
          participants.filter((p, i) => i !== participants.indexOf(p))
            .length !== 0 ||
          participants.includes(loggedUser.id.toString())
        ) {
          throw new UserInputError(
            'Participants array must not contain duplicate IDs.'
          );
        }

        const group = await Channel.create({
          name,
          admin: loggedUser.id,
          type: 'group',
          participants: [loggedUser.id, ...participants],
        });

        return {
          ...group.toJSON(),
          adminUser: { id: loggedUser.id, username: loggedUser.username },
        };
      } catch (err) {
        throw new UserInputError(err);
      }
    },
    removeGroupUser: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { channelId, userId } = args;

      try {
        const groupChannel = await Channel.findOne({
          where: { id: channelId },
        });

        if (!groupChannel || groupChannel.type !== 'group') {
          throw new UserInputError(
            `Invalid Channel ID, or Channel isn't of group type.`
          );
        }

        if (groupChannel.admin !== loggedUser.id) {
          throw new UserInputError('Access is denied.');
        }

        if (groupChannel.admin === userId) {
          throw new UserInputError("You can't remove the admin.");
        }

        const userToAdd = await User.findOne({ where: { id: userId } });

        if (!userToAdd) {
          throw new UserInputError(
            `User with id: ${userId} does not exist in DB.`
          );
        }

        if (!groupChannel.participants.find((p) => p == userId)) {
          throw new UserInputError('User is not a member of the group.');
        }

        groupChannel.participants = groupChannel.participants.filter(
          (p) => p != userId
        );
        const savedChannel = await groupChannel.save();
        return {
          groupId: savedChannel.id,
          participants: savedChannel.participants,
        };
      } catch (err) {
        throw new UserInputError(err);
      }
    },
    addGroupUser: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { channelId, participants } = args;

      if (!participants || participants.length === 0) {
        throw new UserInputError('Participants field must not be empty.');
      }

      try {
        const groupChannel = await Channel.findOne({
          where: { id: channelId },
        });

        if (!groupChannel || groupChannel.type !== 'group') {
          throw new UserInputError(
            `Invalid Channel ID, or Channel isn't of group type.`
          );
        }

        if (groupChannel.admin !== loggedUser.id) {
          throw new UserInputError('Access is denied.');
        }

        const users = await User.findAll();
        const userIds = users.map((u) => u.id.toString());

        if (!participants.every((p) => userIds.includes(p))) {
          throw new UserInputError(
            'Participants array must contain valid user IDs.'
          );
        }

        const updatedParticipants = [
          ...groupChannel.participants,
          ...participants,
        ];

        if (
          updatedParticipants.filter(
            (p, i) => i !== updatedParticipants.indexOf(p)
          ).length !== 0 ||
          updatedParticipants.includes(loggedUser.id.toString())
        ) {
          throw new UserInputError(
            'Participants array must not contain duplicate or already added users.'
          );
        }

        groupChannel.participants = updatedParticipants;
        const savedChannel = await groupChannel.save();
        return {
          groupId: savedChannel.id,
          participants: savedChannel.participants,
        };
      } catch (err) {
        throw new UserInputError(err);
      }
    },
    editGroupName: async (_, args, context) => {
      const loggedUser = authChecker(context);
      const { channelId, name } = args;

      if (name.trim() === '') {
        throw new UserInputError('Name field must not be empty.');
      }

      try {
        const groupChannel = await Channel.findOne({
          where: { id: channelId },
        });

        if (!groupChannel || groupChannel.type !== 'group') {
          throw new UserInputError(
            `Invalid Channel ID, or Channel isn't of group type.`
          );
        }

        if (groupChannel.admin !== loggedUser.id) {
          throw new UserInputError('Access is denied.');
        }

        groupChannel.name = name;
        const updatedChannel = await groupChannel.save();
        return {
          groupId: updatedChannel.id,
          name: updatedChannel.name,
        };
      } catch (err) {
        throw new UserInputError(err);
      }
    },
    deleteGroup: async (_, args, context) => {
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

        if (groupChannel.admin !== loggedUser.id) {
          throw new UserInputError('Access is denied.');
        }

        await Channel.destroy({ where: { id: channelId } });
        await Message.destroy({ where: { channelId } });
        return channelId;
      } catch (err) {
        throw new UserInputError(err);
      }
    },
    leaveGroup: async (_, args, context) => {
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

        if (groupChannel.admin === loggedUser.id) {
          throw new UserInputError("Admin can't leave the group.");
        }

        if (!groupChannel.participants.includes(loggedUser.id)) {
          throw new UserInputError("You're not a member of the group.");
        }

        groupChannel.participants = groupChannel.participants.filter(
          (p) => p !== loggedUser.id
        );

        await groupChannel.save();
        return channelId;
      } catch (err) {
        throw new UserInputError(err);
      }
    },
  },
};
