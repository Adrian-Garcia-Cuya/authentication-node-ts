import { regularExps } from "../../../config";

export class LoginUserDto {

    private constructor(
        public readonly email: string,
        public readonly password: string,
    ){}

    static create( object: { [key: string]: any } ): [ string?, LoginUserDto? ]
    {
        const { email, password } = object;

        if ( !email ) return ['Missing email'];
        if ( !regularExps.email.test(email) ) return ['Email invalid'];
        if ( !password ) return ['Missing password'];

        return [undefined, new LoginUserDto( email, password )];
    }
}