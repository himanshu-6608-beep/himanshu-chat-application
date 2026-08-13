import { getUser } from "../services/auth.js";

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No authorization header"
            });
        }

        const token = authHeader.split(" ")[1];
        const user = getUser(token);

        req.user = user;

        next();

    } catch (error) {
        console.log("AUTH ERROR:", error);

        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

export default authMiddleware;