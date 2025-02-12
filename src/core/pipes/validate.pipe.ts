import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export class ValidateInputPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    // Ensure errors is an array
    if (Array.isArray(errors) && errors.length > 0) {
      const messages = errors.map(
        (err) =>
          `${err.property} - ${Object.values(err.constraints).join(', ')}`,
      );
      throw new BadRequestException(messages);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

// import {
//   Injectable,
//   ArgumentMetadata,
//   BadRequestException,
//   ValidationPipe,
//   UnprocessableEntityException,
// } from '@nestjs/common';

// @Injectable()
// export class ValidateInputPipe extends ValidationPipe {
//   public async transform(value, metadata: ArgumentMetadata) {
//     try {
//       return await super.transform(value, metadata);
//     } catch (e) {
//       if (e instanceof BadRequestException) {
//         throw new UnprocessableEntityException(this.handleError(e));
//       }
//     }
//   }

//   private handleError(errors) {
//     return errors.map((error) => error.constraints);
//   }
// }
