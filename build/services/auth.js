"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTwoFactor = exports.comparePasswords = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = require("../models/user");
const speakeasy_1 = __importDefault(require("speakeasy"));
const hashPassword = async (plainTextPassword) => {
    const saltRound = 12;
    const hash = await bcryptjs_1.default.hash(plainTextPassword, saltRound);
    return hash;
};
exports.hashPassword = hashPassword;
const comparePasswords = async (plainTextPassword, hashPassword) => {
    return await bcryptjs_1.default.compare(plainTextPassword, hashPassword);
};
exports.comparePasswords = comparePasswords;
const verifyTwoFactor = async (token, userId) => {
    try {
        const usr = await user_1.user.findByPk(userId);
        if (usr) {
            const secret = JSON.parse(usr.twoFactorSecret).base32;
            const verified = speakeasy_1.default.totp.verify({
                secret,
                encoding: "base32",
                token
            });
            if (verified) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    catch (error) {
        return error;
    }
};
exports.verifyTwoFactor = verifyTwoFactor;
