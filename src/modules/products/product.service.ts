import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { REPOSITORY } from 'src/core/constants';
import Product from 'src/core/database/models/product.model';
import { Repository } from 'sequelize-typescript';

@Injectable()
export class ProductService {
  constructor(
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, req: Request) {
    const user = (req as any).user;
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const product = await this.productRepository.create({
      ...createProductDto,
      userId: user.id,
    });

    return product;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findByPk(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}
