import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const tokenUserId = req.userId;

    if (id !== tokenUserId) {
      return res.status(403).json({ message: "Unauthorized!" });
    }

    const { password, avatar, ...userInfo } = req.body;

    let updatedPassword = null;
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...userInfo,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: userPassword, ...info } = updatedUser;

    res.status(200).json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const tokenUserId = req.userId;

    if (id !== tokenUserId) {
      return res.status(403).json({ message: "Unauthorized!" });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete the user." });
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });

      return res.status(200).json({ message: "Post unsaved successfully." });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });

      return res.status(200).json({ message: "Post saved successfully." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to save the post." });
  }
};

export const profilePosts = async (req, res) => {
  try {
    const tokenUserId = req.userId;
    const userPosts = await prisma.post.findMany({
      where: {
        userId: tokenUserId,
      },
    });

    const saved = await prisma.savedPost.findMany({
      where: {
        userId: tokenUserId,
      },
      include: {
        post: true,
      },
    });

    const savedPosts = saved.map((item) => item.post);
    res.status(200).json({ userPosts, savedPosts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch the profile posts." });
  }
};
