import {Schema, model} from "mongoose";
import {USER} from "../configuration/constants.js";

const userAccountSchema = new Schema({
    _id: {
        type: String,
        required: true,
        alias: 'login'
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        default: [USER]
    }
}, {
    versionKey: false,
    toJSON: {
        transform: (doc, ret, options) => {
            ret.login = doc._id;
            delete ret.password;
            delete ret._id;
            if(options?.hidePersonal){
                delete ret.firstName;
                delete ret.lastName;
            }
        }
    },
    toObject: {
        transform: (doc, ret, options) => {
            ret.login = doc._id;
            delete ret.password;
            delete ret._id;
            if(options?.hidePersonal){
                delete ret.firstName;
                delete ret.lastName;
            }
        }
    }
});

export default model('UserAccount', userAccountSchema, 'users');