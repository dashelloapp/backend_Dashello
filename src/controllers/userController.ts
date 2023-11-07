import { RequestHandler } from "express";
import { user } from "../models/user";
import { comparePasswords, hashPassword, verifyTwoFactor } from "../services/auth";
import { signUserToken, verifyUser } from "../services/authService";
import { organization } from "../models/organization";
import speakeasy from 'speakeasy';
import jwt, { sign } from 'jsonwebtoken';

export const getUser: RequestHandler = async (req, res, next) => {
    let usr = await verifyUser(req)

    if (usr) {
        let users = user.findAll()
        res.status(200).json(users)
    } else {
        res.status(401).send()
    }
}

export const getallUsers: RequestHandler = async (req, res, next) => {
    let usr = await verifyUser(req)

    if (usr) {
        let users = await user.findAll();
        res.status(200).json(users)
    } else {
        res.status(401).send()
    }
};

export const createUserAndOrg: RequestHandler = async (req, res, next) => {

    let newUser: user = req.body.user;
    let newOrganization: organization = req.body.organization;

    //Creating organization & user
    let createdOrg = undefined
    if (newOrganization.organization && newOrganization.billing_address && newOrganization.mailing_address && newOrganization.membership_plan) {

        //Stringifying all JSON objects
        try {
            if (typeof newOrganization.billing_address !== "string") {
                newOrganization.billing_address = JSON.stringify(newOrganization.billing_address)
            }
            if (typeof newOrganization.mailing_address !== "string") {
                newOrganization.mailing_address = JSON.stringify(newOrganization.mailing_address)
            }
            if (newOrganization.card_information) {
                if (typeof newOrganization.card_information !== "string") {
                    newOrganization.card_information = JSON.stringify(newOrganization.card_information)
                }
            }
            if (newOrganization.membership_plan) {
                if (typeof newOrganization.membership_plan !== "string") {
                    newOrganization.membership_plan = JSON.stringify(newOrganization.membership_plan)
                }
            }
        } catch {
            res.status(500).send("Error parsing JSON data for organization")
        }

        //Create the organization
        createdOrg = await organization.create(newOrganization)

        if (createdOrg) {
            try {
                if (newUser.email && newUser.password && newUser.firstName && newUser.lastName && newUser.userType) {
                    let hashedPassword = await hashPassword(newUser.password);
                    newUser.password = hashedPassword;

                    //Generating 2FA secret
                    let secret = speakeasy.generateSecret()
                    newUser.twoFactorSecret = JSON.stringify(secret)

                    //When creating a user, it will automatically make the first user the owner, should this be changed?
                    newUser.role = "owner"

                    //userType can possibly be an admin user for overlooking the entire platform
                    newUser.userType = "user"
                    newUser.organizationId = createdOrg.dataValues.organizationId
                    let createdUser = await user.create(newUser);

                    //If the user is created, update the organization to add the user to it's organizationUsers
                    if (createdUser) {
                        try {
                            createdOrg.dataValues.organizationUsers = JSON.stringify([createdUser.userId])
                            let updatedOrg = await organization.update(createdOrg.dataValues, { where: { organizationId: createdOrg.dataValues.organizationId } })
                            let org = await organization.findByPk(createdOrg.dataValues.organizationId)

                            if (updatedOrg) {
                                res.status(201).json({
                                    organization: org,
                                    secret: secret.base32,
                                    user: createdUser
                                });
                            }
                        } catch {
                            res.status(500).send("Error setting userId in the organization")
                        }
                    }


                }
                else {
                    res.status(400).send('Missing feilds for the user');
                }
            } catch {
                res.status(500).send("Error creating User")
            }
        } else {
            res.status(500).send("Error creating organization")
        }
    } else {
        res.status(400).send("Not enough information for the organization")
    }
}

export const createUser: RequestHandler = async (req, res, next) => {
    try {
        let newUser: user = req.body;
        if (newUser.email && newUser.password && newUser.organizationId && newUser.firstName && newUser.lastName && newUser.userType) {
            let hashedPassword = await hashPassword(newUser.password);
            newUser.password = hashedPassword;
            let created = await user.create(newUser);
            res.status(201).json({
                email: created.email,
                userId: created.userId
            });
        }
        else {
            res.status(400).send('email and password required');
        }
    } catch {
        res.status(500).send()
    }
}

export const loginUser: RequestHandler = async (req, res, next) => {
    console.log(req.body.token)
    try {
        if (req.body.email && req.body.password && req.body.token) {
            console.log(req.body.token)
            // Look up user by their email
            let existingUser: user | null = await user.findOne({
                where: { email: req.body.email }
            });

            // If user exists, check that password matches
            if (existingUser) {
                let passwordsMatch = await comparePasswords(req.body.password, existingUser.password);

                // If passwords match, verify 2FA token
                if (passwordsMatch) {
                    let verified = await verifyTwoFactor(req.body.token, existingUser.userId)

                    //If 2FA token is verified, return the JWT token
                    if (verified) {
                        let token = await signUserToken(existingUser);
                        res.status(200).send(token)
                    } else {
                        res.status(401).send("Invalid 2FA code")
                    }
                }
                else {
                    res.status(401).send('Invalid password');
                }
            }
            else {
                res.status(401).send('Invalid email');
            }
        } else {
            res.status(400).send("password, email and 2FA token reqired")
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

export const googleSignIn: RequestHandler = async (req, res, next) => {
    try {
        const googleResponce = req.body

        //Decoding the google responce token from the google sign in
        const decodedGoogleResponce: any = jwt.decode(googleResponce)
        console.log(decodedGoogleResponce)


        if (decodedGoogleResponce) {
            //Seeing if there is a user's email that matches the google account
            let usr = await user.findOne({ where: { email: decodedGoogleResponce.email } })

            if (usr) {
                //Checking if there is a profile picture for the user. If there isn't, take the one from the google account
                if (!usr.profilePicture) {
                    let newUser = usr
                    newUser.profilePicture = decodedGoogleResponce.picture
                    user.update(newUser, {where: {userId: usr.userId}})
                }

                //Creating token and sending it to the frontend
                const dashelloToken = await signUserToken(usr)
                res.status(200).send(dashelloToken)
            } else {
                res.status(400).send("No user with that email")
            }
        } else {
            res.status(500).send("error decoding google token")
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

export const verify: RequestHandler = async (req, res, next) => {
    try {
        let usr = await verifyUser(req)

        if (usr) {
            res.status(200).send(true)
        } else {
            res.status(200).send(false)
        }
    } catch {
        res.status(500).send()
    }
}