import { AsyncLocalStorage } from 'async_hooks';
import crypto from 'crypto';

const traceStorage = new AsyncLocalStorage();

/**
 * Middleware khởi tạo Distributed Trace Context (traceId) cho mỗi HTTP Request (Mục 15 clauden_node_js.md)
 */
const traceMiddleware = (req, res, next) => {
  const incomingTraceId = req.headers['x-trace-id'] || req.headers['x-correlation-id'];
  const traceId = incomingTraceId || crypto.randomUUID();

  res.setHeader('X-Trace-Id', traceId);

  traceStorage.run({ traceId, method: req.method, path: req.originalUrl }, () => {
    next();
  });
};

const getTraceId = () => {
  const store = traceStorage.getStore();
  return store && store.traceId ? store.traceId : 'system-background-trace';
};

const runWithTrace = (traceIdOrFn, maybeFn) => {
  const fn = typeof traceIdOrFn === 'function' ? traceIdOrFn : maybeFn;
  const traceId = typeof traceIdOrFn === 'string' ? traceIdOrFn : crypto.randomUUID();
  return traceStorage.run({ traceId }, fn);
};

export {
  traceStorage,
  traceMiddleware,
  getTraceId,
  runWithTrace,
};
export default {
  traceStorage,
  traceMiddleware,
  getTraceId,
  runWithTrace,
};
