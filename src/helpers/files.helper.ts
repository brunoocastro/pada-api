export class filesHelper {
  private readonly basePath = '/uploads';
  readonly userPicture: {
    path: string;
    prefix: string;
  } = {
    path: this.basePath + '/userPictures',
    prefix: 'userPicture-',
  };

  readonly adoptionPicture: {
    path: string;
    prefix: string;
  } = {
    path: this.basePath + '/adoptionPictures',
    prefix: 'adoption-',
  };
}
