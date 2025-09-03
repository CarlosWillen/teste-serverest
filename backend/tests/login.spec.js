import { test, expect, request } from '@playwright/test';

// Classe para login
class LoginAPI {
  constructor(apiContext) {
    this.apiContext = apiContext;
    this.baseUrl = '/login';
  }

  async login(email, password) {
    const response = await this.apiContext.post(this.baseUrl, {
      data: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await response.json();
    return { response, body };
  }
}

test.describe('API - Login', () => {
  let apiContext;
  let loginAPI;

  // Usuário fixo para os testes
  const usuarioTeste = {
    email: 'teste@qa.com',
    password: '12345'
  };

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: 'https://serverest.dev' });
    loginAPI = new LoginAPI(apiContext);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Deve logar com sucesso com usuário válido', async () => {
    const { response, body } = await loginAPI.login(usuarioTeste.email, usuarioTeste.password);

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('authorization');
    expect(typeof body.authorization).toBe('string');
  });

  test('Não deve logar com usuário inválido', async () => {
    const { response, body } = await loginAPI.login('invalido@qa.com', 'senhaerrada');

    expect(response.status()).toBe(401);
    expect(body).toHaveProperty('message');
    expect(body.message).toBe('Email e/ou senha inválidos');
  });

  test('Não deve logar com senha vazia', async () => {
    const { response, body } = await loginAPI.login(usuarioTeste.email, '');

    expect(response.status()).toBe(400);
    expect(body).toHaveProperty('password'); 
    expect(body.password).toContain('não pode ficar em branco');
  });
});