import UserAccount from "../model/userAccount.model.js";

export const addUser = async (user) => UserAccount.create(user);