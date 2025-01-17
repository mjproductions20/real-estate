import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIds: {
          hasSome: [tokenUserId],
        },
      },
    });

    for (const chat of chats) {
      const receiverId = chat.userIds.find((id) => id !== tokenUserId);
      const reciever = await prisma.user.findUnique({
        where: {
          id: receiverId,
        },
        select: {
          username: true,
          avatar: true,
          id: true,
        },
      });
      chat.receiver = reciever;
    }

    return res.status(200).json(chats);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch chats." });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const chatId = req.params.id;
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userIds: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });

    return res.status(200).json(chat);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch the chat." });
  }
};

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const newChat = await prisma.chat.create({
      data: {
        userIds: [tokenUserId, req.body.receiverId],
      },
    });

    return res.status(200).json(newChat);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const updateChat = await prisma.chat.update({
      where: {
        id: req.params.id,
        userIds: {
          hasSome: [tokenUserId],
        },
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });

    res.status(200).json(updateChat);
  } catch (error) {
    return res.status(500).json({ message: "Failed to read the chat." });
  }
};
