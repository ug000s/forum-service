import Joi from 'joi';

const schemas = {
    createPost: Joi.object({
        title: Joi.string().required(),
        content: Joi.string().required(),
        tags: Joi.array().items(Joi.string())
    }),
    addComment: Joi.object({
        message: Joi.string().required()
    }),
    updatePost: Joi.object({
        title: Joi.string(),
        content: Joi.string(),
        tags: Joi.array().items(Joi.string())
    }),
    dateFormatPeriod: Joi.object({
        dateFrom: Joi.date().iso().required(),
        dateTo: Joi.date().iso().required().greater(Joi.ref('dateFrom'))
    })
}

const validate = (schemaName, target = 'body') => (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
        return next(new Error('Invalid schema name'));
    }
    const {error} = schema.validate(req[target]);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            code: 400,
            status: 'Bad Request',
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
    return next();
}

export default validate;