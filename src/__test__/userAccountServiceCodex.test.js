import {jest} from '@jest/globals';

const userAccountRepository = {
    addUser: jest.fn(),
    removeUser: jest.fn(),
    updateUser: jest.fn(),
    addRole: jest.fn(),
    removeRole: jest.fn(),
    findUser: jest.fn(),
    changePassword: jest.fn()
};

jest.unstable_mockModule('../repositories/userAccount.repository.js', () => userAccountRepository);

const userAccountService = await import('../services/userAccount.service.js');
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

describe('userAccountService unit tests with mocked userAccountRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        const user = {
            login: 'john',
            password: 'secret',
            firstName: 'John',
            lastName: 'Smith'
        };

        test('returns created user', async () => {
            const createdUser = {login: 'john', firstName: 'John', lastName: 'Smith', roles: ['USER']};
            userAccountRepository.addUser.mockResolvedValue(createdUser);

            const result = await userAccountService.register(user);

            expect(result).toEqual(createdUser);
            expect(userAccountRepository.addUser).toHaveBeenCalledWith(user);
        });

        test('throws normalized error when repository rejects', async () => {
            userAccountRepository.addUser.mockRejectedValue(new Error('duplicate key'));

            await expect(userAccountService.register(user)).rejects.toThrow('User already exists');
        });
    });

    describe('removeUser', () => {
        test('returns removed user', async () => {
            const removedUser = {login: 'john'};
            userAccountRepository.removeUser.mockResolvedValue(removedUser);

            const result = await userAccountService.removeUser('john');

            expect(result).toEqual(removedUser);
            expect(userAccountRepository.removeUser).toHaveBeenCalledWith('john');
        });

        test('throws when removed user is not found', async () => {
            userAccountRepository.removeUser.mockResolvedValue(null);

            await expect(userAccountService.removeUser('missing'))
                .rejects.toThrow('User with login missing not found');
        });
    });

    describe('updateUser', () => {
        test('returns updated user', async () => {
            const update = {firstName: 'Johnny'};
            const updatedUser = {login: 'john', firstName: 'Johnny'};
            userAccountRepository.updateUser.mockResolvedValue(updatedUser);

            const result = await userAccountService.updateUser('john', update);

            expect(result).toEqual(updatedUser);
            expect(userAccountRepository.updateUser).toHaveBeenCalledWith('john', update);
        });

        test('throws when updated user is not found', async () => {
            userAccountRepository.updateUser.mockResolvedValue(null);

            await expect(userAccountService.updateUser('missing', {lastName: 'New'}))
                .rejects.toThrow("User with login 'missing' not found");
        });
    });

    describe('changeRoles', () => {
        test('adds uppercased role and returns hidden personal data object', async () => {
            const userDocument = {
                toObject: jest.fn().mockReturnValue({login: 'john', roles: ['USER', 'MODERATOR']})
            };
            userAccountRepository.addRole.mockResolvedValue(userDocument);

            const result = await userAccountService.changeRoles('john', 'moderator', true);

            expect(result).toEqual({login: 'john', roles: ['USER', 'MODERATOR']});
            expect(userAccountRepository.addRole).toHaveBeenCalledWith('john', 'MODERATOR');
            expect(userDocument.toObject).toHaveBeenCalledWith({hidePersonal: true});
        });

        test('removes uppercased role and returns hidden personal data object', async () => {
            const userDocument = {
                toObject: jest.fn().mockReturnValue({login: 'john', roles: ['USER']})
            };
            userAccountRepository.removeRole.mockResolvedValue(userDocument);

            const result = await userAccountService.changeRoles('john', 'moderator', false);

            expect(result).toEqual({login: 'john', roles: ['USER']});
            expect(userAccountRepository.removeRole).toHaveBeenCalledWith('john', 'MODERATOR');
            expect(userDocument.toObject).toHaveBeenCalledWith({hidePersonal: true});
        });

        test('throws when user for role change is not found', async () => {
            userAccountRepository.addRole.mockResolvedValue(null);

            await expect(userAccountService.changeRoles('missing', 'USER', true))
                .rejects.toThrow("User with login 'missing' not found");
        });
    });

    describe('changePassword', () => {
        test('returns user after password change', async () => {
            const user = {login: 'john'};
            userAccountRepository.changePassword.mockResolvedValue(user);

            const result = await userAccountService.changePassword('john', 'new-secret');

            expect(result).toEqual(user);
            expect(userAccountRepository.changePassword).toHaveBeenCalledWith('john', 'new-secret');
        });

        test('throws when user for password change is not found', async () => {
            userAccountRepository.changePassword.mockResolvedValue(null);

            await expect(userAccountService.changePassword('missing', 'new-secret'))
                .rejects.toThrow("User with login 'missing' not found");
        });
    });

    describe('getUser', () => {
        test('returns found user', async () => {
            const user = {login: 'john', firstName: 'John'};
            userAccountRepository.findUser.mockResolvedValue(user);

            const result = await userAccountService.getUser('john');

            expect(result).toEqual(user);
            expect(userAccountRepository.findUser).toHaveBeenCalledWith('john');
        });

        test('throws when user is not found', async () => {
            userAccountRepository.findUser.mockResolvedValue(null);

            await expect(userAccountService.getUser('missing'))
                .rejects.toThrow("User with login 'missing' not found");
        });
    });
});

describe('userAccount validation middleware unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('passes valid register body', () => {
        const {res, next} = runValidator('register', 'body', {
            login: 'john',
            password: 'secret',
            firstName: 'John',
            lastName: 'Smith'
        });

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('rejects invalid register body', () => {
        const {res, next} = runValidator('register', 'body', {
            login: 'john',
            password: 'secret',
            firstName: 'John'
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: '"lastName" is required',
            code: 400,
            status: 'Bad Request',
            path: '/test-path'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('passes valid updateUser body', () => {
        const {res, next} = runValidator('updateUser', 'body', {
            firstName: 'Johnny',
            lastName: 'Smith'
        });

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('rejects invalid updateUser body', () => {
        const {res, next} = runValidator('updateUser', 'body', {
            firstName: 123
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: '"firstName" must be a string',
            code: 400,
            status: 'Bad Request',
            path: '/test-path'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('passes valid changeRoles params', () => {
        const {res, next} = runValidator('changeRoles', 'params', {
            login: 'john',
            role: 'moderator'
        });

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('rejects invalid changeRoles params', () => {
        const {res, next} = runValidator('changeRoles', 'params', {
            login: 'john',
            role: 'OWNER'
        });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            code: 400,
            status: 'Bad Request',
            path: '/test-path'
        }));
        expect(res.json.mock.calls[0][0].message).toContain('"role" must be one of');
        expect(next).not.toHaveBeenCalled();
    });
});
