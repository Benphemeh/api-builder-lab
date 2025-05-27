import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryService } from './delivery.service';
import { NotFoundException } from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import { MailService } from 'src/core/mail/mail.service';
import { DELIVERY_STATUS } from 'src/core/enums';

const mockDelivery = {
  id: '1',
  orderId: 'order123',
  deliveryAddress: '123 Farm Lane',
  logisticsProvider: 'SwiftLog',
  status: DELIVERY_STATUS.PENDING,
  save: jest.fn(),
};

const mockOrder = {
  id: 'order123',
  userId: 'user123',
};

const mockUser = {
  id: 'user123',
  email: 'user@example.com',
  firstName: 'John',
};

const mockCreateDto = {
  orderId: 'order123',
  deliveryAddress: '123 Farm Lane',
  logisticsProvider: 'SwiftLog',
};

const mockUpdateDto = {
  status: DELIVERY_STATUS.DELIVERED,
};

describe('DeliveryService', () => {
  let service: DeliveryService;
  let deliveryRepository: any;
  let orderRepository: any;
  let userRepository: any;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: REPOSITORY.DELIVERY,
          useValue: {
            create: jest.fn().mockResolvedValue(mockDelivery),
            findOne: jest.fn(),
          },
        },
        {
          provide: REPOSITORY.ORDER,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: REPOSITORY.USER,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendOrderDeliveredEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeliveryService>(DeliveryService);
    deliveryRepository = module.get(REPOSITORY.DELIVERY);
    orderRepository = module.get(REPOSITORY.ORDER);
    userRepository = module.get(REPOSITORY.USER);
    mailService = module.get<MailService>(MailService);
  });

  describe('createDelivery', () => {
    it('should create a delivery', async () => {
      const result = await service.createDelivery(mockCreateDto);
      expect(result).toEqual(mockDelivery);
      expect(deliveryRepository.create).toHaveBeenCalledWith({
        ...mockCreateDto,
      });
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should update delivery status and send email', async () => {
      deliveryRepository.findOne.mockResolvedValue(mockDelivery);
      orderRepository.findOne.mockResolvedValue(mockOrder);
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.updateDeliveryStatus(
        'order123',
        mockUpdateDto,
      );

      expect(result.status).toBe(DELIVERY_STATUS.DELIVERED);
      expect(mockDelivery.save).toHaveBeenCalled();
      expect(mailService.sendOrderDeliveredEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        mockOrder.id,
        mockDelivery.deliveryAddress,
        mockDelivery.logisticsProvider,
      );
    });

    it('should throw if delivery is not found', async () => {
      deliveryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateDeliveryStatus('invalid-order', mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if order is not found', async () => {
      deliveryRepository.findOne.mockResolvedValue(mockDelivery);
      orderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateDeliveryStatus('order123', mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if user is not found', async () => {
      deliveryRepository.findOne.mockResolvedValue(mockDelivery);
      orderRepository.findOne.mockResolvedValue(mockOrder);
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateDeliveryStatus('order123', mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDeliveryByOrderId', () => {
    it('should return delivery if found', async () => {
      deliveryRepository.findOne.mockResolvedValue(mockDelivery);
      const result = await service.getDeliveryByOrderId('order123');
      expect(result).toEqual(mockDelivery);
    });

    it('should throw if delivery not found', async () => {
      deliveryRepository.findOne.mockResolvedValue(null);
      await expect(service.getDeliveryByOrderId('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
