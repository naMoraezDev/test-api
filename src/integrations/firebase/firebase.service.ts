import {
  Logger,
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateRequest,
  UpdateRequest,
} from 'firebase-admin/lib/auth/auth-config';
import { FirebaseUser } from './firebase.interface';
import { getFirebaseAuth } from 'src/config/firebase.config';

@Injectable()
export class FirebaseService {
  private readonly firebaseAuth = getFirebaseAuth();
  private readonly logger = new Logger(FirebaseService.name);

  async verifyIdToken(idToken: string): Promise<FirebaseUser> {
    try {
      const decodedToken = await this.firebaseAuth.verifyIdToken(idToken, true);

      return decodedToken;
    } catch (error) {
      this.logAuthError('verificação de token', error);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  async createCustomToken(
    uid: string,
    developerClaims?: object,
  ): Promise<string> {
    try {
      return await this.firebaseAuth.createCustomToken(uid, developerClaims);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logAuthError('criação de token personalizado', error);
      throw new UnauthorizedException('Erro ao criar custom token');
    }
  }

  async updateUserPhoneNumber(uid: string, phoneNumber: string): Promise<void> {
    if (!uid) {
      throw new BadRequestException('UID do usuário não fornecido');
    }

    if (!phoneNumber) {
      throw new BadRequestException('Número de telefone não fornecido');
    }

    try {
      await this.firebaseAuth.updateUser(uid, { phoneNumber });
    } catch (error) {
      this.logAuthError('atualização de número de telefone', error);
      throw new BadRequestException(
        'Erro ao atualizar o número de telefone. Verifique se o formato está correto.',
      );
    }
  }

  async getUserByEmail(email: string) {
    return await this.firebaseAuth.getUserByEmail(email);
  }

  async getUserByPhoneNumber(phoneNumber: string) {
    try {
      return await this.firebaseAuth.getUserByPhoneNumber(
        this.formatToE164(phoneNumber),
      );
    } catch (error) {
      this.logAuthError('recuperação de usuário por número de telefone', error);
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async createUser(properties: CreateRequest) {
    try {
      return await this.firebaseAuth.createUser(properties);
    } catch (error) {
      this.logAuthError('criação de usuário', error);
      throw new Error('Falha ao criar usuário');
    }
  }

  async updateUser(uid: string, properties: UpdateRequest) {
    try {
      return await this.firebaseAuth.updateUser(uid, properties);
    } catch (error) {
      this.logAuthError('atualização de usuário', error);
      throw new Error('Falha ao atualizar usuário');
    }
  }

  private formatToE164(phoneNumber: string): string {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return '+55' + digitsOnly;
  }

  private logAuthError(operation: string, error: any): void {
    const errorCode = error.code || 'desconhecido';
    const errorMessage = error.message || 'Sem detalhes';

    this.logger.error(
      `Erro na ${operation}: [${errorCode}] ${errorMessage}`,
      error.stack,
    );
  }
}
