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
import { MailService } from 'src/core/mail/mail.service';
import { Op } from 'sequelize';

@Injectable()
export class ProductService {
  constructor(
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: Repository<Product>,
    private readonly mailService: MailService,
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

    // Send email notification
    await this.mailService.sendProductListedEmail(
      user.email,
      user,
      createProductDto.name, // Assuming the product name is in the DTO
    );

    return product;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findByPk(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
    category: string,
  ): Promise<{ data: Product[]; total: number }> {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (category) {
      where.category = category;
    }
    const { rows, count } = await this.productRepository.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return { data: rows, total: count };
  }
}
