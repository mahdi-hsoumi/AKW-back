declare namespace Express {
  export interface Request {
    userId: string;
    userRole: string;
  }
  export interface Response {
    userId: string;
  }
}
