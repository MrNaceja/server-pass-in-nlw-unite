import {
  ContextConfigDefault,
  FastifyBaseLogger,
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RouteGenericInterface,
  RouteHandlerMethod,
} from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export type RouterSchemeHandler<RouteSchema extends FastifySchema> =
  RouteHandlerMethod<
    RawServerBase,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    RouteGenericInterface,
    ContextConfigDefault,
    RouteSchema,
    ZodTypeProvider,
    FastifyBaseLogger
  >;
