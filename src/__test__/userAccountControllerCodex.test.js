import express from 'express';
import request from 'supertest';
import {jest} from '@jest/globals';

const userAccountService = {
    register: jest.fn(),
    getUser: jest.fn(),
    removeUser: jest.fn(),
    updateUser: jest.fn(),
    changeRoles: jest.fn(),
    changePassword: jest.fn()
};

jest.unstable_mockModule('../services/userAccount.service.js', () => userAccountService);

const {default: userAccountRoutes} = await import('../routes/userAccount.routes.js');
const {default: errorHandler} = await import('../middlewares/error.middleware.js');

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
        req.principal = {userName: 'john'};
        next();
    });
    app.use('/account', userAccountRoutes);
    app.use(errorHandler);
    return app;
};

describe('userAccount controller integration tests with mocked userAccountService', () => {
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

    describe('POST /account/register', () => {
        const validUser = {
            login: 'john',
            password: 'secret',
            firstName: 'John',
            lastName: 'Smith'
        };

        test('returns 201 and registered user', async () => {
            const registeredUser = {
                login: 'john',
                firstName: 'John',
                lastName: 'Smith',
                roles: ['USER']
            };
            userAccountService.register.mockResolvedValue(registeredUser);

            const response = await request(app)
                .post('/account/register')
                .send(validUser);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(registeredUser);
            expect(userAccountService.register).toHaveBeenCalledWith(validUser);
        });

        test('returns 400 and does not call service when validation fails', async () => {
            const response = await request(app)
                .post('/account/register')
                .send({login: 'john', password: 'secret', firstName: 'John'});

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                message: '"lastName" is required',
                code: 400,
                status: 'Bad Request',
                path: '/register'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.register).not.toHaveBeenCalled();
        });

        test('returns 409 when service reports an existing user', async () => {
            userAccountService.register.mockRejectedValue(new Error('User already exists'));

            const response = await request(app)
                .post('/account/register')
                .send(validUser);

            expect(response.status).toBe(409);
            expect(response.body).toMatchObject({
                status: 409,
                error: 'Conflict',
                message: 'User already exists',
                path: '/account/register'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.register).toHaveBeenCalledWith(validUser);
        });
    });

    describe('POST /account/login', () => {
        test('returns 200 and current principal user', async () => {
            const user = {login: 'john', firstName: 'John', roles: ['USER']};
            userAccountService.getUser.mockResolvedValue(user);

            const response = await request(app).post('/account/login');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
            expect(userAccountService.getUser).toHaveBeenCalledWith('john');
        });

        test('returns 404 when current principal user is not found', async () => {
            userAccountService.getUser.mockRejectedValue(new Error("User with login 'john' not found"));

            const response = await request(app).post('/account/login');

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: "User with login 'john' not found",
                path: '/account/login'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.getUser).toHaveBeenCalledWith('john');
        });
    });

    describe('DELETE /account/user/:login', () => {
        test('returns 200 and removed user', async () => {
            const removedUser = {login: 'jane', firstName: 'Jane'};
            userAccountService.removeUser.mockResolvedValue(removedUser);

            const response = await request(app).delete('/account/user/jane');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(removedUser);
            expect(userAccountService.removeUser).toHaveBeenCalledWith('jane');
        });

        test('returns 404 when user cannot be removed because it is not found', async () => {
            userAccountService.removeUser.mockRejectedValue(new Error('User with login jane not found'));

            const response = await request(app).delete('/account/user/jane');

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: 'User with login jane not found',
                path: '/account/user/jane'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.removeUser).toHaveBeenCalledWith('jane');
        });
    });

    describe('PATCH /account/user/:login', () => {
        test('returns 200 and updated user', async () => {
            const update = {firstName: 'Johnny', lastName: 'Smith'};
            const updatedUser = {login: 'john', ...update};
            userAccountService.updateUser.mockResolvedValue(updatedUser);

            const response = await request(app)
                .patch('/account/user/john')
                .send(update);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedUser);
            expect(userAccountService.updateUser).toHaveBeenCalledWith('john', update);
        });

        test('returns 400 and does not call service when update validation fails', async () => {
            const response = await request(app)
                .patch('/account/user/john')
                .send({firstName: 123});

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                message: '"firstName" must be a string',
                code: 400,
                status: 'Bad Request',
                path: '/user/john'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.updateUser).not.toHaveBeenCalled();
        });

        test('returns 404 when user is not found during update', async () => {
            userAccountService.updateUser.mockRejectedValue(new Error("User with login 'missing' not found"));

            const response = await request(app)
                .patch('/account/user/missing')
                .send({lastName: 'New'});

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: "User with login 'missing' not found",
                path: '/account/user/missing'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.updateUser).toHaveBeenCalledWith('missing', {lastName: 'New'});
        });
    });

    describe('PATCH /account/user/:login/role/:role', () => {
        test('returns 200 and roles after adding role', async () => {
            const userWithRoles = {login: 'john', roles: ['USER', 'MODERATOR']};
            userAccountService.changeRoles.mockResolvedValue(userWithRoles);

            const response = await request(app).patch('/account/user/john/role/MODERATOR');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(userWithRoles);
            expect(userAccountService.changeRoles).toHaveBeenCalledWith('john', 'MODERATOR', true);
        });

        test('returns 400 and does not call service when role validation fails', async () => {
            const response = await request(app).patch('/account/user/john/role/OWNER');

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                code: 400,
                status: 'Bad Request',
                path: '/user/john/role/OWNER'
            });
            expect(response.body.message).toContain('"role" must be one of');
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.changeRoles).not.toHaveBeenCalled();
        });

        test('returns 404 when role cannot be added because user is not found', async () => {
            userAccountService.changeRoles.mockRejectedValue(new Error("User with login 'missing' not found"));

            const response = await request(app).patch('/account/user/missing/role/USER');

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: "User with login 'missing' not found",
                path: '/account/user/missing/role/USER'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.changeRoles).toHaveBeenCalledWith('missing', 'USER', true);
        });
    });

    describe('DELETE /account/user/:login/role/:role', () => {
        test('returns 200 and roles after deleting role', async () => {
            const userWithRoles = {login: 'john', roles: ['USER']};
            userAccountService.changeRoles.mockResolvedValue(userWithRoles);

            const response = await request(app).delete('/account/user/john/role/MODERATOR');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(userWithRoles);
            expect(userAccountService.changeRoles).toHaveBeenCalledWith('john', 'MODERATOR', false);
        });

        test('returns 400 and does not call service when role validation fails', async () => {
            const response = await request(app).delete('/account/user/john/role/OWNER');

            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                code: 400,
                status: 'Bad Request',
                path: '/user/john/role/OWNER'
            });
            expect(response.body.message).toContain('"role" must be one of');
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.changeRoles).not.toHaveBeenCalled();
        });
    });

    describe('PATCH /account/password', () => {
        test('returns 204 when password is changed', async () => {
            userAccountService.changePassword.mockResolvedValue({login: 'john'});

            const response = await request(app)
                .patch('/account/password')
                .send({password: 'new-secret'});

            expect(response.status).toBe(204);
            expect(response.text).toBe('');
            expect(userAccountService.changePassword).toHaveBeenCalledWith('john', 'new-secret');
        });

        test('returns 404 when password cannot be changed because user is not found', async () => {
            userAccountService.changePassword.mockRejectedValue(new Error("User with login 'john' not found"));

            const response = await request(app)
                .patch('/account/password')
                .send({password: 'new-secret'});

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: "User with login 'john' not found",
                path: '/account/password'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.changePassword).toHaveBeenCalledWith('john', 'new-secret');
        });
    });

    describe('GET /account/user/:login', () => {
        test('returns 200 and found user', async () => {
            const user = {login: 'john', firstName: 'John', roles: ['USER']};
            userAccountService.getUser.mockResolvedValue(user);

            const response = await request(app).get('/account/user/john');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
            expect(userAccountService.getUser).toHaveBeenCalledWith('john');
        });

        test('returns 404 when user is not found', async () => {
            userAccountService.getUser.mockRejectedValue(new Error("User with login 'missing' not found"));

            const response = await request(app).get('/account/user/missing');

            expect(response.status).toBe(404);
            expect(response.body).toMatchObject({
                status: 404,
                error: 'Not Found',
                message: "User with login 'missing' not found",
                path: '/account/user/missing'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.getUser).toHaveBeenCalledWith('missing');
        });

        test('returns 500 when service throws an unexpected error', async () => {
            userAccountService.getUser.mockRejectedValue(new Error('database is unavailable'));

            const response = await request(app).get('/account/user/john');

            expect(response.status).toBe(500);
            expect(response.body).toMatchObject({
                status: 500,
                error: 'Internal Server Error',
                message: 'database is unavailable',
                path: '/account/user/john'
            });
            expect(response.body.timestamp).toEqual(expect.any(String));
            expect(userAccountService.getUser).toHaveBeenCalledWith('john');
        });
    });
});
