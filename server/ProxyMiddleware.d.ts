/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
type ProxyMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare function createProxy(targetBase: string): ProxyMiddleware;
export default createProxy;
