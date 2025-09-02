# Documentação da API PW-Maniva

Esta documentação detalha os endpoints da API PW-Maniva, que é construída com Node.js, Express e MongoDB, e agora está tipada com TypeScript para maior robustez, manutenibilidade e detecção antecipada de erros. A API utiliza autenticação via JWT para algumas rotas.

## Middleware de Validação de Sobreposição de Propriedades

A API utiliza um middleware para evitar o cadastro de propriedades agrícolas sobrepostas geograficamente. Isso garante que cada propriedade cadastrada ocupe uma área exclusiva no mapa.

### Validação de Sobreposição de Propriedades

**Middleware:** `checkOverlap`  
**Arquivo:** `middleware/propertyValidation.ts`

**Descrição:**  
Antes de criar ou atualizar uma propriedade, o middleware verifica se já existe outra propriedade cadastrada em uma localização muito próxima (considerando o tamanho em hectares de cada uma). Se houver sobreposição, a operação é bloqueada.

---

#### Funcionamento do Middleware

- **Cálculo do Raio da Propriedade:**  
  O raio de cada propriedade é calculado a partir da área em hectares, considerando que 1 hectare = 10.000 m². O raio é obtido pela fórmula:  
  `raio = sqrt(area_em_m2 / π)`

- **Verificação de Sobreposição:**  
  Para cada propriedade já cadastrada, o middleware calcula a distância entre o centro da nova propriedade e o centro da existente. Se a distância for menor que a soma dos raios das duas propriedades, considera-se que há sobreposição.

- **Ignora a própria propriedade em atualizações:**  
  Ao atualizar uma propriedade, o middleware ignora a checagem contra ela mesma.

---

#### Exemplo de Corpo da Requisição

```json
{
  "nome": "Fazenda Nova",
  "areaHectares": 50,
  "localizacao": {
    "type": "Point",
    "coordinates": [-46.633309, -23.55052]
  }
}
```

---

#### Exemplos de Respostas

- **Sobreposição detectada:**
    ```json
    {
      "message": "A nova propriedade se sobrepõe a uma propriedade existente."
    }
    ```

- **Erro interno ao verificar sobreposição:**
    ```json
    {
      "message": "Erro interno ao verificar sobreposição de propriedades."
    }
    ```

- **Sem sobreposição:**  
  A requisição segue normalmente para a próxima etapa da rota (não retorna resposta específica do middleware).

---

#### Exemplo de Uso nas Rotas

```typescript
router.post(
  '/api/propriedades',
  autenticarToken,
  autorizarRole(['agricultor']),
  checkOverlap,
  async (req, res) => { ... }
);

router.patch(
  '/api/propriedades/:id',
  autenticarToken,
  autorizarRole(['agricultor']),
  checkOverlap,
  async (req, res) => { ... }
);
```

---

#### Resumo do Fluxo

1. Recebe os dados da nova propriedade (ou atualização).
2. Calcula o raio da área informada.
3. Busca todas as propriedades já cadastradas.
4. Para cada uma, calcula a distância entre os centros.
5. Se houver sobreposição, retorna erro 400.
6. Se não houver, permite a continuação da operação.

## Autenticação

Algumas rotas desta API exigem autenticação. Para acessar essas rotas, você deve incluir um token JWT válido no cabeçalho `Authorization` de suas requisições, no formato `Bearer <seu_token_jwt>`.

### Obter Token de Autenticação

**Endpoint:** `/api/auth/login`

**Método:** `POST`

**Descrição:** Autentica um usuário existente e retorna um token JWT para acesso a rotas protegidas.

**Corpo da Requisição (JSON):**
```json
{
  "email": "seu_email@example.com",
  "senha": "sua_senha"
}
```

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "message": "Login bem-sucedido",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Email ou senha inválidos"
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```




## Rotas de Usuários

**Base URL:** `/api/usuarios`

### Registrar Novo Usuário

**Endpoint:** `/api/usuarios`

**Método:** `POST`

**Descrição:** Registra um novo usuário no sistema. O campo `role` pode ser `agricultor` ou `co-agricultor`. Para qualquer `role`, `cidade_csa` e `estado_csa` são obrigatórios para associar o usuário a uma CSA existente.

**Corpo da Requisição (JSON):**
```json
{
  "nome": "Nome do Usuário",
  "email": "usuario@example.com",
  "senha": "senha123",
  "role": "co-agricultor",
  "cidade_csa": "São Paulo",
  "estado_csa": "SP"
}
```

**Respostas:**

*   **`201 Created`**
    ```json
    {
      "message": "Usuário registrado com sucesso!"
    }
    ```

*   **`400 Bad Request`**
    ```json
    {
      "errors": [
        "Mensagem de erro de validação"
      ]
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "CSA para esta cidade e estado não encontrada."
    }
    ```

*   **`409 Conflict`**
    ```json
    {
      "message": "Este email já está em uso."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Listar Todos os Usuários

**Endpoint:** `/api/usuarios`

**Método:** `GET`

**Descrição:** Retorna uma lista de todos os usuários registrados no sistema. Não requer autenticação.

**Respostas:**

*   **`200 OK`**
    ```json
    [
      {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e1",
        "nome": "Nome do Usuário",
        "email": "usuario@example.com",
        "role": "co-agricultor",
        "csa": {
          "_id": "65c7a2b3d4e5f6a7b8c9d0e2",
          "cidade": "são paulo",
          "estado": "sp"
        }
      }
    ]
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Listar Usuários por CSA

**Endpoint:** `/api/usuarios/csa/:csaId`

**Método:** `GET`

**Descrição:** Retorna uma lista de usuários associados a uma CSA específica. Não requer autenticação.

**Parâmetros de URL:**

*   `csaId` (string, obrigatório): O ID da CSA.

**Respostas:**

*   **`200 OK`**
    ```json
    [
      {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e1",
        "nome": "Nome do Usuário",
        "email": "usuario@example.com",
        "role": "co-agricultor",
        "csa": {
          "_id": "65c7a2b3d4e5f6a7b8c9d0e2",
          "cidade": "são paulo",
          "estado": "sp"
        }
      }
    ]
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Nenhum usuário encontrado para esta CSA."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Obter Usuário por ID

**Endpoint:** `/api/usuarios/:id`

**Método:** `GET`

**Descrição:** Retorna os detalhes de um usuário específico pelo seu ID. Não requer autenticação.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID do usuário.

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e1",
      "nome": "Nome do Usuário",
      "email": "usuario@example.com",
      "role": "co-agricultor",
      "csa": {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e2",
        "cidade": "são paulo",
        "estado": "sp"
      }
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Usuário não encontrado"
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Atualizar Usuário por ID

**Endpoint:** `/api/usuarios/:id`

**Método:** `PATCH`

**Descrição:** Atualiza as informações de um usuário existente. Não requer autenticação. Campos como `nome`, `email`, `cidade_csa` e `estado_csa` podem ser atualizados. A senha não pode ser atualizada por esta rota.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID do usuário a ser atualizado.

**Corpo da Requisição (JSON):**
```json
{
  "nome": "Novo Nome",
  "email": "novo_email@example.com",
  "cidade_csa": "Rio de Janeiro",
  "estado_csa": "RJ"
}
```

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e1",
      "nome": "Novo Nome",
      "email": "novo_email@example.com",
      "role": "co-agricultor",
      "csa": {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e3",
        "cidade": "rio de janeiro",
        "estado": "rj"
      }
    }
    ```

*   **`400 Bad Request`**
    ```json
    {
      "message": "Mensagem de erro de validação"
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Usuário não encontrado" ou "CSA para esta cidade e estado não encontrada."
    }
    ```

*   **`409 Conflict`**
    ```json
    {
      "message": "Este email já está em uso."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Deletar Usuário por ID

**Endpoint:** `/api/usuarios/:id`

**Método:** `DELETE`

**Descrição:** Deleta um usuário do sistema pelo seu ID. Não requer autenticação.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID do usuário a ser deletado.

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "message": "Usuário excluído com sucesso"
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Usuário não encontrado"
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```




## Rotas de CSA (Comunidade que Sustenta a Agricultura)

**Base URL:** `/api/csa`

### Registrar Nova CSA

**Endpoint:** `/api/csa`

**Método:** `POST`

**Descrição:** Registra uma nova CSA no sistema. A combinação de cidade e estado deve ser única.

**Corpo da Requisição (JSON):**
```json
{
  "cidade": "Nome da Cidade",
  "estado": "Sigla do Estado (ex: SP)"
}
```

**Respostas:**

*   **`201 Created`**
    ```json
    {
      "message": "CSA registrada com sucesso!",
      "data": {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e4",
        "cidade": "nome da cidade",
        "estado": "sigla do estado",
        "createdAt": "2023-01-01T10:00:00.000Z"
      }
    }
    ```

*   **`400 Bad Request`**
    ```json
    {
      "message": "Mensagem de erro de validação"
    }
    ```

*   **`409 Conflict`**
    ```json
    {
      "message": "Uma CSA para esta cidade e estado já existe."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Listar Todas as CSAs

**Endpoint:** `/api/csa`

**Método:** `GET`

**Descrição:** Retorna uma lista de todas as CSAs registradas no sistema. Não requer autenticação.

**Respostas:**

*   **`200 OK`**
    ```json
    [
      {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e4",
        "cidade": "nome da cidade",
        "estado": "sigla do estado",
        "createdAt": "2023-01-01T10:00:00.000Z"
      }
    ]
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Deletar CSA por ID

**Endpoint:** `/api/csa/:id`

**Método:** `DELETE`

**Descrição:** Deleta uma CSA do sistema pelo seu ID. Requer autenticação.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID da CSA a ser deletada.

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "message": "CSA excluída com sucesso"
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "CSA não encontrada"
    }
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token de autenticação não fornecido." ou "Token inválido ou expirado."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```




## Rotas de Propriedades

**Base URL:** `/api/propriedades`

### Listar Todas as Propriedades

**Endpoint:** `/api/propriedades`

**Método:** `GET`

**Descrição:** Retorna uma lista de todas as propriedades registradas. Requer autenticação com `role` de `agricultor` ou `co-agricultor`.

**Respostas:**

*   **`200 OK`**
    ```json
    [
      {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e5",
        "nome": "Fazenda Feliz",
        "descricao": "Uma fazenda produtiva",
        "areaHectares": 100,
        "culturaPrincipal": "Milho",
        "localizacao": {
          "type": "Point",
          "coordinates": [-46.633309, -23.55052]
        },
        "tags": ["orgânico", "sustentável"],
        "createdAt": "2023-01-01T10:00:00.000Z",
        "updatedAt": "2023-01-01T10:00:00.000Z"
      }
    ]
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token de autenticação não fornecido." ou "Token inválido ou expirado."
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem permissão para esta ação."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Obter Propriedade por ID

**Endpoint:** `/api/propriedades/:id`

**Método:** `GET`

**Descrição:** Retorna os detalhes de uma propriedade específica pelo seu ID. Requer autenticação com `role` de `agricultor` ou `co-agricultor`.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID da propriedade.

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e5",
      "nome": "Fazenda Feliz",
      "descricao": "Uma fazenda produtiva",
      "areaHectares": 100,
      "culturaPrincipal": "Milho",
      "localizacao": {
        "type": "Point",
        "coordinates": [-46.633309, -23.55052]
      },
      "tags": ["orgânico", "sustentável"],
      "createdAt": "2023-01-01T10:00:00.000Z",
      "updatedAt": "2023-01-01T10:00:00.000Z"
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Propriedade não encontrada"
    }
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token de autenticação não fornecido." ou "Token inválido ou expirado."
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem permissão para esta ação."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Criar Nova Propriedade

**Endpoint:** `/api/propriedades`

**Método:** `POST`

**Descrição:** Cria uma nova propriedade. Requer autenticação com `role` de `agricultor`.

**Corpo da Requisição (JSON):**
```json
{
  "nome": "Nova Fazenda",
  "descricao": "Descrição da nova fazenda",
  "areaHectares": 50,
  "culturaPrincipal": "Soja",
  "localizacao": {
    "type": "Point",
    "coordinates": [-46.633309, -23.55052]
  },
  "tags": ["orgânico", "familiar"]
}
```

**Respostas:**

*   **`201 Created`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e6",
      "nome": "Nova Fazenda",
      "descricao": "Descrição da nova fazenda",
      "areaHectares": 50,
      "culturaPrincipal": "Soja",
      "localizacao": {
        "type": "Point",
        "coordinates": [-46.633309, -23.55052]
      },
      "tags": ["orgânico", "familiar"],
      "createdAt": "2023-01-01T10:00:00.000Z",
      "updatedAt": "2023-01-01T10:00:00.000Z"
    }
    ```

*   **`400 Bad Request`**
    ```json
    {
      "message": "Mensagem de erro de validação"
    }
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token de autenticação não fornecido." ou "Token inválido ou expirado."
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem permissão para esta ação."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Atualizar Propriedade por ID

**Endpoint:** `/api/propriedades/:id`

**Método:** `PATCH`

**Descrição:** Atualiza as informações de uma propriedade existente. Requer autenticação com `role` de `agricultor`.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID da propriedade a ser atualizada.

**Corpo da Requisição (JSON):**
```json
{
  "nome": "Fazenda Atualizada",
  "areaHectares": 120
}
```

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e5",
      "nome": "Fazenda Atualizada",
      "descricao": "Uma fazenda produtiva",
      "areaHectares": 120,
      "culturaPrincipal": "Milho",
      "localizacao": {
        "type": "Point",
        "coordinates": [-46.633309, -23.55052]
      },
      "tags": ["orgânico", "sustentável"],
      "createdAt": "2023-01-01T10:00:00.000Z",
      "updatedAt": "2023-01-01T10:00:00.000Z"
    }
    ```

*   **`400 Bad Request`**
    ```json
    {
      "message": "Mensagem de erro de validação"
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Propriedade não encontrada"
    }
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token de autenticação não fornecido." ou "Token inválido ou expirado."
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem permissão para esta ação."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Deletar Propriedade por ID

**Endpoint:** `/api/propriedades/:id`

**Método:** `DELETE`

**Descrição:** Deleta uma propriedade do sistema pelo seu ID. Requer autenticação com `role` de `agricultor`.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID da propriedade a ser deletada.

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "message": "Propriedade excluída com sucesso"
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Propriedade não encontrada"
    }
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token de autenticação não fornecido." ou "Token inválido ou expirado."
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem permissão para esta ação."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Busca Textual Completa

**Endpoint:** `/api/propriedades/search/:text`

**Método:** `GET`

**Descrição:** Realiza uma busca textual completa nas propriedades por nome, descrição, cultura principal e tags. Não requer autenticação.

**Parâmetros de URL:**

*   `text` (string, obrigatório): O texto a ser pesquisado.

**Respostas:**

*   **`200 OK`**
    ```json
    [
      {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e5",
        "nome": "Fazenda Feliz",
        "descricao": "Uma fazenda produtiva",
        "areaHectares": 100,
        "culturaPrincipal": "Milho",
        "localizacao": {
          "type": "Point",
          "coordinates": [-46.633309, -23.55052]
        },
        "tags": ["orgânico", "sustentável"],
        "createdAt": "2023-01-01T10:00:00.000Z",
        "updatedAt": "2023-01-01T10:00:00.000Z"
      }
    ]
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```




## Rotas de Cestas

**Base URL:** `/cestas`

### Pesquisar Cesta por Nome

**Endpoint:** `/cestas/buscar/nome`

**Método:** `GET`

**Descrição:** Pesquisa cestas pelo nome (busca parcial e insensível a maiúsculas/minúsculas). Não requer autenticação.

**Parâmetros de Query:**

*   `nome` (string, obrigatório): O nome ou parte do nome da cesta a ser pesquisada.

**Respostas:**

*   **`200 OK`**
    ```json
    [
      {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e7",
        "nome": "Cesta Orgânica",
        "descricao": "Cesta com produtos orgânicos da estação",
        "produtos": ["alface", "tomate", "cenoura"],
        "preco": 50.00,
        "csa": "65c7a2b3d4e5f6a7b8c9d0e4",
        "imagem": "nome_da_imagem.jpg",
        "createdAt": "2023-01-01T10:00:00.000Z"
      }
    ]
    ```

*   **`400 Bad Request`**
    ```json
    {
      "message": "Parâmetro nome é obrigatório"
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Cesta não encontrada"
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Listar Todas as Cestas

**Endpoint:** `/cestas`

**Método:** `GET`

**Descrição:** Retorna uma lista de todas as cestas disponíveis. Não requer autenticação.

**Respostas:**

*   **`200 OK`**
    ```json
    [
      {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e7",
        "nome": "Cesta Orgânica",
        "descricao": "Cesta com produtos orgânicos da estação",
        "produtos": ["alface", "tomate", "cenoura"],
        "preco": 50.00,
        "csa": "65c7a2b3d4e5f6a7b8c9d0e4",
        "imagem": "nome_da_imagem.jpg",
        "createdAt": "2023-01-01T10:00:00.000Z"
      }
    ]
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Obter Cesta por ID

**Endpoint:** `/cestas/:id`

**Método:** `GET`

**Descrição:** Retorna os detalhes de uma cesta específica pelo seu ID. Não requer autenticação.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID da cesta.

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e7",
      "nome": "Cesta Orgânica",
      "descricao": "Cesta com produtos orgânicos da estação",
      "produtos": ["alface", "tomate", "cenoura"],
      "preco": 50.00,
      "csa": "65c7a2b3d4e5f6a7b8c9d0e4",
      "imagem": "nome_da_imagem.jpg",
      "createdAt": "2023-01-01T10:00:00.000Z"
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Cesta não encontrada"
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Criar Nova Cesta (com Imagem)

**Endpoint:** `/cestas`

**Método:** `POST`

**Descrição:** Cria uma nova cesta com a opção de upload de imagem. Requer autenticação com `role` de `co-agricultor`.

**Corpo da Requisição (multipart/form-data):**

*   `nome` (string, obrigatório): Nome da cesta.
*   `descricao` (string, opcional): Descrição da cesta.
*   `produtos` (array de strings, obrigatório): Lista de produtos na cesta.
*   `preco` (number, obrigatório): Preço da cesta.
*   `csa` (string, obrigatório): ID da CSA à qual a cesta pertence.
*   `imagem` (file, opcional): Arquivo de imagem para a cesta.

**Exemplo de Requisição (com `curl`):**
```bash
curl -X POST \ \
  http://localhost:5000/cestas \ \
  -H 'Authorization: Bearer SEU_TOKEN_JWT' \ \
  -F 'nome=Cesta de Verão' \ \
  -F 'descricao=Produtos frescos da estação' \ \
  -F 'produtos=manga' \ \
  -F 'produtos=coco' \ \
  -F 'preco=75.50' \ \
  -F 'csa=65c7a2b3d4e5f6a7b8c9d0e4' \ \
  -F 'imagem=@/caminho/para/sua/imagem.jpg;type=image/jpeg'
```

**Respostas:**

*   **`201 Created`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e8",
      "nome": "Cesta de Verão",
      "descricao": "Produtos frescos da estação",
      "produtos": ["manga", "coco"],
      "preco": 75.50,
      "csa": "65c7a2b3d4e5f6a7b8c9d0e4",
      "imagem": "1700000000000.jpg",
      "createdAt": "2023-01-01T10:00:00.000Z"
    }
    ```

*   **`400 Bad Request`**
    ```json
    {
      "message": "Mensagem de erro de validação"
    }
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token de autenticação não fornecido." ou "Token inválido ou expirado."
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem permissão para esta ação."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Atualizar Cesta por ID

**Endpoint:** `/cestas/:id`

**Método:** `PATCH`

**Descrição:** Atualiza as informações de uma cesta existente, com a opção de upload de nova imagem. Requer autenticação com `role` de `co-agricultor`.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID da cesta a ser atualizada.

**Corpo da Requisição (multipart/form-data):**

*   `nome` (string, opcional): Novo nome da cesta.
*   `descricao` (string, opcional): Nova descrição da cesta.
*   `produtos` (array de strings, opcional): Nova lista de produtos na cesta.
*   `preco` (number, opcional): Novo preço da cesta.
*   `csa` (string, opcional): Novo ID da CSA.
*   `imagem` (file, opcional): Novo arquivo de imagem para a cesta.

**Exemplo de Requisição (com `curl`):**
```bash
curl -X PATCH \ \
  http://localhost:5000/cestas/65c7a2b3d4e5f6a7b8c9d0e8 \ \
  -H 'Authorization: Bearer SEU_TOKEN_JWT' \ \
  -F 'nome=Cesta de Inverno' \ \
  -F 'preco=80.00'
```

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e8",
      "nome": "Cesta de Inverno",
      "descricao": "Produtos frescos da estação",
      "produtos": ["manga", "coco"],
      "preco": 80.00,
      "csa": "65c7a2b3d4e5f6a7b8c9d0e4",
      "imagem": "1700000000000.jpg",
      "createdAt": "2023-01-01T10:00:00.000Z"
    }
    ```

*   **`400 Bad Request`**
    ```json
    {
      "message": "Mensagem de erro de validação"
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Cesta não encontrada"
    }
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token de autenticação não fornecido." ou "Token inválido ou expirado."
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem permissão para esta ação."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Deletar Cesta por ID

**Endpoint:** `/cestas/:id`

**Método:** `DELETE`

**Descrição:** Deleta uma cesta do sistema pelo seu ID. Requer autenticação com `role` de `co-agricultor`.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID da cesta a ser deletada.

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "message": "Cesta excluída com sucesso"
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Cesta não encontrada"
    }
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token de autenticação não fornecido." ou "Token inválido ou expirado."
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem permissão para esta ação."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```


