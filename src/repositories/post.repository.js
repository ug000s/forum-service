import Post from "../model/post.model.js";

export const createPost = async (postData) => {
    // const post = new Post(postData);
    // return post.save();
    // await in post.service.js
    return Post.create(postData);
};

export const findPostById = async (id) => Post.findById(id).exec();

export const deletePost = async (id) => Post.findByIdAndDelete(id).exec();