import { bcryptAdapter, envs, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import { EmailService } from "./email.service";

export class AuthService {

    constructor(
        private readonly emailService: EmailService,
    ){}

    public async registerUser( registerUserDto: RegisterUserDto )
    {
        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if ( existUser ) throw CustomError.badRequest( 'Email already exist' );

        try {
            const user = new UserModel( registerUserDto );

            user.password = bcryptAdapter.hash( registerUserDto.password );

            await user.save();

            await this.sendEmailValidationLink( user.email );

            const { password, ...userEntity } = UserEntity.fromObject( user );

            const token = await JwtAdapter.generateToken({ id: user.id, email: user.email });
            if ( !token ) throw CustomError.internalServer( 'Error while creating JWT' );

            return {
                user: userEntity,
                token,
            };
        }
        catch( error ) {
            console.log(error);
            throw CustomError.internalServer(`${ error }`);
        }
    }

    public async loginUser( loginUserDto: LoginUserDto )
    {
        try {
            const user = await UserModel.findOne({ email: loginUserDto.email })
        
            if ( !user ) throw CustomError.notFound('Email not found');

            const isValidPassword = bcryptAdapter.compare( loginUserDto.password, user.password );
            if ( !isValidPassword ) throw CustomError.badRequest('Password is not valid');
    
            const { password, ...userEntity } = UserEntity.fromObject( user );

            const token = await JwtAdapter.generateToken({ id: user.id, email: user.email });
            if ( !token ) throw CustomError.internalServer( 'Error while creating JWT' );
    
            return {
                user: userEntity,
                token,
            };
        }
        catch( error ) {
            throw error;
        }
    }

    private sendEmailValidationLink = async ( email: string ) =>
    {
        const token = await JwtAdapter.generateToken({ email });
        if ( !token ) throw CustomError.internalServer( 'Error getting token' );

        const link = `${ envs.WEBSERVICE_URL }/auth/validate-email/${ token }`;

        const html = `
            <h1>Validate your email</h1>
            <p>Click on the following link to validate your email</p>
            <a href="${ link }">Validate your email: ${ email }</a>
        `;

        const options = {
            to: email,
            subject: 'Validate your email',
            htmlBody: html,
        }

        const isSet = await this.emailService.sendEmail( options );
        if ( !isSet ) throw CustomError.internalServer( 'Error sending email' );

        return true;
    }

    public validateEmail = async( token: string ) =>
    {
        const payload = await JwtAdapter.validateToken( token );
        if ( !payload ) throw CustomError.unauthorized( 'Invalid token' );

        const { email } = payload as { email: string };
        if ( !email ) throw CustomError.internalServer( 'Email not in token' );

        const user = await UserModel.findOne({ email });
        if ( !user ) throw CustomError.badRequest( 'Email not exist' );

        user.emailValidated = true;
        await user.save();

        return true;
    }
}