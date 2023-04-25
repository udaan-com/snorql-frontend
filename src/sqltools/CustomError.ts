export class CustomError extends Error {
  details: string;
  code: number;

  constructor(message = 'Something went wrong', details = '', code = 500) {
    super();
    this.message = message;
    this.details = details;
    this.code = code;
  }  
}