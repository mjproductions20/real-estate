import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: {
          gte: parseInt(query.bedroom) || 1,
        },
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 100000000,
        },
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        PostDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
            id: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });

          return res
            .status(200)
            .json({ ...post, isSaved: saved ? true : false });
        }
      });
    } else {
      return res.status(200).json(post);
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const addPost = async (req, res) => {
  const body = await req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        PostDetail: {
          create: body.postDetail,
        },
      },
    });

    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Failed to create the post." });
  }
};

export const updatePost = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Failed to update the post." });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (post.userId !== tokenUserId)
      return res.status(403).json({ message: "Unauthorized!" });

    await prisma.post.delete({
      where: {
        id,
      },
    });

    req.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete the post." });
  }
};
