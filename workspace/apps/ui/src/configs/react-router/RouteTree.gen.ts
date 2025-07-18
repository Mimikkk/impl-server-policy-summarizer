/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './../../routes/__root'
import { Route as EliIndexRouteImport } from './../../routes/eli/index'
import { Route as DxRoutesRouteImport } from './../../routes/dx/routes'
import { Route as DxComponentsRouteImport } from './../../routes/dx/components'
import { Route as DxColorPaletteRouteImport } from './../../routes/dx/color-palette'

const EliIndexRoute = EliIndexRouteImport.update({
  id: '/eli/',
  path: '/eli/',
  getParentRoute: () => rootRouteImport,
} as any)
const DxRoutesRoute = DxRoutesRouteImport.update({
  id: '/dx/routes',
  path: '/dx/routes',
  getParentRoute: () => rootRouteImport,
} as any)
const DxComponentsRoute = DxComponentsRouteImport.update({
  id: '/dx/components',
  path: '/dx/components',
  getParentRoute: () => rootRouteImport,
} as any)
const DxColorPaletteRoute = DxColorPaletteRouteImport.update({
  id: '/dx/color-palette',
  path: '/dx/color-palette',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/dx/color-palette': typeof DxColorPaletteRoute
  '/dx/components': typeof DxComponentsRoute
  '/dx/routes': typeof DxRoutesRoute
  '/eli': typeof EliIndexRoute
}
export interface FileRoutesByTo {
  '/dx/color-palette': typeof DxColorPaletteRoute
  '/dx/components': typeof DxComponentsRoute
  '/dx/routes': typeof DxRoutesRoute
  '/eli': typeof EliIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/dx/color-palette': typeof DxColorPaletteRoute
  '/dx/components': typeof DxComponentsRoute
  '/dx/routes': typeof DxRoutesRoute
  '/eli/': typeof EliIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/dx/color-palette' | '/dx/components' | '/dx/routes' | '/eli'
  fileRoutesByTo: FileRoutesByTo
  to: '/dx/color-palette' | '/dx/components' | '/dx/routes' | '/eli'
  id:
    | '__root__'
    | '/dx/color-palette'
    | '/dx/components'
    | '/dx/routes'
    | '/eli/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  DxColorPaletteRoute: typeof DxColorPaletteRoute
  DxComponentsRoute: typeof DxComponentsRoute
  DxRoutesRoute: typeof DxRoutesRoute
  EliIndexRoute: typeof EliIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/eli/': {
      id: '/eli/'
      path: '/eli'
      fullPath: '/eli'
      preLoaderRoute: typeof EliIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/dx/routes': {
      id: '/dx/routes'
      path: '/dx/routes'
      fullPath: '/dx/routes'
      preLoaderRoute: typeof DxRoutesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/dx/components': {
      id: '/dx/components'
      path: '/dx/components'
      fullPath: '/dx/components'
      preLoaderRoute: typeof DxComponentsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/dx/color-palette': {
      id: '/dx/color-palette'
      path: '/dx/color-palette'
      fullPath: '/dx/color-palette'
      preLoaderRoute: typeof DxColorPaletteRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  DxColorPaletteRoute: DxColorPaletteRoute,
  DxComponentsRoute: DxComponentsRoute,
  DxRoutesRoute: DxRoutesRoute,
  EliIndexRoute: EliIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
