import { expect, request, test } from '@playwright/test';

const baseURL = 'https://serverest.dev';

test.describe('API - Usuários', () => {
  let apiContext;
  let userId;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await request.newContext({
      baseURL: baseURL
    });
  });

  // GET - Listar usuários (sucesso) - 1
  test('Listar usuários cadastrados com sucesso', async () => {
    const response = await apiContext.get('/usuarios');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('usuarios');
    expect(Array.isArray(body.usuarios)).toBeTruthy();
  });

  // GET - Usuário inexistente - 2
  test('Deve retornar erro ao buscar usuário inexistente', async () => {
    const response = await apiContext.get('/usuarios/aaaaaaaaaaaaaaaa');
    expect([400, 404]).toContain(response.status());

    const body = await response.json();
    expect(body).toHaveProperty('message');
  });

  // POST - Criar usuário com sucesso - 3 
  test('Deve criar usuário com sucesso', async () => {
    const newUser = {
      nome: 'Willen QA',
      email: `willen_${Date.now()}@qa.com`,
      password: '12345',
      administrador: 'true'
    };

    const response = await apiContext.post('/usuarios', { data: newUser });
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.message).toBe('Cadastro realizado com sucesso');
    expect(body).toHaveProperty('_id');

    userId = body._id; // salvar para PUT e DELETE
  });

  // POST - Criar usuário com email duplicado - 4
  test('Não deve criar usuário com email duplicado', async () => {
    const newUser = {
      nome: 'Willen QA',
      email: 'teste@qa.com',
      password: '12345',
      administrador: 'true'
    };

    // cria primeira vez
    await apiContext.post('/usuarios', { data: newUser });

    // cria duplicado
    const response = await apiContext.post('/usuarios', { data: newUser });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.message).toContain('Este email já está sendo usado');
  });

  // GET - listar usuarios por id (sucesso) - 5
  test('Deve listar usuários por ID com sucesso', async () => {
    const response = await apiContext.get(`/usuarios/${userId}`);
    expect(response.status()).toBe(200);
  
    const body = await response.json();
    expect(body).toHaveProperty('_id', userId);
    expect(body).toHaveProperty('nome');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('administrador');
  });
  
  // GET - listar usuarios por id (erro) - 6
  test('Deve retornar erro ao buscar usuário com ID inexistente', async () => {
    const response = await apiContext.get('/usuarios/aaaaaaaaaaaaaaaa');
    expect([400]).toContain(response.status());

    const body = await response.json();
    expect(body.message).toBe('Usuário não encontrado');
  });

  // PUT - Editar usuário existente - 7
  test('Deve editar usuário existente com sucesso', async () => {
    const updatedUser = {
      nome: 'Willen QA Editado',
      email: `willen_edit_${Date.now()}@qa.com`,
      password: '54321',
      administrador: 'false'
    };

    const response = await apiContext.put(`/usuarios/${userId}`, { data: updatedUser });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.message).toBe('Registro alterado com sucesso');
  });

  // DELETE - Excluir usuário existente - 8
  test('Deve excluir usuário existente com sucesso', async () => {

    const response = await apiContext.delete(`/usuarios/${userId}`);
    expect(response.status()).toBe(200);
  
    const body = await response.json();
    expect(body.message).toBe('Registro excluído com sucesso');
  });
  
    // DELETE - Excluir usuário inexistente - 9
    test('Não deve excluir usuário inexistente', async () => {

        const response = await apiContext.delete('/usuarios/12343');
        expect([200]).toContain(response.status());

        const body = await response.json();
        expect(body.message).toBe('Nenhum registro excluído');
    });

    // PUT - Editar usuário inexistente - 10
    test('Não deve editar usuário inexistente', async () => {
        const response = await apiContext.put('/usuarios/aaaaaaaaaaaaaaaa', {
        data: {
            nome: 'Teste Inexistente',
            email: `naoexiste_${Date.now()}@qa.com`,
            password: '12345',
            administrador: 'false'
        }
        });
        expect([201]).toContain(response.status());

        const body = await response.json();
        expect(body.message).toBe('Cadastro realizado com sucesso');
    });
});