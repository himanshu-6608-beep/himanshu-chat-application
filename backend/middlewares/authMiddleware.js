import { getUser } from "../services/auth.js";

const authMiddleware = (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const user = getUser(token);

        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

export default authMiddleware;