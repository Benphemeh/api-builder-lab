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
import { UpdateProductDto } from './dto/update-product.dto';
import { UsersService } from '../users/users.service';
import * as fs from 'fs';
import cloudinary from 'src/core/cloudinary/cloudinary.config';

@Injectable()
export class ProductService {
  constructor(
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: Repository<Product>,
    private readonly mailService: MailService,
    private readonly userService: UsersService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    req: Request,
    file?: Express.Multer.File,
  ) {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new BadRequestException('User not found');
    }

    const user = await this.userService.findOneById(userId); // <-- fetch full user

    if (!user) {
      throw new BadRequestException('User not found');
    }

    let imageUrl = createProductDto.imageUrl ?? null;

    if (file) {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'products',
        public_id: createProductDto.name,
      });

      imageUrl = uploadResult.secure_url;

      fs.unlinkSync(file.path);
    }

    const product = await this.productRepository.create({
      ...createProductDto,
      userId: user.id,
      imageUrl,
    });

    // Send email notification
    await this.mailService.sendProductListedEmail(
      user.email,
      user,
      createProductDto.name,
      createProductDto.price,
      createProductDto.stock,
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
    size?: string,
    breed?: string,
    type?: string,
  ): Promise<{ data: Product[]; total: number }> {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (category) {
      where.category = category;
    }

    if (size) {
      where.size = size;
    }

    if (breed) {
      where.breed = breed;
    }

    if (type) {
      where.type = type;
    }

    const { rows, count } = await this.productRepository.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return { data: rows, total: count };
  }
  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findByPk(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await product.update(updateProductDto);

    console.log(`Product ${product.name} updated successfully`);

    if (product.userId) {
      try {
        const user = await this.userService.findOneById(product.userId);

        if (user && user.email) {
          await this.mailService.sendProductUpdatedEmail(
            user.email,
            user,
            product.name,
            product.price,
            product.stock,
          );
        }
      } catch (error) {
        console.error(`Failed to send email update : ${error.message}`);
      }
    }

    console.log(`Product ${product.name} updated successfully`);
    return product;
  }
  async restockProduct(productId: string, quantity: number): Promise<Product> {
    const product = await this.productRepository.findByPk(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.stock += quantity;
    await product.save();

    // Send restock notification email
    if (product.userId) {
      try {
        const user = await this.userService.findOneById(product.userId);
        if (user && user.email) {
          await this.mailService.sendProductRestockedEmail(
            user.email,
            user,
            product.name,
            product.stock,
          );
        }
      } catch (error) {
        console.error(`Failed to send restock email: ${error.message}`);
      }
    }

    console.log(
      `Product ${product.name} restocked successfully. New stock: ${product.stock}`,
    );
    return product;
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const product = await this.productRepository.findByPk(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await product.destroy();

    return { message: `Product with ID ${id} has been successfully deleted` };
  }
}
