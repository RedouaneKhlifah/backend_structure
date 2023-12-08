import jwt from "jsonwebtoken";

// generate a token from the signature jwt_secret
const accessTokenGenerator = (user) => {
    const token = jwt.sign(
        {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "5min"
        }
    );
    return token;
};

// generate a token from the signature jwt_secret
const refreshTokenCreator = (res, user) => {
    const token = jwt.sign(
        {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "1d"
        }
    );

    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 24 * 60 * 60 * 1000
    });
    return token;
};

export { accessTokenGenerator, refreshTokenCreator };
