import type { Table } from "../types.ts";

const ContentSymbol = Symbol("FeatureContent");
const OptionsSymbol = Symbol("FeatureOptions");
const StateSymbol = Symbol("FeatureState");

export interface TableFeature<TContent, TState, TOptions> {
  [ContentSymbol]: TContent;
  [OptionsSymbol]: TOptions;
  [StateSymbol]: TState;
}

export type FeatureContentOf<TFeature extends TableFeature<any, any, any>> = TFeature extends
  TableFeature<infer TContent, any, any> ? TContent : never;

export type FeatureOptionsOf<TFeature extends TableFeature<any, any, any>> = TFeature extends
  TableFeature<any, any, infer TOptions> ? TOptions : never;

export type FeatureStateOf<TFeature extends TableFeature<any, any, any>> = TFeature extends
  TableFeature<any, infer TState, any> ? TState : never;

export interface FeatureBuilder<
  TFeature extends TableFeature<any, any, any>,
> {
  <TTable extends Table<any, any>>(api: TTable, options: FeatureOptionsOf<TFeature>): FeatureContentOf<TFeature>;
}

export const defineFeature = <TFeature extends TableFeature<any, any, any>>(
  define: FeatureBuilder<TFeature>,
): FeatureBuilder<TFeature> => define;
