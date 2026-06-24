import UserAccount from "../model/userAccount.model.js";

export const addUser = async (user) => UserAccount.create(user);

export const removeUser = async (login) => UserAccount.findByIdAndDelete(login, {returnDocument: 'after'}).exec();

export const updateUser = async (login, updateData) => UserAccount.findByIdAndUpdate(login, updateData, {returnDocument: 'after'}).exec();