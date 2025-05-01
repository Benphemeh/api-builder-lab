export enum USER_ROLE {
  SUPER_ADMIN = 'super admin',
  ADMIN = 'admin',
  AUTHOR = 'author',
}

export enum OperationStatus {
  ERROR = 'error',
  SUCCESS = 'success',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum DELIVERY_STATUS {
  PENDING = 'pending',
  IN_TRANSIT = 'in-transit',
  DELIVERED = 'delivered',
}

export enum ORDER_STATUS {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}
