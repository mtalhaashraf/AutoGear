// application
import { delayResponse, error } from "~/server/utils";
import { IEditProfileData } from "~/api/base";
import { IUser } from "~/interfaces/user";

export function accountSignIn(email: string, password: string): Promise<IUser> {
    if (email === "affan@gmail.com" && password === "123456") {
        const user: IUser = {
            email: "affan@gmail.com",
            phone: "38 972 588-42-36",
            firstName: "Affan",
            lastName: "Ashraf",
            avatar: "/images/avatars/avatar.jpeg",
        };

        return delayResponse(Promise.resolve(user));
    }

    return delayResponse(() => error("AUTH_WRONG_PASSWORD"));
}

export function accountSignUp(email: string, password: string): Promise<IUser> {
    if (!/^.+@.+$/.test(email)) {
        return delayResponse(() => error("AUTH_INVALID_EMAIL"));
    }

    if (email === "red-parts@example.com") {
        return delayResponse(() => error("AUTH_EMAIL_ALREADY_IN_USE"));
    }

    if (password.length < 6) {
        return delayResponse(() => error("AUTH_WEAK_PASSWORD"));
    }

    const user: IUser = {
        email,
        phone: "38 972 588-42-36",
        firstName: "Ryan",
        lastName: "Ford",
        avatar: "//www.gravatar.com/avatar/bde30b7dd579b3c9773f80132523b4c3?d=mp&s=88",
    };

    return delayResponse(Promise.resolve(user));
}

export function accountSignOut(): Promise<void> {
    return Promise.resolve();
}

export function accountEditProfile(data: IEditProfileData): Promise<IUser> {
    const user: IUser = {
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: "//www.gravatar.com/avatar/bde30b7dd579b3c9773f80132523b4c3?d=mp&s=88",
    };

    return delayResponse(Promise.resolve(user));
}

export function accountChangePassword(oldPassword: string, newPassword: string, id: string): Promise<void> {
    if (newPassword.length < 8) {
        return delayResponse(() => error("AUTH_WEAK_PASSWORD"));
    }

    return delayResponse(Promise.resolve());
}
