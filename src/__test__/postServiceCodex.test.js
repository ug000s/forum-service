import {jest} from '@jest/globals';

const postRepository = {
    createPost: jest.fn(),
    findPostById: jest.fn(),
    deletePost: jest.fn(),
    addLike: jest.fn(),
    findPostsByAuthor: jest.fn(),
    addComment: jest.fn(),
    findPostsByTags: jest.fn(),
    findPostsByPeriod: jest.fn(),
    updatePost: jest.fn()
};

jest.unstable_mockModule('../repositories/post.repository.js', () => postRepository);

const postService = await import('../services/post.service.js');
const {default: validate} = await import('../middlewares/validation.middleware.js');

const runValidator = (schemaName, target, data) => {
    const req = {
        body: target === 'body' ? data : {},
        query: target === 'query' ? data : {},
        params: target === 'params' ? data : {},
        path: '/test-path'
    };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    const next = jest.fn();

    validate(schemaName, target)(req, res, next);

    return {res, next};
};

describe('postService unit tests with mocked postRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createPost', () => {
        test('creates post and removes duplicated tags', async () => {
            const data = {
                title: 'First post',
                content: 'Post content',
                tags: ['node', 'jest', 'node']
            };
            const createdPost = {
                author: 'john',
                title: 'First post',
                content: 'Post content',
                tags: ['node', 'jest']
            };
            postRepository.createPost.mockResolvedValue(createdPost);

            const result = await postService.createPost('john', data);

            expect(result).toEqual(createdPost);
            expect(postRepository.createPost).toHaveBeenCalledWith({
                author: 'john',
                title: 'First post',
                content: 'Post content',
                tags: ['node', 'jest']
            });
        });

        test('propagates repository errors', async () => {
            postRepository.createPost.mockRejectedValue(new Error('database is unavailable'));

            await expect(postService.createPost('john', {
                title: 'First post',
                content: 'Post content',
                tags: ['node']
            })).rejects.toThrow('database is unavailable');
        });
    });

    describe('getPostById', () => {
        test('returns found post', async () => {
            const post = {id: 'post-1', title: 'First post'};
            postRepository.findPostById.mockResolvedValue(post);

            const result = await postService.getPostById('post-1');

            expect(result).toEqual(post);
            expect(postRepository.findPostById).toHaveBeenCalledWith('post-1');
        });

        test('throws when post is not found', async () => {
            postRepository.findPostById.mockResolvedValue(null);

            await expect(postService.getPostById('missing'))
                .rejects.toThrow('Post with id = missing not found');
        });
    });

    describe('deletePost', () => {
        test('returns deleted post', async () => {
            const post = {id: 'post-1'};
            postRepository.deletePost.mockResolvedValue(post);

            const result = await postService.deletePost('post-1');

            expect(result).toEqual(post);
            expect(postRepository.deletePost).toHaveBeenCalledWith('post-1');
        });

        test('throws when deleted post is not found', async () => {
            postRepository.deletePost.mockResolvedValue(null);

            await expect(postService.deletePost('missing'))
                .rejects.toThrow('Post with id = missing not found');
        });
    });

    describe('addLike', () => {
        test('returns post after adding like', async () => {
            const post = {id: 'post-1', likes: 1};
            postRepository.addLike.mockResolvedValue(post);

            const result = await postService.addLike('post-1');

            expect(result).toEqual(post);
            expect(postRepository.addLike).toHaveBeenCalledWith('post-1');
        });

        test('throws when post for like is not found', async () => {
            postRepository.addLike.mockResolvedValue(null);

            await expect(postService.addLike('missing'))
                .rejects.toThrow('Post with id = missing not found');
        });
    });

    describe('getPostsByAuthor', () => {
        test('returns posts by author', async () => {
            const posts = [{id: 'post-1', author: 'john'}];
            postRepository.findPostsByAuthor.mockResolvedValue(posts);

            const result = await postService.getPostsByAuthor('john');

            expect(result).toEqual(posts);
            expect(postRepository.findPostsByAuthor).toHaveBeenCalledWith('john');
        });
    });

    describe('addComment', () => {
        test('adds comment with commenter and content', async () => {
            const post = {id: 'post-1', comments: [{user: 'jane', message: 'Nice post'}]};
            postRepository.addComment.mockResolvedValue(post);

            const result = await postService.addComment('post-1', 'jane', 'Nice post');

            expect(result).toEqual(post);
            expect(postRepository.addComment).toHaveBeenCalledWith('post-1', {
                user: 'jane',
                message: 'Nice post'
            });
        });

        test('throws when post for comment is not found', async () => {
            postRepository.addComment.mockResolvedValue(null);

            await expect(postService.addComment('missing', 'jane', 'Nice post'))
                .rejects.toThrow('Post with id = missing not found');
        });
    });

    describe('getPostsByTags', () => {
        test('splits and trims tags before repository call', async () => {
            const posts = [{id: 'post-1', tags: ['node', 'jest']}];
            postRepository.findPostsByTags.mockResolvedValue(posts);

            const result = await postService.getPostsByTags('node, jest,express');

            expect(result).toEqual(posts);
            expect(postRepository.findPostsByTags).toHaveBeenCalledWith(['node', 'jest', 'express']);
        });
    });

    describe('getPostsByPeriod', () => {
        test('returns posts by period', async () => {
            const posts = [{id: 'post-1'}];
            postRepository.findPostsByPeriod.mockResolvedValue(posts);

            const result = await postService.getPostsByPeriod('2026-06-01', '2026-06-30');

            expect(result).toEqual(posts);
            expect(postRepository.findPostsByPeriod).toHaveBeenCalledWith('2026-06-01', '2026-06-30');
        });
    });

    describe('updatePost', () => {
        test('returns updated post', async () => {
            const update = {title: 'Updated title'};
            const post = {id: 'post-1', title: 'Updated title'};
            postRepository.updatePost.mockResolvedValue(post);

            const result = await postService.updatePost('post-1', update);

            expect(result).toEqual(post);
            expect(postRepository.updatePost).toHaveBeenCalledWith('post-1', update);
        });

        test('throws when updated post is not found', async () => {
            postRepository.updatePost.mockResolvedValue(null);

            await expect(postService.updatePost('missing', {title: 'Updated title'}))
                .rejects.toThrow('Post with id = missing not found');
        });
    });
});

describe('post validation middleware unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('passes valid createPost body', () => {
        const {res, next} = runValidator('createPost', 'body', {
            title: 'First post',
            content: 'Post content',
            tags: ['node']
        });

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('rejects invalid createPost body', () => {
        const {res, next} = runValidator('createPost', 'body', {
            title: 'First post',
            tags: ['node']
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: '"content" is required',
            code: 400,
            status: 'Bad Request',
            path: '/test-path'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('passes valid addComment body', () => {
        const {res, next} = runValidator('addComment', 'body', {message: 'Nice post'});

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('rejects invalid addComment body', () => {
        const {res, next} = runValidator('addComment', 'body', {});

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: '"message" is required',
            code: 400,
            status: 'Bad Request',
            path: '/test-path'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('passes valid updatePost body', () => {
        const {res, next} = runValidator('updatePost', 'body', {
            title: 'Updated title',
            tags: ['node']
        });

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('rejects invalid updatePost body', () => {
        const {res, next} = runValidator('updatePost', 'body', {
            tags: ['node', 42]
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: '"tags[1]" must be a string',
            code: 400,
            status: 'Bad Request',
            path: '/test-path'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('passes valid dateFormatPeriod query', () => {
        const {res, next} = runValidator('dateFormatPeriod', 'query', {
            dateFrom: '2026-06-01',
            dateTo: '2026-06-30'
        });

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('rejects invalid dateFormatPeriod query', () => {
        const {res, next} = runValidator('dateFormatPeriod', 'query', {
            dateFrom: '2026-06-30',
            dateTo: '2026-06-01'
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: '"dateTo" must be greater than "ref:dateFrom"',
            code: 400,
            status: 'Bad Request',
            path: '/test-path'
        }));
        expect(next).not.toHaveBeenCalled();
    });
});
