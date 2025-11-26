import { Request, Response } from 'express';

type Envelope<T> = {
  data: T | null;
  error: string | null;
};

export const ok = <T>(res: Response, data: T) => res.json({ data, error: null } satisfies Envelope<T>);

export const fail = (res: Response, status: number, message: string) =>
  res.status(status).json({ data: null, error: message } satisfies Envelope<null>);

export type { Envelope, Request, Response };
