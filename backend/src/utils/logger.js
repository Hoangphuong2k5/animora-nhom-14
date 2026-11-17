import { getTraceId } from './traceContext.js';

/**
 * JSON Structured Logger tuân thủ Mục 15 clauden_node_js.md:
 * - Xuất 100% định dạng JSON có cấu trúc
 * - Tự động đính kèm traceId từ AsyncLocalStorage
 */
const writeStructuredLog = (level, message, meta = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    traceId: getTraceId(),
    message,
    ...meta,
  };
  const serialized = JSON.stringify(payload);
  if (level === 'ERROR') {
    process.stderr.write(`${serialized}\n`);
  } else {
    process.stdout.write(`${serialized}\n`);
  }
};

const logger = {
  info: (message, meta = {}) => writeStructuredLog('INFO', message, meta),
  warn: (message, meta = {}) => writeStructuredLog('WARN', message, meta),
  error: (message, meta = {}) => writeStructuredLog('ERROR', message, meta),
  debug: (message, meta = {}) => writeStructuredLog('DEBUG', message, meta),
};

export { logger };
export default logger;
