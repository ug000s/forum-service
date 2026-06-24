import UserAccount from "../model/userAccount.model.js";

export const addUser = async (user) => UserAccount.create(user);

export const removeUser = async (login) => UserAccount.findByIdAndDelete(login, {returnDocument: 'after'}).exec();

export const updateUser = async (login, updateData) => UserAccount.findByIdAndUpdate(login, updateData, {returnDocument: 'after'}).exec();

export const addRole = async (login, role) => UserAccount.findByIdAndUpdate(login,{$addToSet: {roles: role}}, {returnDocument: 'after'}).exec();

export const removeRole = async (login, role) => UserAccount.findByIdAndUpdate(login,{$pull: {roles: role}}, {returnDocument: 'after'}).exec();

export const findUser = async (login) => UserAccount.findById(login).exec();

export const changePassword = async (login, newPasssword) => UserAccount.findByIdAndUpdate(login, {password: newPasssword}, {returnDocument: 'after'}).exec();