import { CategoryModel } from "../../data";
import { CategoryEntity, CreateCategoryDto, CustomError, PaginationDto, UserEntity } from "../../domain";

export class CategoryService {

    constructor() {}

    async createCategory( createCategoryDto: CreateCategoryDto, user: UserEntity )
    {
        const categoryExists = await CategoryModel.findOne({ name: createCategoryDto.name });
        if ( categoryExists ) throw CustomError.badRequest( 'Category already exists' );

        try {
            const category = new CategoryModel({
                ...createCategoryDto,
                user: user.id,
            })
            await category.save();

            return CategoryEntity.fromObject( category );
        } catch ( error ) {
            throw CustomError.internalServer(`${ error }`);
        }
    }
    async getCategories( paginationDto: PaginationDto ): Promise<any>
    {
        const { page, limit } = paginationDto;
        try {
            const [ total, categories ] = await Promise.all([
                CategoryModel.countDocuments(),
                CategoryModel.find()
                             .skip( (page - 1) * limit )
                             .limit( limit ),
            ]);
        
            const categoryEntities = categories.map( category => {
                return CategoryEntity.fromObject( category );
            });

            return {
                page,
                limit,
                total,
                next: `api/categories?page=${ (page + 1) }&limit=${ limit }`,
                prev: !(page - 1) ? null : `api/categories?page=${ (page - 1) }&limit=${ limit }`,
                categories: categoryEntities,
            };
        }
        catch ( error ) {
            throw CustomError.internalServer(`${ error }`);
        }
    }
}