import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { FileUploadService } from "../services/file-upload.service";
import { UploadedFile } from "express-fileupload";

export class FileUploadController {

    constructor(
        private readonly fileUploadService: FileUploadService,
    ){}

    private handleError = ( error: unknown, res: Response ) =>
    {
        if ( error instanceof CustomError ) {
            return res.status( error.statusCode ).json({ error: error.message });
        }

        return res.status( 500 ).json({ error: 'Internal server error' });
    }

    uploadFile = async( req: Request, res: Response ) =>
    {
        const type = req.params.type;

        const file = req.body.files.at( 0 ) as UploadedFile;

        this.fileUploadService.uploadSingle( file, `uploads/${ type }` )
            .then( uploaded => res.json( uploaded ))
            .catch( error => this.handleError( error, res ));
    }
    
    uploadMultipleFiles = async( req: Request, res: Response ) =>
    {
        const type = req.params.type;

        const files = req.body.files as UploadedFile[];
        
        this.fileUploadService.uploadMultipe( files, `uploads/${ type }` )
            .then( uploaded => res.json( uploaded ))
            .catch( error => this.handleError( error, res ));
    }
}