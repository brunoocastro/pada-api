import { compareSync, genSaltSync, hashSync } from 'bcrypt';

export const cryptoHelper = {
  hashPassword: (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  },
  validatePassword: (possiblePassword: string, hash: string) => {
    return compareSync(possiblePassword, hash);
  },
};
