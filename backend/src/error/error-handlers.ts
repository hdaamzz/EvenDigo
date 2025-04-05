export class ConflictException extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ConflictException';
    }
  }
  
  export class InternalServerErrorException extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'InternalServerErrorException';
    }
  }
  
  export class NotFoundException extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'NotFoundException';
    }
  }