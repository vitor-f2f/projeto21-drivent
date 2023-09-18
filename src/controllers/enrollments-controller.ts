import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { enrollmentsService } from '@/services';
import { invalidDataError } from '@/errors';

export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

  return res.status(httpStatus.OK).send(enrollmentWithAddress);
}

export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  await enrollmentsService.createOrUpdateEnrollmentWithAddress({
    ...req.body,
    userId: req.userId,
  });

  return res.sendStatus(httpStatus.OK);
}

type ShortAddress = {
    logradouro: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
}

export async function getAddressFromCEP(req: AuthenticatedRequest, res: Response) {
  const cep: string | undefined = req.query.cep as string;

  if(!cep || !/^\d{8}$/.test(cep)) {
    throw invalidDataError("Formato inválido de CEP");
  }
  const address: ShortAddress = await enrollmentsService.getAddressFromCEP(cep);
  res.status(httpStatus.OK).send(address);
}