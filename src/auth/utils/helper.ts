import { HttpException, HttpStatus } from '@nestjs/common';
export async function checkUserExistsByField(
  rootRepo: any,
  errorMessage: string,
): Promise<void> {
  const user = await rootRepo;
  if (user) {
    throw new HttpException(
      {
        statuscode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
        error: errorMessage,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
