export const mailHelper = {
  projectName: process.env.PROJECT_NAME,
  projectUrl: process.env.PROJECT_URL,

  from: {
    email: 'bruno.c0310@gmail.com',
    name: 'Projeto Amigo dos Animais',
  },
  reply_to: {
    email: 'bruno.c0310@gmail.com',
    name: 'Projeto Amigo dos Animais',
  },
  accountConfirmation: {
    subject: 'Confirme sua conta aqui!',
    actionType: 'confirmar conta',
    titleText: 'Confirme sua conta',
  },
};
