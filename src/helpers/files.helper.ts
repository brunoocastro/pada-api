export class filesHelper {
  readonly basePath = '/uploads';
  userPicture: {
    path: string;
    prefix: string;
  } = {
    path: this.basePath + '/userPictures',
    prefix: 'userPicture-',
  };
}
