import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery.dto';
import { NotFoundException } from '@nestjs/common';
import { DELIVERY_STATUS } from 'src/core/enums';
import Delivery from 'src/core/database/models/delivery.model'; // ✅ Import the model

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let service: DeliveryService;

  const mockDelivery: Partial<Delivery> = {
    id: '1',
    orderId: 'order123',
    deliveryAddress: '123 Farm Lane',
    logisticsProvider: 'SwiftLog',
    status: DELIVERY_STATUS.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  const mockCreateDto: CreateDeliveryDto = {
    orderId: 'order123',
    deliveryAddress: '123 Farm Lane',
    logisticsProvider: 'SwiftLog',
  };

  const mockUpdateDto: UpdateDeliveryStatusDto = {
    status: DELIVERY_STATUS.DELIVERED,
  };

  const mockService = {
    createDelivery: jest.fn(),
    updateDeliveryStatus: jest.fn(),
    getDeliveryByOrderId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        {
          provide: DeliveryService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
    service = module.get<DeliveryService>(DeliveryService);
  });

  describe('createDelivery', () => {
    it('should call service to create delivery and return result', async () => {
      jest
        .spyOn(service, 'createDelivery')
        .mockResolvedValue(mockDelivery as Delivery);

      const result = await controller.createDelivery(mockCreateDto);

      expect(service.createDelivery).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockDelivery);
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should call service to update delivery status and return result', async () => {
      const updatedDelivery = {
        ...mockDelivery,
        status: DELIVERY_STATUS.DELIVERED,
      };

      jest
        .spyOn(service, 'updateDeliveryStatus')
        .mockResolvedValue(updatedDelivery as Delivery);

      const result = await controller.updateDeliveryStatus(
        'order123',
        mockUpdateDto,
      );

      expect(service.updateDeliveryStatus).toHaveBeenCalledWith(
        'order123',
        mockUpdateDto,
      );
      expect(result.status).toBe('delivered');
    });

    it('should throw NotFoundException if delivery not found', async () => {
      jest
        .spyOn(service, 'updateDeliveryStatus')
        .mockRejectedValue(new NotFoundException('Delivery not found'));

      await expect(
        controller.updateDeliveryStatus('invalid', mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDeliveryByOrderId', () => {
    it('should return delivery if found', async () => {
      jest
        .spyOn(service, 'getDeliveryByOrderId')
        .mockResolvedValue(mockDelivery as Delivery);

      const result = await controller.getDeliveryByOrderId('order123');

      expect(service.getDeliveryByOrderId).toHaveBeenCalledWith('order123');
      expect(result).toEqual(mockDelivery);
    });

    it('should throw NotFoundException if not found', async () => {
      jest
        .spyOn(service, 'getDeliveryByOrderId')
        .mockRejectedValue(
          new NotFoundException('Delivery for order not found'),
        );

      await expect(controller.getDeliveryByOrderId('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
