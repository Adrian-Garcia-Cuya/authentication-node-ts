import jwt, { SignOptions } from 'jsonwebtoken';
import { envs } from './envs';

const JWT_SEED = envs.JWT_SEED;

export class JwtAdapter {

    static async generateToken( payload: any, duration: string = '2H' )
    {

        return new Promise(( resolve ) => {

            jwt.sign( payload, JWT_SEED, { expiresIn: duration } as SignOptions, ( err, token ) => {
                if ( err ) return resolve( null );

                resolve( token );
            });

        })
    }

    static validateToken<T>( token: string ): Promise<T | null>
    {
        return new Promise(( resolve ) => {
            jwt.verify( token, JWT_SEED, ( err, decoded ) => {
                if ( err ) return resolve( null );

                resolve( decoded as T );
            })
        });
    }
}