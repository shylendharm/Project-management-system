const AppError = require('../../utils/AppError');

describe('AppError', () => {
  it('should create an error with the correct message and statusCode', () => {
    const err = new AppError('Not found', 404);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
  });

  it('should set status to "fail" for 4xx errors', () => {
    const err = new AppError('Bad request', 400);
    expect(err.status).toBe('fail');
  });

  it('should set status to "error" for 5xx errors', () => {
    const err = new AppError('Internal server error', 500);
    expect(err.status).toBe('error');
  });

  it('should set isOperational to true', () => {
    const err = new AppError('Unauthorized', 401);
    expect(err.isOperational).toBe(true);
  });

  it('should be an instance of Error', () => {
    const err = new AppError('Forbidden', 403);
    expect(err).toBeInstanceOf(Error);
  });
});
