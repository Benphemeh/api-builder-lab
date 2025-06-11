import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { ProductService } from '../products/product.service';
import { UsersService } from '../users/users.service';
import { Coupon, Delivery, Product } from 'src/core/database';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ORDER_STATUS } from 'src/core/enums';
import { DeliveryService } from '../delivery/delivery.service';
import { CreateDeliveryDto } from '../delivery/dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from '../delivery/dto/update-delivery.dto';
import { REPOSITORY } from 'src/core/constants';
import { Repository } from 'sequelize-typescript';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { CreateCouponDto } from './dto/coupon.dto';
import * as csvParse from 'csv-parse/sync';
import * as XLSX from 'xlsx';

@Injectable()
export class AdminService {
  constructor(
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: Repository<Product>,
    @Inject(REPOSITORY.COUPON)
    private readonly couponRepository: Repository<Coupon>,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly usersService: UsersService,
    private readonly deliveryService: DeliveryService,
  ) {}

  async getAllOrders(filters: {
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<any> {
    return this.orderService.getAllOrders(filters);
  }

  async getOrderById(id: string): Promise<any> {
    const order = await this.orderService.getOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async updateOrderStatus(id: string, status: ORDER_STATUS): Promise<any> {
    return this.orderService.updateOrder(id, { status });
  }

  async deleteOrder(id: string): Promise<any> {
    const order = await this.orderService.getOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    await this.orderService.deleteOrder(id);
    return { message: `Order with id ${id} deleted successfully` };
  }

  async getAllProducts(
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
    return this.productService.findAll(
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      category,
      size,
      breed,
      type,
    );
  }
  async getProductById(id: string): Promise<Product> {
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
  async create(
    createProductDto: CreateProductDto,
    req: Request,
  ): Promise<Product> {
    const user = (req as any).user;

    const userId = createProductDto.userId || user?.id;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    console.log(`Creating product for user ID: ${userId}`);

    const product = await this.productRepository.create({
      ...createProductDto,
      userId,
    });

    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findByPk(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    console.log(`Updating product with ID: ${id}`);
    await product.update(updateProductDto);
    return product;
  }

  async deleteProduct(id: string): Promise<any> {
    return this.productService.deleteProduct(id);
  }

  async getDeliveryByOrderId(orderId: string): Promise<Delivery> {
    return this.deliveryService.getDeliveryByOrderId(orderId);
  }

  async createDelivery(dto: CreateDeliveryDto): Promise<Delivery> {
    return this.deliveryService.createDelivery(dto);
  }
  async bulkUploadProducts(file: Express.Multer.File, req: any) {
    const ext = file.originalname.split('.').pop().toLowerCase();
    let products: any[] = [];

    if (ext === 'csv') {
      const csvString = file.buffer.toString();
      products = csvParse.parse(csvString, {
        columns: true,
        skip_empty_lines: true,
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      products = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      throw new BadRequestException('Unsupported file type');
    }
    const user = req.user;
    const createdProducts = [];
    for (const prod of products) {
      // Map CSV/Excel fields to dto
      const createProductDto = {
        name: prod.name,
        description: prod.description,
        price: Number(prod.price),
        stock: Number(prod.stock),
        category: prod.category,
        size: prod.size,
        breed: prod.breed,
        type: prod.type,
        imageUrl: prod.imageUrl,
        userId: user.id,
      };
      const product = await this.productRepository.create(createProductDto);
      createdProducts.push(product);
    }

    return {
      message: `${createdProducts.length} products uploaded successfully`,
      products: createdProducts,
    };
  }
  async getAllDeliveries(filters: {
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Delivery[]> {
    return this.deliveryService.getAllDeliveries(filters);
  }
  async updateDeliveryStatus(
    orderId: string,
    dto: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    return this.deliveryService.updateDeliveryStatus(orderId, dto);
  }
  async createCoupon(dto: CreateCouponDto): Promise<Coupon> {
    return this.couponRepository.create({ ...dto });
  }

  async getCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }
    return coupon;
  }
  async getAllCoupons(filters: {
    search?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Coupon[]> {
    const where: any = {};

    if (filters.search) {
      where.code = { $like: `%${filters.search}%` };
    }

    if (filters.fromDate && filters.toDate) {
      where.createdAt = {
        $between: [new Date(filters.fromDate), new Date(filters.toDate)],
      };
    }

    return this.couponRepository.findAll({ where });
  }
  async deleteCoupon(id: string): Promise<{ message: string }> {
    const coupon = await this.couponRepository.findByPk(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    await coupon.destroy();

    return { message: `Coupon with ID ${id} has been successfully deleted` };
  }
}
