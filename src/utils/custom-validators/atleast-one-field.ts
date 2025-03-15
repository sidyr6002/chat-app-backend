import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneField', async: false })
export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [fields] = args.constraints;
    const object = args.object as Record<string, any>;
    return fields.some((field: string) => !!object[field]);
  }

  defaultMessage(args: ValidationArguments) {
    const [fields] = args.constraints;
    return `At least one of the following fields must be provided: ${fields.join(', ')}.`;
  }
}

/**
 * Validation decorator that checks if at least one of the given fields
 * is present in the validated object.
 *
 */
export function AtLeastOneField(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [fields],
      validator: AtLeastOneFieldConstraint,
    });
  };
}
