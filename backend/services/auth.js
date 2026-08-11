import jwt from "jsonwebtoken"
export const secret = "Himani@+1208"
export function setUser(user) {
    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
            name: user.name,
        },
        secret
    );
}

export function getUser(token) {
    if (!token) return null;
    return jwt.verify(token, secret)
}
