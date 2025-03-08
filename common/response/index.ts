import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ResponseType as Response } from './response.enum';
import Logger from '../../config/log4js/logger';
import { ResponseDto } from './response.dto';

/**
 * Handles custom HTTP responses by throwing appropriate HTTP exceptions
 * based on the provided `responseDto` object. If an error is passed, logs the error
 * before throwing the exception.
 *
 * @param {ResponseDto} responseDto - The DTO containing necessary information for the response.
 * @param {Response} responseDto.responseType - The type of response (e.g., INTERNAL_SERVER_ERROR, CONFLICT, etc.).
 * @param {string} [responseDto.partMsg='Data'] - The name of the object to include in the message.
 * @param {string} [responseDto.logType] - The type of log (e.g., 'error', 'info') if logging is required.
 * @param {Error} [responseDto.error] - The error to log and handle.
 * @param {string} [responseDto.logName] - The name of the log for tracking purposes if logging is required.
 *
 * @throws {BadRequestException} If `error` is provided but `logName` or `logType` is missing.
 * @throws {HttpException} Depending on the `responseType`, throws an appropriate HTTP exception with the
 * corresponding status code and message.
 */
export function customResponse(responseDto: ResponseDto) {
  const { responseType, partMsg, logType, error, logName } = responseDto;
  const logger = new Logger();
  if (error) {
    if (!logName || !logType) {
      throw new BadRequestException(
        '"logName" and "logType" are expected in "customResponse" when "error" is specified',
      );
    }
    logger.log(logType, logType, error, logName);
  }

  const responseMessage = {
    [Response.INTERNAL_SERVER_ERROR]: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: responseType,
      message: 'Something went wrong',
    },
    [Response.CONFLICT]: {
      status: HttpStatus.CONFLICT,
      error: responseType,
      message: `${partMsg ? partMsg : 'Data'} already exists`,
    },
    [Response.NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      error: responseType,
      message: `${partMsg ? partMsg : 'Data'} not found`,
    },
    [Response.BAD_REQUEST]: {
      status: HttpStatus.BAD_REQUEST,
      error: responseType,
      message: partMsg,
    },
    [Response.NO_CONTENT]: {
      status: HttpStatus.NO_CONTENT,
    },
  };

  throw new HttpException(
    responseMessage[responseType],
    responseMessage[responseType].status || HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
