type RegisterRequest = {
    name: string,
    password: string,
    passwordRepeat: string,
    reminder: boolean,
    secret: string,
    email: string,
}

export default RegisterRequest;