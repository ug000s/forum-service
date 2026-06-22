import * as postRepository from "../repositories/post.repository.js";

export const createPost = async (author, data) => {
    const tags = [...new Set(data.tags)];
    return await postRepository.createPost({author, ...data, tags});
}

export const getPostById = async (id) => {
    const post = await postRepository.findPostById(id)
    if(!post)
        throw new Error(`Post with id = ${id} not found`);
    return post;
}

export const deletePost = async (id) => {
    const post = await postRepository.deletePost(id);
    if(!post)
        throw new Error(`Post with id = ${id} not found`);
    return post;
}

export const addLike = async (id) => {
    // TODO
}

export const getPostsByAuthor = async (author) => {
    // TODO
}

export const addComment = async (id, commenter, content) => {
    // TODO
}

export const getPostsByTags = async (tagsString) => {
    // TODO
}

export const getPostsByPeriod = async (dateFrom, dateTo) => {
    // TODO
}

export const updatePost = async (id, data) => {
    // TODO
}