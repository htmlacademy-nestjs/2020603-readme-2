import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiPaginatedResponse<TModel extends Type<unknown>>(
  model: TModel,
  description: string,
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description,
      schema: {
        type: 'object',
        required: [
          'entities',
          'totalPages',
          'totalItems',
          'currentPage',
          'itemsPerPage',
        ],
        properties: {
          entities: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          totalPages: { type: 'integer', example: 3 },
          totalItems: { type: 'integer', example: 60 },
          currentPage: { type: 'integer', example: 1 },
          itemsPerPage: { type: 'integer', example: 25 },
        },
      },
    }),
  );
}
