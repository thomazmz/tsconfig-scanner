import { GitRepository } from './git'
import * as output from './output'
import * as utils from './utils'
import * as code from './code'
import * as json from 'json5'
import * as fs from 'fs'
import { extend } from 'joi'

export type TypescriptMetadata = {
  count: number
  paths: string[]
  path?: string
}

export type TypescriptCompilerOptions = {
  allowUnreachableCode: boolean
  allowUnusedLabels: boolean
  exactOptionalPropertyTypes: boolean
  noFallthroughCasesInSwitch: boolean
  noImplicitOverride: boolean
  noImplicitReturns: boolean
  noPropertyAccessFromIndexSignature: boolean
  noUncheckedIndexedAccess: boolean
  noUnusedLocals: boolean
  noUnusedParameters: boolean
  noImplicitAny: boolean
  noImplicitThis: boolean
  strict: boolean
  alwaysStrict: boolean
  strictNullChecks: boolean
  strictBindCallApply: boolean
  strictFunctionTypes: boolean
  strictPropertyInitialization: boolean
  useUnknownInCatchVariables: boolean
}

export function collectTypescriptMetadata(repository: GitRepository) {
  const paths = resolveTsconfigFilePaths(repository)
  
  const [ path ] = paths

  const metadata: TypescriptMetadata = { path, paths, count: paths.length }

  output.createOutputFile(repository, utils.createStringJson(metadata), 'typescript.metadata')

  return metadata
}

export function resolveTsconfigFilePaths(repository: GitRepository): string[] {
  return code.resolveCodeGlobPaths(repository, '/**/tsconfig*.json')
}

export function countTsconfigFiles(repository: GitRepository): number {
  return resolveTsconfigFilePaths(repository).length
}

export function collectTypescriptConfigValues(path: string) {
  const tsconfigFile = fs.readFileSync(path, { encoding: 'utf8' })
  return json.parse(tsconfigFile)
}

export function collectTypescriptConfigFile(repository: GitRepository, path: string) {
  const tsconfigValues = collectTypescriptConfigValues(path)
  output.createTypescriptConfigFile(repository, tsconfigValues)
}

export function collectTypescriptOptions(repository: GitRepository, path: string): TypescriptCompilerOptions {
  const { compilerOptions, extends: extendss } = collectTypescriptConfigValues(path)

  if(extendss) {
    throw new Error(`Could not collect compiler options. Config file is an extension.`)
  }

  if(!compilerOptions) {
    throw new Error(`Could not collect compiler options. Project configfile does not contain compiler options.`)
  }

  const { strict , ...additionalCompilerOptions } = compilerOptions

  const typescriptCompilerOptions = {
    strict,
    allowUnreachableCode: additionalCompilerOptions.allowUnreachableCode ?? false,
    allowUnusedLabels: additionalCompilerOptions.allowUnusedLabels ?? false,
    exactOptionalPropertyTypes: additionalCompilerOptions.exactOptionalPropertyTypes ?? false,
    noFallthroughCasesInSwitch: additionalCompilerOptions.noFallthroughCasesInSwitch ?? false,
    noImplicitOverride: additionalCompilerOptions.noImplicitOverride ?? false,
    noImplicitReturns: additionalCompilerOptions.noImplicitReturns ?? false,
    noPropertyAccessFromIndexSignature: additionalCompilerOptions.noPropertyAccessFromIndexSignature ?? false,
    noUncheckedIndexedAccess: additionalCompilerOptions.noUncheckedIndexedAccess ?? false,
    noUnusedLocals: additionalCompilerOptions.noUnusedLocals ?? false,
    noUnusedParameters: additionalCompilerOptions.noUnusedParameters ?? false,
    noImplicitAny: additionalCompilerOptions.noImplicitAny ?? strict ?? false,
    noImplicitThis: additionalCompilerOptions.noImplicitThis ?? strict ?? false,
    alwaysStrict: additionalCompilerOptions.alwaysStrict ?? strict ?? false,
    strictNullChecks: additionalCompilerOptions.strictNullChecks ?? strict ?? false,
    strictBindCallApply: additionalCompilerOptions.strictBindCallApply ?? strict ?? false,
    strictFunctionTypes: additionalCompilerOptions.strictFunctionTypes ?? strict ?? false,
    strictPropertyInitialization: additionalCompilerOptions.strictPropertyInitialization ?? strict ?? false,
    useUnknownInCatchVariables: additionalCompilerOptions.useUnknownInCatchVariables ?? strict ?? false,
  }

  output.createTypescriptOptionsFile(repository, typescriptCompilerOptions)

  return typescriptCompilerOptions
}
