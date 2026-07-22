import config from "../../../shared/config/index.js";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";
import ResponseFormatter from "../../../shared/utils/responseFormatter.js"

/**
 * @description AuthController handles user authentication and authorization related operations such as onboarding super admin, user registration, login, fetching user profile, and logout.
 * It interacts with the AuthService to perform these operations and formats the responses using ResponseFormatter.
 */
export class AuthController {
    constructor(authService){
        if(!authService){
            throw new Error("AuthService is Required");
        }
        this.authService = authService;
    };

    /**
     * Onboards a new super admin user.
     * @param {Request} req - The request object containing user details.
     * @param {Response} res - The response object used to send the response.
     * @param {Function} next - The next middleware function in the request-response cycle.
     */
    async onboardSuperAdmin(req, res, next) {
        try {
            const { username, email, password } = req.body;

            const superAdminData = {
                username, email, password, role: APPLICATION_ROLES.SUPER_ADMIN
            };

            const { token, user } = await this.authService.onboardSuperAdmin(superAdminData);

            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.expiresIn
            });

            res.status(201).json(ResponseFormatter.success(user, "Super admin created successfully", 201))
        } catch (error) {
            next(error)
        }
    };
}