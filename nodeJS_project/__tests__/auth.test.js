const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- Mocks des dépendances externes ---
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../models/user', () => ({
  userModel: {
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}));

const { userModel } = require('../models/user');
const {
  userLogin,
  refreshAccessToken,
  userLogout,
  optionalRefreshAccessToken,
} = require('../controller/auth/auth');

// --- Helpers pour mocker req / res ---
function mockRequest({ body = {}, cookies = {}, headers = {} } = {}) {
  return { body, cookies, headers };
}

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test_secret';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
  process.env.JWT_EXPIRE = '15m';
  process.env.JWT_REFRESH_EXPIRE = '7d';
  process.env.NODE_ENV = 'test';
});

// =====================================================
// userLogin
// =====================================================
describe('userLogin', () => {
  test('renvoie 400 si email ou mot de passe manquant', async () => {
    const req = mockRequest({ body: { email: '' } });
    const res = mockResponse();

    await userLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'tous les champs sont obligatoires' });
  });

  test('renvoie 401 si l\'utilisateur n\'existe pas', async () => {
    userModel.findOne.mockResolvedValue(null);
    const req = mockRequest({ body: { email: 'inconnu@test.com', password: 'pass123' } });
    const res = mockResponse();

    await userLogin(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: 'inconnu@test.com' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'email ou mot de passe incorrect' });
  });

  test('renvoie 403 si le compte est suspendu', async () => {
    userModel.findOne.mockResolvedValue({ suspended: true });
    const req = mockRequest({ body: { email: 'a@test.com', password: 'pass123' } });
    const res = mockResponse();

    await userLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Compte suspendu. Veuillez contacter un administrateur.',
    });
  });

  test('renvoie 401 si le mot de passe est incorrect', async () => {
    userModel.findOne.mockResolvedValue({ suspended: false, password: 'hashed' });
    bcrypt.compare.mockResolvedValue(false);
    const req = mockRequest({ body: { email: 'a@test.com', password: 'wrongpass' } });
    const res = mockResponse();

    await userLogin(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpass', 'hashed');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'email ou mot de passe incorrect' });
  });

  test('connecte l\'utilisateur avec succès : tokens générés, cookies posés, 201 renvoyé', async () => {
    const fakeUser = {
      _id: 'user123',
      first_name: 'Jean',
      last_name: 'Dupont',
      phone: 612345678,
      city: 'PARIS',
      email: 'jean@test.com',
      role: 'user',
      suspended: false,
      password: 'hashed',
    };

    userModel.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign
      .mockReturnValueOnce('fake_access_token')
      .mockReturnValueOnce('fake_refresh_token');

    const req = mockRequest({ body: { email: 'jean@test.com', password: 'goodpass' } });
    const res = mockResponse();

    await userLogin(req, res);

    expect(jwt.sign).toHaveBeenCalledTimes(2);

    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'fake_refresh_token',
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      'fake_access_token',
      expect.objectContaining({ httpOnly: true })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'connexion reussite !',
      accessToken: 'fake_access_token',
      user: {
        id: 'user123',
        first_name: 'Jean',
        last_name: 'Dupont',
        phone: 612345678,
        city: 'PARIS',
        email: 'jean@test.com',
        role: 'user',
      },
    });
  });

  test('renvoie 500 en cas d\'erreur serveur inattendue', async () => {
    userModel.findOne.mockRejectedValue(new Error('DB down'));
    const req = mockRequest({ body: { email: 'a@test.com', password: 'pass123' } });
    const res = mockResponse();

    await userLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'erreur serveur' });
  });
});

// =====================================================
// refreshAccessToken
// =====================================================
describe('refreshAccessToken', () => {
  test('renvoie 401 si aucun refreshToken n\'est présent', async () => {
    const req = mockRequest({ cookies: {}, body: {} });
    const res = mockResponse();

    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token manquant' });
  });

  test('renvoie 401 si le refreshToken est invalide', async () => {
    jwt.verify.mockImplementation(() => {
      const err = new Error('invalid signature');
      err.name = 'JsonWebTokenError';
      throw err;
    });

    const req = mockRequest({ cookies: { refreshToken: 'bad_token' } });
    const res = mockResponse();

    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token invalide' });
  });

  test('renvoie 401 si le refreshToken est expiré', async () => {
    jwt.verify.mockImplementation(() => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      throw err;
    });

    const req = mockRequest({ cookies: { refreshToken: 'expired_token' } });
    const res = mockResponse();

    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token expiré' });
  });

  test('renvoie 401 si l\'utilisateur associé au refresh token n\'existe plus', async () => {
    jwt.verify.mockReturnValue({ id: 'deleted_user_id' });
    userModel.findById.mockResolvedValue(null);

    const req = mockRequest({ cookies: { refreshToken: 'valid_refresh_token' } });
    const res = mockResponse();

    await refreshAccessToken(req, res);

    expect(userModel.findById).toHaveBeenCalledWith('deleted_user_id');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé' });
  });

  test('renvoie 403 si l\'utilisateur est suspendu', async () => {
    jwt.verify.mockReturnValue({ id: 'suspended_user_id' });
    userModel.findById.mockResolvedValue({
      _id: 'suspended_user_id',
      suspended: true,
    });

    const req = mockRequest({ cookies: { refreshToken: 'valid_refresh_token' } });
    const res = mockResponse();

    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Compte suspendu. Veuillez contacter un administrateur.' });
  });

  test('génère un nouvel accessToken avec succès depuis le cookie', async () => {
    const fakeUser = {
      _id: 'user123',
      first_name: 'Jean',
      last_name: 'Dupont',
      phone: 612345678,
      city: 'PARIS',
      email: 'jean@test.com',
      role: 'user',
      suspended: false,
    };

    jwt.verify.mockReturnValue({ id: 'user123' });
    userModel.findById.mockResolvedValue(fakeUser);
    jwt.sign.mockReturnValue('new_access_token_123');

    const req = mockRequest({ cookies: { refreshToken: 'valid_cookie_refresh' } });
    const res = mockResponse();

    await refreshAccessToken(req, res);

    expect(jwt.verify).toHaveBeenCalledWith('valid_cookie_refresh', expect.any(String));
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123', role: 'user', email: 'jean@test.com' },
      expect.any(String),
      expect.objectContaining({ expiresIn: '15m' })
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      'new_access_token_123',
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      accessToken: 'new_access_token_123',
      user: {
        id: 'user123',
        first_name: 'Jean',
        last_name: 'Dupont',
        phone: 612345678,
        city: 'PARIS',
        email: 'jean@test.com',
        role: 'user',
      },
    });
  });

  test('génère un nouvel accessToken avec succès depuis le body ou header x-refresh-token', async () => {
    const fakeUser = {
      _id: 'user456',
      first_name: 'Marie',
      last_name: 'Curie',
      phone: 699999999,
      city: 'LYON',
      email: 'marie@test.com',
      role: 'admin',
      suspended: false,
    };

    jwt.verify.mockReturnValue({ id: 'user456' });
    userModel.findById.mockResolvedValue(fakeUser);
    jwt.sign.mockReturnValue('new_access_token_body');

    const req = mockRequest({ body: { refreshToken: 'valid_body_refresh' } });
    const res = mockResponse();

    await refreshAccessToken(req, res);

    expect(jwt.verify).toHaveBeenCalledWith('valid_body_refresh', expect.any(String));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'new_access_token_body' })
    );
  });
});

// =====================================================
// optionalRefreshAccessToken (middleware)
// =====================================================
describe('optionalRefreshAccessToken', () => {
  test('appelle next() directement si aucun refreshToken n\'est présent', async () => {
    const req = mockRequest({ cookies: {} });
    const res = mockResponse();
    const next = jest.fn();

    await optionalRefreshAccessToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.cookie).not.toHaveBeenCalled();
  });

  test('rafraîchit le accessToken puis appelle next() si le refreshToken est valide', async () => {
    jwt.verify.mockReturnValue({ id: 'user123' });
    userModel.findById.mockResolvedValue({
      _id: 'user123',
      role: 'user',
      email: 'user@test.com',
      suspended: false,
    });
    jwt.sign.mockReturnValue('refreshed_access_token');

    const req = mockRequest({ cookies: { refreshToken: 'valid_refresh_token' } });
    const res = mockResponse();
    const next = jest.fn();

    await optionalRefreshAccessToken(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      'refreshed_access_token',
      expect.objectContaining({ httpOnly: true })
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('appelle next() même si la vérification du refreshToken échoue (ne bloque pas la requête)', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const req = mockRequest({ cookies: { refreshToken: 'bad_token' } });
    const res = mockResponse();
    const next = jest.fn();

    await optionalRefreshAccessToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.cookie).not.toHaveBeenCalled();
  });
});

// =====================================================
// userLogout
// =====================================================
describe('userLogout', () => {
  test('efface les cookies accessToken et refreshToken et renvoie 200', async () => {
    const req = mockRequest();
    const res = mockResponse();

    await userLogout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      'accessToken',
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Déconnexion réussie !' });
  });
});