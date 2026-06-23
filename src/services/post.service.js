import * as postRepository from "../repositories/post.repository.js";

export const createPost = async (author, data) => {
    const tags = [...new Set(data.tags)];
    return await postRepository.createPost({author, ...data, tags});
}

export const getPostById = async (id) => {
    const post = await postRepository.findPostById(id)
    if (!post) {
        throw new Error(`Post with id = ${id} not found`);
    }
    return post;
}

export const deletePost = async (id) => {
    const post = await postRepository.deletePost(id);
    if (!post) {
        throw new Error(`Post with id = ${id} not found`);
    }
    return post;
}

export const addLike = async (id) => {
    const post = await postRepository.addLike(id);
    if (!post) {
        throw new Error(`Post with id = ${id} not found`);
    }
    return post;
}

export const getPostsByAuthor = async (author) => await postRepository.findPostsByAuthor(author);

export const addComment = async (id, commenter, content) => {
    const comment = {user: commenter, message: content};
    const post = await postRepository.addComment(id, comment);
    if (!post) {
        throw new Error(`Post with id = ${id} not found`);
    }
    return post;
}

export const getPostsByTags = async (tagsString) => {
    const tags = tagsString.split(',').map(tag => tag.trim());
    return await postRepository.findPostsByTags(tags);
}

export const getPostsByPeriod = async (dateFrom, dateTo) => await postRepository.findPostsByPeriod(dateFrom, dateTo);

export const updatePost = async (id, data) => {
    const post = await postRepository.updatePost(id, data);
    if (!post) {
        throw new Error(`Post with id = ${id} not found`);
    }
    return post;
}