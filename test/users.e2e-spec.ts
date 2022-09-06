import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';
import { User } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TOKEN_KEY } from 'src/common/common.constants';

const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email: 'sake@gmail.com',
  password: '123',
};
jest.mock('got');

describe('User Module (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<Verification>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set(TOKEN_KEY, jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationsRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    await usersRepository.query('DELETE FROM "user"');
    await verificationsRepository.query('DELETE FROM "verification"');
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return publicTest(
        `
          mutation {
        createAccount(input: {
      email: "${testUser.email}", 
      password: "${testUser.password}", 
      role:Owner
    })
    {
      ok
      error
    }
      }`,
      )
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBeTruthy();
          expect(res.body.data.createAccount.error).toBeNull();
        });
    });

    it('should fail if account already exists', () => {
      return publicTest(
        `
          mutation {
        createAccount(input: {
      email: "${testUser.email}", 
      password: "${testUser.password}", 
      role:Owner
    })
    {
      ok
      error
    }
      }`,
      )
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBeFalsy();
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials', () => {
      return publicTest(`
          mutation {
        login(input: {
      email: "${testUser.email}", 
      password: "${testUser.password}"
    })
    {
      ok
      error
      token
    }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          jwtToken = login.token;

          expect(login.ok).toBeTruthy();
          expect(login.token).toBe(jwtToken);
          expect(login.error).toBeNull();
        });
    });
  });
  it('should not be able login with wrong credentials', () => {
    return publicTest(
      `
          mutation {
        login(input: {
      email: "${testUser.email}", 
      password: "1111"
    })
    {
      ok
      error
      token
    }
      }`,
    )
      .expect(200)
      .expect((res) => {
        const {
          body: {
            data: { login },
          },
        } = res;

        expect(login.ok).toBeFalsy();
        expect(login.token).toBeNull();
        expect(login.error).toEqual(expect.any(String));
      });
  });

  describe('userProfile', () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it("should find a user's repository", () => {
      return privateTest(
        `
        {
          getUserProfile(userId:${userId}){
      ok
      error
      user {
        id
        email
      }
      }
    }`,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getUserProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBeTruthy();
          expect(error).toBeNull();
          expect(id).toBe(userId);
        });
    });

    it("should not find a user's repository", () => {
      return privateTest(`
        {
          getUserProfile(userId:6e6){
      ok
      error
      user {
        id
        email
      }
      }
    }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getUserProfile: { ok, error },
              },
            },
          } = res;

          expect(ok).toBeFalsy();
          expect(error).toBe('User Not Found');
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return privateTest(
        `
        {
          me {
           email
             }
        }`,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.email);
        });
    });

    it('should not find my profile', () => {
      return publicTest(
        `
        {
          me {
           email
             }
        }`,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: { data, errors },
          } = res;
          const [error] = errors;
          expect(data).toBeNull();
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
  describe('editProfile', () => {
    const NEW_EMAIL = 'cola@gmail.com';
    it('should change email', () => {
      return privateTest(
        `
          mutation { 
        editProfile(input: {
      email: "${NEW_EMAIL}"
    })
    {
      ok
      error
    }
      }`,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBeTruthy();
          expect(error).toBeNull();
        });
    });
    it('should have a new email', () => {
      return privateTest(
        `{
          me {
           email
             }
        }`,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationsRepository.find();
      verificationCode = verification.code;
    });

    it('should verify email', () => {
      return publicTest(
        `
        mutation {
           verifyEmail(input: {code: "${verificationCode}"}){
	              ok
                error
         }
            }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBeTruthy();
          expect(error).toBeNull();
        });
    });

    it('should fail on verification code not found', () => {
      return publicTest(`
        mutation {
           verifyEmail(input: {code: "xxx"}){
	              ok
                error
         }
            }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBeFalsy();
          expect(error).toBe('Verification not found');
        });
    });
  });
});
