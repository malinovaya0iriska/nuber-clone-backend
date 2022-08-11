import { Test } from '@nestjs/testing/test';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';
import { Verification } from 'src/users/entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';

const mockRepository = {
  create: jest.fn(),
  delete: jest.fn(),
  findOne: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};
describe('UserService', () => {
  let service: UserService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('createAccount');
  it.todo('login');
  it.todo('findUserById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
