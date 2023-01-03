import {
  AdoptionOrderingOptions,
  AdoptionQueryParams,
} from '../app/adoption/interfaces/DefaultQueryParams.interface';

export const databaseHelper = {
  getSelectorParams: (canSeeDonorInfo = false) => ({
    select: {
      adoptionState: true,
      breed: true,
      gender: true,
      id: true,
      name: true,
      pictures: true,
      species: true,
      donorId: canSeeDonorInfo,
      donor: canSeeDonorInfo
        ? {
            select: {
              email: true,
              password: false,
              name: true,
              id: true,
              phone: true,
            },
          }
        : false,
    },
  }),
  getFindManyParams: ({
    page,
    page_size,
    search,
    only_available,
    ordering,
  }: AdoptionQueryParams) => ({
    where: {
      ...(search
        ? {
            OR: AdoptionOrderingOptions.forEach((param) => ({
              [param]: { contains: search },
            })),
          }
        : {}),
      adoptionState: only_available ? 'INPROGRESS' : {},
    },
    orderBy: ordering,
    skip: (page - 1) * page_size,
    take: page_size,
  }),
};
