/**
 * @file This types-only file contains types related to extracting batch spec types of {@link spec} library from protocol types of {@link protocol} library.
 */

import type * as spec from "@ty-ras/endpoint-spec";
import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import type * as md from "@ty-ras/metadata";
import type * as dataIOTS from "@ty-ras/data-io-ts";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

/**
 * This type defines the decoder (deserializer) for request/response header values.
 */
export type HeaderDecoder = dataIOTS.Decoder<any>;

/**
 * This type defines the encoder (serializer) for request/response header values.
 */
export type HeaderEncoder = dataIOTS.Encoder<any, data.HeaderValue>;

/**
 * This is helper type to create batch spec type of TyRAS {@link spec} library from the given protocol type of TyRAS {@link protocol} library.
 */
export type EndpointSpec<
  TProtocolSpec extends protocol.ProtocolSpecCore<string, unknown>,
  TFunctionality extends (...args: any) => any,
  TContext,
  TStateInfo,
  TState,
  TMetadataProviders extends Record<
    string,
    md.MetadataProviderForEndpoints<any, any, any, any, any, any, any>
  >,
  TRequestBodyContentType extends string,
  TResponseBodyContentType extends string,
> = data.HttpMethodWithoutBody extends TProtocolSpec["method"]
  ? MakeSpecWithoutBody<
      TProtocolSpec,
      TFunctionality,
      TContext,
      TStateInfo,
      TState,
      TMetadataProviders,
      TResponseBodyContentType
    >
  : TProtocolSpec extends protocol.ProtocolSpecRequestBody<unknown>
  ? MakeSpecWithBody<
      TProtocolSpec,
      TFunctionality,
      TContext,
      TStateInfo,
      TState,
      TMetadataProviders,
      TRequestBodyContentType,
      TResponseBodyContentType
    >
  : MakeSpecWithoutBody<
      TProtocolSpec,
      TFunctionality,
      TContext,
      TStateInfo,
      TState,
      TMetadataProviders,
      TRequestBodyContentType
    >;

/**
 * This is helper type used by {@link EndpointSpec}. It is not meant to be used directly by client code.
 */
export type MakeSpecWithoutBody<
  TProtocolSpec extends protocol.ProtocolSpecCore<string, unknown>,
  TFunctionality extends (...args: any) => any,
  TContext,
  TStateInfo,
  TState,
  TMetadataProviders extends Record<
    string,
    md.MetadataProviderForEndpoints<any, any, any, any, any, any, any>
  >,
  TResponseBodyContentType extends string,
> = (TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<
  infer TResponseHeaders
>
  ? spec.BatchSpecificationWithoutBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TProtocolSpec["method"],
      ExtractReturnType<TFunctionality>,
      OutputValidatorSpec<
        ExtractReturnType<TFunctionality>,
        dataIOTS.GetEncoded<TProtocolSpec["responseBody"]>,
        TResponseBodyContentType
      >,
      dataIOTS.GetRuntime<TResponseHeaders>,
      HeaderEncoder,
      {} & (TProtocolSpec extends protocol.ProtocolSpecURL<infer TURLData>
        ? spec.EndpointHandlerArgsWithURL<protocol.RuntimeOf<TURLData>>
        : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecQuery<infer TQuery>
          ? spec.EndpointHandlerArgsWithQuery<protocol.RuntimeOf<TQuery>>
          : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecHeaderData<
          infer THeaderData
        >
          ? spec.EndpointHandlerArgsWithHeaders<protocol.RuntimeOf<THeaderData>>
          : {}),
      TMetadataProviders
    >
  : spec.BatchSpecificationWithoutBody<
      TContext,
      TStateInfo,
      TState,
      TProtocolSpec["method"],
      ExtractReturnType<TFunctionality>,
      OutputValidatorSpec<
        ExtractReturnType<TFunctionality>,
        dataIOTS.GetEncoded<TProtocolSpec["responseBody"]>,
        TResponseBodyContentType
      >,
      {} & (TProtocolSpec extends protocol.ProtocolSpecURL<infer TURLData>
        ? spec.EndpointHandlerArgsWithURL<protocol.RuntimeOf<TURLData>>
        : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecQuery<infer TQuery>
          ? spec.EndpointHandlerArgsWithQuery<protocol.RuntimeOf<TQuery>>
          : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecHeaderData<
          infer THeaderData
        >
          ? spec.EndpointHandlerArgsWithHeaders<protocol.RuntimeOf<THeaderData>>
          : {}),
      TMetadataProviders
    > & {
      [P in keyof spec.BatchSpecificationResponseHeaderArgs<
        never,
        never
      >]?: never;
    }) &
  (TProtocolSpec extends protocol.ProtocolSpecQuery<infer TQuery>
    ? spec.BatchSpecificationQueryArgs<
        protocol.RuntimeOf<TQuery>,
        HeaderDecoder
      >
    : { [P in keyof spec.BatchSpecificationQueryArgs<never, never>]?: never }) &
  (TProtocolSpec extends protocol.ProtocolSpecHeaderData<infer THeaderData>
    ? spec.BatchSpecificationHeaderArgs<
        protocol.RuntimeOf<THeaderData>,
        HeaderDecoder
      >
    : { [P in keyof spec.BatchSpecificationHeaderArgs<never, never>]?: never });

/**
 * This is helper type used by {@link EndpointSpec}. It is not meant to be used directly by client code.
 */
export type MakeSpecWithBody<
  TProtocolSpec extends protocol.ProtocolSpecCore<string, unknown> &
    protocol.ProtocolSpecRequestBody<unknown>,
  TFunctionality extends (...args: any) => any,
  TContext,
  TStateInfo,
  TState,
  TMetadataProviders extends Record<
    string,
    md.MetadataProviderForEndpoints<any, any, any, any, any, any, any>
  >,
  TRequestBodyContentType extends string,
  TResponseBodyContentType extends string,
> = (TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<
  infer TResponseHeaders
>
  ? spec.BatchSpecificationWithBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TProtocolSpec["method"],
      ExtractReturnType<TFunctionality>,
      OutputValidatorSpec<
        ExtractReturnType<TFunctionality>,
        dataIOTS.GetEncoded<TProtocolSpec["responseBody"]>,
        TResponseBodyContentType
      >,
      dataIOTS.GetRuntime<TResponseHeaders>,
      HeaderEncoder,
      protocol.RuntimeOf<TProtocolSpec["requestBody"]>,
      InputValidatorSpec<
        protocol.RuntimeOf<TProtocolSpec["requestBody"]>,
        TRequestBodyContentType
      >,
      {} & (TProtocolSpec extends protocol.ProtocolSpecURL<infer TURLData>
        ? spec.EndpointHandlerArgsWithURL<protocol.RuntimeOf<TURLData>>
        : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecQuery<infer TQuery>
          ? spec.EndpointHandlerArgsWithQuery<protocol.RuntimeOf<TQuery>>
          : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecHeaderData<
          infer THeaderData
        >
          ? spec.EndpointHandlerArgsWithHeaders<protocol.RuntimeOf<THeaderData>>
          : {}),
      TMetadataProviders
    >
  : spec.BatchSpecificationWithBody<
      TContext,
      TStateInfo,
      TState,
      TProtocolSpec["method"],
      ExtractReturnType<TFunctionality>,
      OutputValidatorSpec<
        ExtractReturnType<TFunctionality>,
        dataIOTS.GetEncoded<TProtocolSpec["responseBody"]>,
        TResponseBodyContentType
      >,
      protocol.RuntimeOf<TProtocolSpec["requestBody"]>,
      InputValidatorSpec<
        protocol.RuntimeOf<TProtocolSpec["requestBody"]>,
        TRequestBodyContentType
      >,
      {} & (TProtocolSpec extends protocol.ProtocolSpecURL<infer TURLData>
        ? spec.EndpointHandlerArgsWithURL<protocol.RuntimeOf<TURLData>>
        : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecQuery<infer TQuery>
          ? spec.EndpointHandlerArgsWithQuery<protocol.RuntimeOf<TQuery>>
          : {}) &
        (TProtocolSpec extends protocol.ProtocolSpecHeaderData<
          infer THeaderData
        >
          ? spec.EndpointHandlerArgsWithHeaders<protocol.RuntimeOf<THeaderData>>
          : {}),
      TMetadataProviders
    > & {
      [P in keyof spec.BatchSpecificationResponseHeaderArgs<
        never,
        never
      >]?: never;
    }) &
  (TProtocolSpec extends protocol.ProtocolSpecQuery<infer TQuery>
    ? spec.BatchSpecificationQueryArgs<
        protocol.RuntimeOf<TQuery>,
        HeaderDecoder
      >
    : { [P in keyof spec.BatchSpecificationQueryArgs<never, never>]?: never }) &
  (TProtocolSpec extends protocol.ProtocolSpecHeaderData<infer THeaderData>
    ? spec.BatchSpecificationHeaderArgs<
        protocol.RuntimeOf<THeaderData>,
        HeaderDecoder
      >
    : { [P in keyof spec.BatchSpecificationHeaderArgs<never, never>]?: never });

/**
 * This is helper type used by {@link EndpointSpec}. It is not meant to be used directly by client code.
 */
export type ExtractReturnType<TFunctionality extends (...args: any) => any> =
  ReturnType<TFunctionality> extends Promise<infer T>
    ? T
    : ReturnType<TFunctionality>;

/**
 * This is helper type used by {@link EndpointSpec}. It is not meant to be used directly by client code.
 */
export type ExtractReturnTypeWithHeaders<
  TFunctionality extends (...args: any) => any,
> =
  ExtractReturnType<TFunctionality> extends spec.EndpointHandlerOutputWithHeaders<
    infer TOutput,
    any
  >
    ? TOutput
    : never;

/**
 * This type contains the definition for `input` property of {@link spec.EndpointSpecArgsJustBody}.
 */
export type InputValidatorSpec<TData, TContentType extends string> = {
  [P in TContentType]: dataIOTS.Decoder<TData>;
};

/**
 * This type contains the definition for `output` property of {@link spec.EndpointSpecArgsJustResponseBody}.
 */
export type OutputValidatorSpec<
  TOutput,
  TSerialized,
  TContentType extends string,
> = {
  [P in TContentType]: dataIOTS.Encoder<TOutput, TSerialized>;
};
