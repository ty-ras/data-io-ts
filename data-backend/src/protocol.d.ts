// Import generic REST-related things
import type * as spec from "@ty-ras/endpoint-spec";
import type * as protocol from "@ty-ras/protocol";
import type * as data from "@ty-ras/data";
import type * as md from "@ty-ras/metadata";

// Import plugin for IO-TS
import type * as tPluginCommon from "@ty-ras/data-io-ts";
import type * as body from "./body";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type HeaderDecoder = tPluginCommon.Decoder<any>;
export type HeaderEncoder = tPluginCommon.Encoder<any, data.HeaderValue>;

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
> = data.HttpMethodWithoutBody extends TProtocolSpec["method"]
  ? MakeSpecWithoutBody<
      TProtocolSpec,
      TFunctionality,
      TContext,
      TStateInfo,
      TState,
      TMetadataProviders
    >
  : TProtocolSpec extends protocol.ProtocolSpecRequestBody<unknown>
  ? MakeSpecWithBody<
      TProtocolSpec,
      TFunctionality,
      TContext,
      TStateInfo,
      TState,
      TMetadataProviders
    >
  : MakeSpecWithoutBody<
      TProtocolSpec,
      TFunctionality,
      TContext,
      TStateInfo,
      TState,
      TMetadataProviders
    >;

/* eslint-disable @typescript-eslint/ban-types */
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
> = (TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<
  infer TResponseHeaders
>
  ? spec.BatchSpecificationWithoutBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TProtocolSpec["method"],
      ExtractReturnType<TFunctionality>,
      body.OutputValidatorSpec<
        ExtractReturnType<TFunctionality>,
        tPluginCommon.GetEncoded<TProtocolSpec["responseBody"]>
      >,
      tPluginCommon.GetRuntime<TResponseHeaders>,
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
      body.OutputValidatorSpec<
        ExtractReturnType<TFunctionality>,
        tPluginCommon.GetEncoded<TProtocolSpec["responseBody"]>
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
> = (TProtocolSpec extends protocol.ProtocolSpecResponseHeaders<
  infer TResponseHeaders
>
  ? spec.BatchSpecificationWithBodyWithHeaders<
      TContext,
      TStateInfo,
      TState,
      TProtocolSpec["method"],
      ExtractReturnType<TFunctionality>,
      body.OutputValidatorSpec<
        ExtractReturnType<TFunctionality>,
        tPluginCommon.GetEncoded<TProtocolSpec["responseBody"]>
      >,
      tPluginCommon.GetRuntime<TResponseHeaders>,
      HeaderEncoder,
      protocol.RuntimeOf<TProtocolSpec["requestBody"]>,
      body.InputValidatorSpec<protocol.RuntimeOf<TProtocolSpec["requestBody"]>>,
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
      body.OutputValidatorSpec<
        ExtractReturnType<TFunctionality>,
        tPluginCommon.GetEncoded<TProtocolSpec["responseBody"]>
      >,
      protocol.RuntimeOf<TProtocolSpec["requestBody"]>,
      body.InputValidatorSpec<protocol.RuntimeOf<TProtocolSpec["requestBody"]>>,
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

export type ExtractReturnType<TFunctionality extends (...args: any) => any> =
  ReturnType<TFunctionality> extends Promise<infer T>
    ? T
    : ReturnType<TFunctionality>;

export type ExtractReturnTypeWithHeaders<
  TFunctionality extends (...args: any) => any,
> = ExtractReturnType<TFunctionality> extends spec.EndpointHandlerOutputWithHeaders<
  infer TOutput,
  any
>
  ? TOutput
  : never;
