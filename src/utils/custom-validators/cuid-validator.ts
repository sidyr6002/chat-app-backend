import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isCuid } from '@paralleldrive/cuid2';

// Custom validator constraint for CUID
@ValidatorConstraint({ name: 'isCuid', async: false })
export class IsCuidConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return isCuid(value); // Use the `isCuid` function from the `cuid` package
  }

  defaultMessage(): string {
    return 'The value must be a valid CUID.';
  }
}

/**
 * Validation decorator that checks if a given value is a valid CUID.
 *
 */
export function IsCuid(validationOptions?: ValidationOptions) {
  return function (targetObject: object, propertyName: string) {
    registerDecorator({
      target: targetObject.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCuidConstraint,
    });
  };
}
