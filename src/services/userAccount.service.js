import * as userAccountRepository from '../repositories/userAccount.repository.js';

export const register = async (user) => {
    try {
        return await userAccountRepository.addUser(user);
    } catch (e) {
        console.log(e);
        throw new Error('User already exists');
    }
}

export const removeUser = async (login) => {
    // TODO: Implement user removal logic
}

export const updateUser = async (login, updateData) => {
    // TODO: Implement user update logic
}

export const changeRoles = async (login, role, isAddRole) => {
    // TODO: Implement user role change logic
}

export const changePassword = async (login, newPassword) => {
    // TODO: Implement user password change logic
}

export const getUser = async (login) => {
    // TODO: Implement user retrieval logic
}