import { RequestHandler } from "express";
import { user } from "../models/user";
import { comparePasswords, hashPassword } from "../services/auth";
import { signUserToken, verifyUser } from "../services/authService";
import { organization } from "../models/organization";
import speakeasy from 'speakeasy';

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
    }
}

export const verifyTwoFactor: RequestHandler = async (req, res, next) => {
    let userId = req.params.id
    const token = req.body.token
    try {
        const usr = await user.findByPk(userId)
        if (usr) {
            const secret = JSON.parse(usr.twoFactorSecret).base32
            
            const verified = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token
            })
            
            if (verified) {
                res.status(200).json({verified: true}) 
            } else {
                res.status(401).json({verified: false})
            }
        }
    } catch (error) {
        res.status(500).send(error)
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

    try {
        // Look up user by their email
        let existingUser: user | null = await user.findOne({
            where: { email: req.body.email }
        });

        // If user exists, check that password matches
        if (existingUser) {
            let passwordsMatch = await comparePasswords(req.body.password, existingUser.password);

            // If passwords match, create a JWT
            if (passwordsMatch) {
                let token = await signUserToken(existingUser);
                res.status(200).json(token);
            }
            else {
                res.status(401).json('Invalid password');
            }
        }
        else {
            res.status(401).json('Invalid email');
        }
    } catch {
        res.status(500).send()
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