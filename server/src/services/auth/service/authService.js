import config from "../../../shared/config/index.js";
import AppError from "../../../shared/utils/AppError.js";
import jwt from "jsonwebtoken";
import logger from "../../../shared/config/logger.js"
import bcrypt from "bcryptjs";


/**
 * AuthService handles user authentication and authorization related operations such as onboarding super admin, user registration, login, and fetching user profile.
 * It interacts with the UserRepository to perform these operations and generates JWT tokens for authenticated users.
 */
export class AuthService {
    constructor(userRepository){
        if(!userRepository){
            throw new Error("UserRepository is Required");
        }
        this.userRepository = userRepository;
    };

    /**
     * Generates a JWT token for the given user.
     * @param {Object} user - The user object for which the token is generated.
     * @returns {string} - The generated JWT token.
     */
    generateToken(user) {
        const { _id, email, username, role, clientId } = user;

        const payload = {
            userId: _id,
            username,
            email,
            role,
            clientId
        }

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn
        })
    }

    /**
     * Formats the user object for response by removing sensitive information.
     * @param {Object} user - The user object to be formatted.
     * @returns {Object} - The formatted user object.
     */
    formatUserForResponse(user) {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    };

    /**
     * Compares the user-entered password with the hashed password.
     * @param {string} userEnteredPassword - The password entered by the user.
     * @param {string} hashedPassword - The hashed password stored in the database.
     * @returns {Promise<boolean>} - Returns true if the passwords match, otherwise false.
     */
    async comparePassword(userEnteredPassword, hashedPassword) {
        return await bcrypt.compare(userEnteredPassword, hashedPassword)
    }


    /**
     * Onboards a new super admin user.
     * @param {Object} superAdminData - The data of the super admin to be onboarded.
     * @returns {Promise<Object>} - Returns an object containing the user and token.
     */
    async onboardSuperAdmin(superAdminData) {
        try {
            const existingUser = await this.userRepository.findAll();

            if (existingUser && existingUser.length > 0) {
                throw new AppError("Super admin onboarding is disabled", 403);
            }

            const user = await this.userRepository.create(superAdminData);
            const token = this.generateToken(user);

            logger.info("Admin onboarded successfully", {
                username: user.username
            })

            return {
                user: this.formatUserForResponse(user),
                token
            }
        } catch (error) {
            logger.error("Error in onboarding Super admin", error)
            throw error
        }
    };
}