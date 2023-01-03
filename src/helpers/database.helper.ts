import { AdoptionQueryParams } from '../app/adoption/interfaces/DefaultQueryParams.interface';

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
  }: AdoptionQueryParams) => ({
    where: {
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { breed: { contains: search } },
            ],
          }
        : {}),
      adoptionState: only_available ? 'INPROGRESS' : {},
    },
    skip: (page - 1) * page_size,
    take: page_size,
  }),
};
