import Post from "../model/post.model.js";

export const createPost = async (postData) => {
    // const post = new Post(postData);
    // return post.save();
    return Post.create(postData);
}

export const findPostById = async (id) => Post.findById(id).exec();

export const deletePost = async (id) => Post.findByIdAndDelete(id).exec();

export const addLike = async (id) => Post.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { returnDocument: 'after' }).exec();

export const findPostsByAuthor = async (author) => Post.find({ author: new RegExp(`^${author}$`, 'i') }).exec();

export const addComment = async (id, comment) => {
    return Post.findByIdAndUpdate(id, {$push: {comments: comment}}, {returnDocument: 'after'}).exec();
}

export const findPostsByTags = async (tags) => {
    const regexConditions = tags.map(tag => ({tags: new RegExp(`^${tag}$`, 'i')}));
    return Post.find({$or: regexConditions}).exec();
}

export const findPostsByPeriod = async (dateFrom, dateTo) => Post.find({dateCreated: {$gte: dateFrom, $lte: dateTo}}).exec();

export const updatePost = async (id, updateData) => {
    const tags = updateData.tags ?? [];
    delete updateData.tags;
    const data = {...updateData, $addToSet: {tags: tags}};
    return Post.findByIdAndUpdate(id, data, {returnDocument: 'after'}).exec();
}