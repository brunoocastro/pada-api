import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import {
  AdoptionOrderingOptions,
  AdoptionQueryParams,
} from '../interfaces/DefaultQueryParams.interface';

const defaultPageSize = 10;
const defaultInitialPage = 1;

export const ParseQueryParams = createParamDecorator(
  (data: unknown, context: ExecutionContext): AdoptionQueryParams => {
    const request = context.switchToHttp().getRequest<Request>();

    const search = request?.params?.search ?? undefined;
    const page_size = Number(request?.params?.page_size ?? defaultPageSize);
    const page = Number(request?.params?.page ?? defaultInitialPage);
    const raw_ordering = request?.params?.ordering ?? undefined;
    const ordering: AdoptionQueryParams['ordering'] = [];

    const possibleOrdering = raw_ordering
      ? raw_ordering.startsWith('-')
        ? raw_ordering.slice(0, raw_ordering.length - 1)
        : raw_ordering
      : undefined;

    const orderingType = raw_ordering
      ? raw_ordering.startsWith('-')
        ? 'desc'
        : 'asc'
      : undefined;

    // Todo -> parse of ordering props
    // if (AdoptionOrderingOptions.includes(possibleOrdering as any)) {
    //   const obj: AdoptionQueryParams['ordering'][number] = {};
    //   (obj[possibleOrdering] = orderingType), ordering.push(obj);
    // }

    return { ordering, page, page_size, search };
  },
);
