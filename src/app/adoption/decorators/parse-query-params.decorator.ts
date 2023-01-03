import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  Param,
} from '@nestjs/common';
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
    // applyDecorators(
    //   @Param('search'),
    //   @Param('search'),
    //   @Param('search'),
    // )
    const { query } = context.switchToHttp().getRequest<Request>();

    const search = query?.search ? query.search.toString() : undefined;
    const page_size = Number(query?.page_size ?? defaultPageSize);
    const page = Number(query?.page ?? defaultInitialPage);
    const raw_ordering = query?.ordering ?? undefined;
    const ordering: AdoptionQueryParams['ordering'] = [];
    const only_available =
      query.only_available !== undefined
        ? query.only_available.toString().toLowerCase() === 'true'
        : true;

    console.log({ only_available, query });

    // const possibleOrdering = raw_ordering
    //   ? raw_ordering.startsWith('-')
    //     ? raw_ordering.slice(0, raw_ordering.length - 1)
    //     : raw_ordering
    //   : undefined;

    // const orderingType = raw_ordering
    //   ? raw_ordering.startsWith('-')
    //     ? 'desc'
    //     : 'asc'
    //   : undefined;

    // Todo -> parse of ordering props
    // if (AdoptionOrderingOptions.includes(possibleOrdering as any)) {
    //   const obj: AdoptionQueryParams['ordering'][number] = {};
    //   (obj[possibleOrdering] = orderingType), ordering.push(obj);
    // }

    return { ordering, page, page_size, search, only_available };
  },
);
