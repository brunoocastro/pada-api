import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import {
  AdoptionOrderingOptions,
  AdoptionQueryParams,
} from '../interfaces/DefaultQueryParams.interface';

const defaultPageSize = 10;
const defaultInitialPage = 1;

export const ParseQueryParams = createParamDecorator(
  (data: unknown, context: ExecutionContext): AdoptionQueryParams => {
    const { query } = context.switchToHttp().getRequest<Request>();

    const search = query?.search ? query.search.toString() : undefined;
    const page_size = Number(query?.page_size ?? defaultPageSize);
    const page = Number(query?.page ?? defaultInitialPage);
    const only_available =
      query.only_available !== undefined
        ? query.only_available.toString().toLowerCase() === 'true'
        : true;

    const raw_ordering = query?.ordering ?? undefined;
    const ordering = [];

    if (raw_ordering !== undefined) {
      const orderingString = raw_ordering
        .toString()
        .toLowerCase()
        .split(',')[0];
      const orderingProp = orderingString.startsWith('-')
        ? orderingString.slice(1, orderingString.length)
        : orderingString;
      const orderingType = orderingString.startsWith('-') ? 'desc' : 'asc';

      if (!AdoptionOrderingOptions.includes(orderingProp))
        throw new BadRequestException({
          message: 'Bad Request',
          statusCode: 400,
          description: `This ordering param is not available`,
          availableParams: {
            asc: AdoptionOrderingOptions.join(','),
            desc: AdoptionOrderingOptions.map((option) => '-' + option).join(
              ',',
            ),
          },
        });
      ordering.push({
        [orderingProp]: orderingType,
      });
    }

    return { ordering, page, page_size, search, only_available };
  },
);
