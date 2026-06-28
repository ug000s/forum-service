import express from 'express';
import request from 'supertest';
import {jest} from '@jest/globals';

const postService = {
    createPost: jest.fn(),
    getPostById: jest.fn(),
    deletePost: jest.fn(),
    addLike: jest.fn(),
    getPostsByAuthor: jest.fn(),
    addComment: jest.fn(),
    getPostsByTags: jest.fn(),
    getPostsByPeriod: jest.fn(),
    updatePost: jest.fn()
};

jest.unstable_mockModule('../services/post.service.js', () => postService);

const {default: postRoutes} = await import('../routes/post.routes.js');
const {default: errorHandler} = await import('../middlewares/error.middleware.js');

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/forum', postRoutes);
    app.use(errorHandler);
    return app;
};

describe('post controller integration tests with mocked postService', () => {
    let app;
    let consoleSpy;

    beforeEach(() => {
        app = createApp();
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('POST /forum/post/:author', () => {
        const validPostData = {
            title: 'First post',
            content: 'Post content',
            tags: ['node', 'jest']
        };

        test('returns 201 and created post', async () => {
            const createdPost = {id: 'post-1', author: 'john', ...validPostData};
            postService.createPost.mockResolvedValue(createdPost);

            const response = await request(app)
                .post('/forum/post/john')
                .send(validPostData);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(createdPost);
            expect(postService.createPost).toHaveBeenCalledWith('john', validPostData);
        });

        test('returns 400 and does not call service when validation fails', async () => {
            const response = await request(app)
                .post('/forum/post/john')
                .send({title: 'First post', tags: ['node']});

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                message: '"content" is required',
                code: 400,
                status: 'Bad Request',
                path: '/post/john'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.createPost).not.toHaveBeenCalled();
        });

        test('returns 409 when service reports a conflict', async () => {
            postService.createPost.mockRejectedValue(new Error('Post already exists'));

            const response = await request(app)
                .post('/forum/post/john')
                .send(validPostData);

            expect(response.status).toBe(409);
            expect(response.body).toMatchObject({
                status: 409,
                error: 'Conflict',
                message: 'Post already exists',
                path: '/forum/post/john'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.createPost).toHaveBeenCalledWith('john', validPostData);
        });
    });

    describe('GET /forum/post/:id', () => {
        test('returns 200 and found post', async () => {
            const post = {id: 'post-1', title: 'First post'};
            postService.getPostById.mockResolvedValue(post);

            const response = await request(app).get('/forum/post/post-1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(post);
            expect(postService.getPostById).toHaveBeenCalledWith('post-1');
        });

        test('returns 404 when post is not found', async () => {
            postService.getPostById.mockRejectedValue(new Error('Post with id = missing not found'));

            const response = await request(app).get('/forum/post/missing');

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: 'Post with id = missing not found',
                path: '/forum/post/missing'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.getPostById).toHaveBeenCalledWith('missing');
        });

        test('returns 500 when service throws an unexpected error', async () => {
            postService.getPostById.mockRejectedValue(new Error('database is unavailable'));

            const response = await request(app).get('/forum/post/post-1');

            expect(response.status).toBe(500);
            expect(response.body).toMatchObject({
                status: 500,
                error: 'Internal Server Error',
                message: 'database is unavailable',
                path: '/forum/post/post-1'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.getPostById).toHaveBeenCalledWith('post-1');
        });
    });

    describe('DELETE /forum/post/:id', () => {
        test('returns 200 and deleted post', async () => {
            const deletedPost = {id: 'post-1', title: 'Deleted post'};
            postService.deletePost.mockResolvedValue(deletedPost);

            const response = await request(app).delete('/forum/post/post-1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(deletedPost);
            expect(postService.deletePost).toHaveBeenCalledWith('post-1');
        });

        test('returns 404 when post cannot be deleted because it is not found', async () => {
            postService.deletePost.mockRejectedValue(new Error('Post with id = missing not found'));

            const response = await request(app).delete('/forum/post/missing');

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: 'Post with id = missing not found',
                path: '/forum/post/missing'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.deletePost).toHaveBeenCalledWith('missing');
        });
    });

    describe('PATCH /forum/post/:id/like', () => {
        test('returns 204 when like is added', async () => {
            postService.addLike.mockResolvedValue({id: 'post-1', likes: 1});

            const response = await request(app).patch('/forum/post/post-1/like');

            expect(response.status).toBe(204);
            expect(response.text).toBe('');
            expect(postService.addLike).toHaveBeenCalledWith('post-1');
        });

        test('returns 404 when like cannot be added because post is not found', async () => {
            postService.addLike.mockRejectedValue(new Error('Post with id = missing not found'));

            const response = await request(app).patch('/forum/post/missing/like');

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: 'Post with id = missing not found',
                path: '/forum/post/missing/like'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.addLike).toHaveBeenCalledWith('missing');
        });
    });

    describe('GET /forum/posts/author/:author', () => {
        test('returns 200 and posts by author', async () => {
            const posts = [{id: 'post-1', author: 'john'}];
            postService.getPostsByAuthor.mockResolvedValue(posts);

            const response = await request(app).get('/forum/posts/author/john');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(posts);
            expect(postService.getPostsByAuthor).toHaveBeenCalledWith('john');
        });
    });

    describe('PATCH /forum/post/:id/comment/:commenter', () => {
        test('returns 200 and updated post when comment is added', async () => {
            const updatedPost = {
                id: 'post-1',
                comments: [{user: 'jane', message: 'Nice post'}]
            };
            postService.addComment.mockResolvedValue(updatedPost);

            const response = await request(app)
                .patch('/forum/post/post-1/comment/jane')
                .send({message: 'Nice post'});

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedPost);
            expect(postService.addComment).toHaveBeenCalledWith('post-1', 'jane', 'Nice post');
        });

        test('returns 400 and does not call service when comment validation fails', async () => {
            const response = await request(app)
                .patch('/forum/post/post-1/comment/jane')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                message: '"message" is required',
                code: 400,
                status: 'Bad Request',
                path: '/post/post-1/comment/jane'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.addComment).not.toHaveBeenCalled();
        });

        test('returns 404 when comment cannot be added because post is not found', async () => {
            postService.addComment.mockRejectedValue(new Error('Post with id = missing not found'));

            const response = await request(app)
                .patch('/forum/post/missing/comment/jane')
                .send({message: 'Nice post'});

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: 'Post with id = missing not found',
                path: '/forum/post/missing/comment/jane'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.addComment).toHaveBeenCalledWith('missing', 'jane', 'Nice post');
        });
    });

    describe('GET /forum/posts/tags', () => {
        test('returns 200 and posts for comma-separated tags', async () => {
            const posts = [{id: 'post-1', tags: ['node', 'jest']}];
            postService.getPostsByTags.mockResolvedValue(posts);

            const response = await request(app).get('/forum/posts/tags?values=node,jest');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(posts);
            expect(postService.getPostsByTags).toHaveBeenCalledWith('node,jest');
        });

        test('returns 200 and joins repeated tag query values before calling service', async () => {
            const posts = [{id: 'post-2', tags: ['node', 'express']}];
            postService.getPostsByTags.mockResolvedValue(posts);

            const response = await request(app).get('/forum/posts/tags?values=node&values=express');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(posts);
            expect(postService.getPostsByTags).toHaveBeenCalledWith('node,express');
        });
    });

    describe('GET /forum/posts/period', () => {
        test('returns 200 and posts for valid date period', async () => {
            const posts = [{id: 'post-1', dateCreated: '2026-06-20T00:00:00.000Z'}];
            postService.getPostsByPeriod.mockResolvedValue(posts);

            const response = await request(app)
                .get('/forum/posts/period?dateFrom=2026-06-01&dateTo=2026-06-30');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(posts);
            expect(postService.getPostsByPeriod).toHaveBeenCalledWith('2026-06-01', '2026-06-30');
        });

        test('returns 400 and does not call service when period validation fails', async () => {
            const response = await request(app)
                .get('/forum/posts/period?dateFrom=2026-06-30&dateTo=2026-06-01');

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                message: '"dateTo" must be greater than "ref:dateFrom"',
                code: 400,
                status: 'Bad Request',
                path: '/posts/period'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.getPostsByPeriod).not.toHaveBeenCalled();
        });
    });

    describe('PATCH /forum/post/:id', () => {
        test('returns 200 and updated post', async () => {
            const update = {title: 'Updated title', tags: ['node']};
            const updatedPost = {id: 'post-1', ...update};
            postService.updatePost.mockResolvedValue(updatedPost);

            const response = await request(app)
                .patch('/forum/post/post-1')
                .send(update);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedPost);
            expect(postService.updatePost).toHaveBeenCalledWith('post-1', update);
        });

        test('returns 400 and does not call service when update validation fails', async () => {
            const response = await request(app)
                .patch('/forum/post/post-1')
                .send({tags: ['node', 42]});

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                message: '"tags[1]" must be a string',
                code: 400,
                status: 'Bad Request',
                path: '/post/post-1'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.updatePost).not.toHaveBeenCalled();
        });

        test('returns 404 when post is not found during update', async () => {
            postService.updatePost.mockRejectedValue(new Error('Post with id = missing not found'));

            const response = await request(app)
                .patch('/forum/post/missing')
                .send({content: 'Updated content'});

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: 'Post with id = missing not found',
                path: '/forum/post/missing'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(postService.updatePost).toHaveBeenCalledWith('missing', {content: 'Updated content'});
        });
    });
});
