# Documentação da API PW-Maniva

Esta documentação detalha os endpoints da API PW-Maniva, incluindo suas funcionalidades, métodos HTTP, URLs, parâmetros de requisição, exemplos de corpo de requisição e respostas. A API é construída com Node.js, Express e MongoDB, e utiliza autenticação via JWT para algumas rotas.

## Autenticação

Algumas rotas desta API exigem autenticação. Para acessar essas rotas, você deve incluir um token JWT válido no cabeçalho `Authorization` de suas requisições, no formato `Bearer <seu_token_jwt>`.

### Obter Token de Autenticação

**Endpoint:** `/api/auth/login`

**Método:** `POST`

**Descrição:** Autentica um usuário e retorna um token JWT.

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

**Descrição:** Registra um novo usuário no sistema. O campo `role` pode ser `agricultor`, `co-agricultor` ou `consumidor`. Se a `role` for `co-agricultor` ou `consumidor`, `cidade_csa` e `estado_csa` são obrigatórios.

**Corpo da Requisição (JSON):**
```json
{
  "nome": "Nome do Usuário",
  "email": "usuario@example.com",
  "senha": "senha123",
  "role": "consumidor",
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
      "message": "Mensagem de erro de validação"
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
        "role": "consumidor",
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
        "role": "consumidor",
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
      "role": "consumidor",
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

**Descrição:** Atualiza as informações de um usuário existente. Não requer autenticação.

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
      "role": "consumidor",
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

**Descrição:** Registra uma nova CSA no sistema.

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
        "estado": "sigla do estado"
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

**Descrição:** Retorna uma lista de todas as CSAs registradas.

**Respostas:**

*   **`200 OK`**
    ```json
    [
      {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e4",
        "cidade": "nome da cidade",
        "estado": "sigla do estado"
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

**Descrição:** Deleta uma CSA do sistema pelo seu ID.

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
        "localizacao": "Zona Rural",
        "tags": ["orgânico", "sustentável"],
        "createdAt": "2023-01-01T10:00:00.000Z",
        "updatedAt": "2023-01-01T10:00:00.000Z"
      }
    ]
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token não fornecido" ou "Token inválido"
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem a role necessária."
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
      "localizacao": "Zona Rural",
      "tags": ["orgânico", "sustentável"],
      "createdAt": "2023-01-01T10:00:00.000Z",
      "updatedAt": "2023-01-01T10:00:00.000Z"
    }
    ```

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token não fornecido" ou "Token inválido"
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem a role necessária."
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Propriedade não encontrada"
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
  "localizacao": "Zona Rural",
  "tags": ["orgânico"]
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
      "localizacao": "Zona Rural",
      "tags": ["orgânico"],
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
      "message": "Token não fornecido" ou "Token inválido"
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem a role necessária."
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
      "localizacao": "Zona Rural",
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

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token não fornecido" ou "Token inválido"
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem a role necessária."
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Propriedade não encontrada"
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

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token não fornecido" ou "Token inválido"
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem a role necessária."
    }
    ```

*   **`404 Not Found`**
    ```json
    {
      "message": "Propriedade não encontrada"
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Busca Textual Completa de Propriedades

**Endpoint:** `/api/propriedades/search/:text`

**Método:** `GET`

**Descrição:** Realiza uma busca textual completa em propriedades. Não requer autenticação.

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
        "localizacao": "Zona Rural",
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

**Descrição:** Pesquisa cestas pelo nome. O parâmetro `nome` é obrigatório.

**Parâmetros de Query:**

*   `nome` (string, obrigatório): O nome da cesta a ser pesquisada.

**Respostas:**

*   **`200 OK`**
    ```json
    [
      {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e7",
        "nome": "Cesta de Legumes",
        "descricao": "Cesta com legumes frescos",
        "produtos": ["cenoura", "batata"],
        "preco": 25.50,
        "csa": "65c7a2b3d4e5f6a7b8c9d0e4",
        "imagem": "1756347340007.webp"
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

### Obter Todas as Cestas

**Endpoint:** `/cestas`

**Método:** `GET`

**Descrição:** Retorna uma lista de todas as cestas disponíveis. Popula o campo `csa` com `cidade` e `estado`.

**Respostas:**

*   **`200 OK`**
    ```json
    [
      {
        "_id": "65c7a2b3d4e5f6a7b8c9d0e7",
        "nome": "Cesta de Legumes",
        "descricao": "Cesta com legumes frescos",
        "produtos": ["cenoura", "batata"],
        "preco": 25.50,
        "csa": {
          "_id": "65c7a2b3d4e5f6a7b8c9d0e4",
          "cidade": "nome da cidade",
          "estado": "sigla do estado"
        },
        "imagem": "1756347340007.webp"
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

**Descrição:** Retorna os detalhes de uma cesta específica pelo seu ID.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID da cesta.

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e7",
      "nome": "Cesta de Legumes",
      "descricao": "Cesta com legumes frescos",
      "produtos": ["cenoura", "batata"],
      "preco": 25.50,
      "csa": "65c7a2b3d4e5f6a7b8c9d0e4",
      "imagem": "1756347340007.webp"
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

### Criar Nova Cesta (Apenas Co-agricultores)

**Endpoint:** `/cestas`

**Método:** `POST`

**Descrição:** Cria uma nova cesta. Requer autenticação com `role` de `co-agricultor`. Suporta upload de imagem.

**Corpo da Requisição (multipart/form-data):**

*   `nome` (string, obrigatório)
*   `descricao` (string, obrigatório)
*   `produtos` (array de strings, obrigatório): Ex: `["produto1", "produto2"]`
*   `preco` (número, obrigatório)
*   `csa` (string, obrigatório): ID da CSA
*   `imagem` (arquivo, opcional): Arquivo de imagem para a cesta.

**Exemplo de Requisição (com `curl`):**
```bash
curl -X POST \\
  http://localhost:5000/cestas \\
  -H "Authorization: Bearer <seu_token_jwt>" \\
  -F "nome=Cesta Orgânica" \\
  -F "descricao=Cesta de produtos orgânicos frescos" \\
  -F "produtos=["alface", "tomate"]" \\
  -F "preco=35.00" \\
  -F "csa=65c7a2b3d4e5f6a7b8c9d0e4" \\
  -F "imagem=@/caminho/para/sua/imagem.jpg"
```

**Respostas:**

*   **`201 Created`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e8",
      "nome": "Cesta Orgânica",
      "descricao": "Cesta de produtos orgânicos frescos",
      "produtos": ["alface", "tomate"],
      "preco": 35,
      "csa": "65c7a2b3d4e5f6a7b8c9d0e4",
      "imagem": "1756391780675.webp"
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
      "message": "Token não fornecido" ou "Token inválido"
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem a role necessária."
    }
    ```

*   **`500 Internal Server Error`**
    ```json
    {
      "message": "Mensagem de erro do servidor"
    }
    ```

### Atualizar Cesta por ID (Apenas Co-agricultores)

**Endpoint:** `/cestas/:id`

**Método:** `PATCH`

**Descrição:** Atualiza as informações de uma cesta existente. Requer autenticação com `role` de `co-agricultor`. Suporta upload de imagem.

**Parâmetros de URL:**

*   `id` (string, obrigatório): O ID da cesta a ser atualizada.

**Corpo da Requisição (multipart/form-data):**

*   `nome` (string, opcional)
*   `descricao` (string, opcional)
*   `produtos` (array de strings, opcional)
*   `preco` (número, opcional)
*   `csa` (string, opcional): ID da CSA
*   `imagem` (arquivo, opcional): Novo arquivo de imagem para a cesta.

**Exemplo de Requisição (com `curl`):**
```bash
curl -X PATCH \\
  http://localhost:5000/cestas/65c7a2b3d4e5f6a7b8c9d0e7 \\
  -H "Authorization: Bearer <seu_token_jwt>" \\
  -F "preco=30.00" \\
  -F "imagem=@/caminho/para/nova/imagem.png"
```

**Respostas:**

*   **`200 OK`**
    ```json
    {
      "_id": "65c7a2b3d4e5f6a7b8c9d0e7",
      "nome": "Cesta de Legumes",
      "descricao": "Cesta com legumes frescos",
      "produtos": ["cenoura", "batata"],
      "preco": 30,
      "csa": "65c7a2b3d4e5f6a7b8c9d0e4",
      "imagem": "1756391828713.webp"
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
      "message": "Token não fornecido" ou "Token inválido"
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem a role necessária."
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

### Deletar Cesta por ID (Apenas Co-agricultores)

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

*   **`401 Unauthorized`**
    ```json
    {
      "message": "Token não fornecido" ou "Token inválido"
    }
    ```

*   **`403 Forbidden`**
    ```json
    {
      "message": "Acesso negado: você não tem a role necessária."
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


