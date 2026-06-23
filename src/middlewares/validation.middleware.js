import Joi from 'joi';

const schema = {
    createPost: Joi.object({
        title: Joi.string().trim().required(),
        content: Joi.string().trim().required(),
        tags: Joi.array().items(Joi.string().trim())
    }),
    addComment: Joi.object({
        message: Joi.string().trim().required()
    }),
    getPostsByTags: Joi.object({
        // tags: Joi.string().trim().required(),
        // tags: Joi.array().items(Joi.string().trim())
        tags: Joi.alternatives().try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
    }),
    getPostsByPeriod: Joi.object({
        dateFrom: Joi.date().required(),
        dateTo: Joi.date().required()
    }),
    updatePost: Joi.object({
        title: Joi.string().trim(),
        content: Joi.string().trim(),
        tags: Joi.array().items(Joi.string().trim())
    }),
}