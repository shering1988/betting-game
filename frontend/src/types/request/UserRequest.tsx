type UserRequest = {
    name: string,
    password?: string,
    passwordRepeat?: string,
    reminder: boolean,
}

export default UserRequest;