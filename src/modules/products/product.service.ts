import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { REPOSITORY } from 'src/core/constants';
import Product from 'src/core/database/models/product.model';

@Injectable()
export class ProductService {
  constructor(
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: typeof Product,
  ) {}

  async create(product: CreateProductDto): Promise<Product> {
    return await this.productRepository.create<Product>({ ...product });
  }

  //   async create(createProductDto: CreateProductDto, req: Request) {
  //     const user = (req as any).user; // Make sure req.user is defined
  //     if (!user) {
  //       throw new BadRequestException('User not found');
  //     }

  //     const product = await this.productRepository.create({
  //       ...createProductDto,
  //       userId: user.id,
  //     });

  //     return product;
  //   }
}

//   @Post()
//   async create(@Body() product: CreateProductDto, @Req() req: AuthUser) {
//     const userId = req.user.id;
//     return await this.productRepository.create({ ...product, userId });
//   }
