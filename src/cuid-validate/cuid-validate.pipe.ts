import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isCuid } from '@paralleldrive/cuid2';

@Injectable()
export class CuidValidatePipe implements PipeTransform {
  transform(value: any) {
    if (!isCuid(value)) {
      throw new BadRequestException('Invalid CUID format');
    }
    return value;
  }
}
