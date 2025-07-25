import { ProductModel } from "../../data";
import { CreateProductDto, CustomError, PaginationDto } from "../../domain";

export class ProductService {

    constructor() {}

    async createProduct( createProductDto: CreateProductDto )
    {
        const productExists = await ProductModel.findOne({ name: createProductDto.name });
        if ( productExists ) throw CustomError.badRequest( 'Product already exists' );

        try {
            const product = new ProductModel( createProductDto );
            await product.save();

            return product;
        } catch ( error ) {
            throw CustomError.internalServer(`${ error }`);
        }
    }

    async getProducts( paginationDto: PaginationDto ): Promise<any>
    {
        const { page, limit } = paginationDto;
        try {
            const [ total, products ] = await Promise.all([
                ProductModel.countDocuments(),
                ProductModel.find()
                             .skip( (page - 1) * limit )
                             .limit( limit )
                             .populate('user') //* Populate => Cargar relaciones
                             .populate('category'),
            ]);

            return {
                page,
                limit,
                total,
                next: `api/products?page=${ (page + 1) }&limit=${ limit }`,
                prev: !(page - 1) ? null : `api/products?page=${ (page - 1) }&limit=${ limit }`,
                products,
            };
        }
        catch ( error ) {
            throw CustomError.internalServer(`${ error }`);
        }
    }
}